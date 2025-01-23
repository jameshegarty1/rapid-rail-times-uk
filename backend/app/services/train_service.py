# app/services/train_service.py
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import time
import pytz
import logging
import requests
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from zeep import Client, Settings, xsd, Transport
from zeep.plugins import HistoryPlugin
from app.db.models.train_model import KnownService
from app.db.crud.train_crud import (
    get_services_for_origin,
    create_or_update_service,
)
import os
log = structlog.get_logger("service.train")

class TrainService:
    def __init__(self, db: Session, soap_client: Client):
        self.db = db
        self.soap_client = soap_client
        self.london_tz = pytz.timezone('Europe/London')

    @staticmethod
    def _generate_service_id(origin: str, destination: str, departure_time: str) -> str:
        return f"{origin}-{destination}-{departure_time.replace(':', '')}"

    @staticmethod
    def _service_serves_destinations(service: KnownService, destinations: List[str]) -> bool:
        service_stops = {cp["crs"] for cp in service.calling_points}
        return bool(service_stops & set(destinations))

    @staticmethod
    def _get_latest_time(services: List[Any]) -> Optional[str]:
        try:
            return max(s.std for s in services) if services else None
        except Exception as e:
            log.error("Error getting latest time", error=str(e))
            return None

    def get_train_routes(self, origins: List[str], destinations: List[str], force_fetch: bool = False) -> List[dict]:
        """Get train routes between origins and destinations."""
        now = datetime.now(self.london_tz)
        start_time = time.time()
        result_services = []

        log.info(
            "train.routes.fetch.start",
            origins=origins,
            destinations=destinations,
            force_fetch=force_fetch
        )

        for origin in origins:
            origin_start = time.time()
            # Get latest departure board always
            departures = self._get_departure_board(origin)
            if not departures:
                continue

            log.info(
                "train.departures.fetched",
                origin=origin,
                count=len(departures),
                elapsed_ms=int((time.time() - origin_start) * 1000)
            )

            # Get known services for this origin
            db_start = time.time()
            known_services = [] if force_fetch else get_services_for_origin(
                self.db,
                origin=origin,
                current_time=now,
                window_minutes=60
            )
            log.info(
                "train.db.fetch",
                origin=origin,
                cached_services=len(known_services),
                elapsed_ms=int((time.time() - db_start) * 1000)
            )

            known_service_map = {
                self._generate_service_id(s.origin, s.destination, s.scheduled_departure): s
                for s in known_services
            }

            services_to_fetch = []
            for departure in departures:
                service_id = self._generate_service_id(
                    origin,
                    departure['destination'],
                    departure['std']
                )

                if service_id in known_service_map and not force_fetch:
                    # We have cached data for this service
                    known_service = known_service_map[service_id]
                    if self._service_serves_destinations(known_service, destinations):
                        service_dict = known_service.to_dict()
                        service_dict.update({
                            'estimated_departure': departure['etd'],
                            'platform': departure['platform'],
                            'is_cancelled': departure['is_cancelled'],
                            'delay_reason': departure['delay_reason'],
                            'cancel_reason': departure['cancel_reason'],
                            'coaches': departure['length'],
                        })
                        result_services.append(service_dict)
                else:
                    services_to_fetch.append(departure)

            if services_to_fetch:
                log.info(
                    "train.details.needed",
                    origin=origin,
                    services_to_fetch=len(services_to_fetch),
                    force_fetch=force_fetch
                )
                for i in range(0, len(services_to_fetch), 10):
                    batch = services_to_fetch[i:i + 10]
                    first_departure = batch[0]['std']

                    details_start = time.time()

                    details = self._get_departure_board_with_details(
                        origin,
                        time_offset=self._calculate_offset(first_departure),
                        time_window=30  # Small window to catch this batch
                    )

                    details_duration = int((time.time() - details_start) * 1000)

                    log.info(
                        "train.details.fetched",
                        origin=origin,
                        batch_start=i,
                        batch_size=len(batch),
                        details_found=len(details),
                        elapsed_ms=details_duration
                    )

                    for detail in details:
                        # Store in DB
                        service = create_or_update_service(
                            self.db,
                            service_id=self._generate_service_id(
                                origin,
                                detail['destination'],
                                detail['scheduled_departure']
                            ),
                            origin=origin,
                            destination=detail['destination'],
                            destination_name=detail['destination_name'],
                            scheduled_departure=detail['scheduled_departure'],
                            calling_points=detail['calling_points'],
                            operator=detail['operator']
                        )

                        if self._service_serves_destinations(service, destinations):
                            # Find matching real-time data
                            departure = next(
                                (d for d in batch
                                 if d['std'] == detail['scheduled_departure'] and
                                 d['destination'] == detail['destination']),
                                None
                            )
                            log.info(batch, detail)
                            if departure:
                                service_dict = service.to_dict()
                                service_dict.update({
                                    'estimated_departure': departure['etd'],
                                    'platform': departure['platform'],
                                    'is_cancelled': departure['is_cancelled'],
                                    'delay_reason': departure['delay_reason'],
                                    'cancel_reason': departure['cancel_reason'],
                                    'coaches': departure['length'],
                                })
                                result_services.append(service_dict)

            total_duration = int((time.time() - start_time) * 1000)
            log.info(
                "train.routes.fetch.complete",
                origins=origins,
                services_found=len(result_services),
                total_elapsed_ms=total_duration
            )

        return sorted(result_services, key=lambda x: x['scheduled_departure'])


    def _get_departure_board(self, origin: str) -> List[dict]:
        """Get real-time data with fast endpoint."""
        start_time = time.time()
        log.info("train.board.fetch.start", origin=origin)
        response = self.soap_client.service.GetDepartureBoard(
            numRows=150,
            crs=origin,
            timeOffset=0,
            timeWindow=60
        )
        elapsed_ms = int((time.time() - start_time) * 1000)


        if not response or not response.trainServices:
            log.warning(
                "train.board.empty",
                origin=origin,
                elapsed_ms=elapsed_ms
            )
            return []

        services = [
            {
                'destination': s.destination.location[0].crs,
                'destination_name': s.destination.location[0].locationName,
                'std': s.std,
                'etd': s.etd,
                'platform': getattr(s, 'platform', None),
                'is_cancelled': getattr(s, 'isCancelled', False),
                'delay_reason': getattr(s, 'delayReason', None),
                'cancel_reason': getattr(s, 'cancelReason', None),
                'length': getattr(s, 'length', None)
            }
            for s in response.trainServices.service
        ]

        log.info(
            "train.board.fetch.success",
            origin=origin,
            services_found=len(services),
            elapsed_ms=elapsed_ms
        )

        return services

    def _get_departure_board_with_details(self, origin: str, time_offset: int, time_window: int) -> List[dict]:
        """Get calling points data with detailed endpoint."""
        start_time = time.time()
        log.info(
            "train.details.fetch.start",
            origin=origin,
            time_offset=time_offset,
            time_window=time_window
        )

        response = self.soap_client.service.GetDepBoardWithDetails(
            numRows=10,
            crs=origin,
            timeOffset=time_offset,
            timeWindow=time_window
        )

        elapsed_ms = int((time.time() - start_time) * 1000)

        if not response or not response.trainServices:
            log.warning(
                "train.details.empty",
                origin=origin,
                time_offset=time_offset,
                elapsed_ms=elapsed_ms
            )
            return []

        services = [
            {
                'destination': s.destination.location[0].crs,
                'destination_name': s.destination.location[0].locationName,
                'scheduled_departure': s.std,
                'operator': s.operator,
                'calling_points': [
                    {
                        'crs': p.crs,
                        'station_name': p.locationName,
                        'scheduled_time': p.st
                    }
                    for p in s.subsequentCallingPoints.callingPointList[0].callingPoint
                ]
            }
            for s in response.trainServices.service
        ]

        log.info(
            "train.details.fetch.success",
            origin=origin,
            time_offset=time_offset,
            services_found=len(services),
            elapsed_ms=elapsed_ms
        )

        return services

    def _calculate_offset(self, target_time: str) -> int:
        """Calculate minutes offset needed to include target time."""
        now = datetime.now(self.london_tz)
        current_time = now.strftime("%H:%M")

        # Convert both to minutes since midnight
        current_mins = int(current_time.split(":")[0]) * 60 + int(current_time.split(":")[1])
        target_mins = int(target_time.split(":")[0]) * 60 + int(target_time.split(":")[1])

        # Calculate difference
        diff = target_mins - current_mins
        return max(0, diff)


    def _store_service(self, service: Any) -> Optional[KnownService]:
        """Store a service in the database."""
        try:
            calling_points = [
                {
                    "crs": point.crs,
                    "location_name": point.locationName,
                    "st": point.st
                }
                for point in service.subsequentCallingPoints.callingPointList[0].callingPoint
            ]

            origin = service.origin.location[0].crs
            destination = service.destination.location[0].crs
            departure_time = service.std

            service_id = self._generate_service_id(origin, destination, departure_time)

            return create_or_update_service(
                self.db,
                service_id=service_id,
                origin=origin,
                destination=destination,
                scheduled_departure=service.std,
                calling_points=calling_points,
                operator=service.operator,
            )
        except Exception as e:
            log.error("Error storing service", error=str(e), service_id=service.serviceID)
            return None


def create_train_service(db: Session) -> TrainService:
    """Create and configure train service instance with controlled logging."""
    # Configure Zeep logging
    zeep_logger = logging.getLogger('zeep')
    zeep_logger.setLevel(logging.WARNING)  # Only show warnings and errors

    # Configure transport with timeout
    session = requests.Session()
    session.verify = True
    transport = Transport(session=session, timeout=10)

    # Configure Zeep settings
    settings = Settings(strict=False, xml_huge_tree=True)
    history = HistoryPlugin()

    client = Client(
        wsdl=os.getenv('WSDL'),
        settings=settings,
        transport=transport,
        plugins=[history]
    )

    # Add authentication header
    header = xsd.Element(
        '{http://thalesgroup.com/RTTI/2013-11-28/Token/types}AccessToken',
        xsd.ComplexType([
            xsd.Element(
                '{http://thalesgroup.com/RTTI/2013-11-28/Token/types}TokenValue',
                xsd.String()),
        ])
    )
    header_value = header(TokenValue=os.getenv('LDB_TOKEN'))
    client.set_default_soapheaders([header_value])

    return TrainService(db=db, soap_client=client)
