from loguru import logger
from typing import List
from zeep import Client, Settings, xsd
from zeep.plugins import HistoryPlugin
from datetime import datetime, timedelta
import pytz
import json
import os
from app.exceptions import TrainServiceException
from app.services.cache_service import CacheService

LDB_TOKEN = os.getenv('LDB_TOKEN')
WSDL = os.getenv('WSDL')


cache_service = CacheService()


def create_soap_client(wsdl: str, token: str) -> Client:
    settings = Settings(strict=False)
    history = HistoryPlugin()
    client = Client(wsdl=wsdl, settings=settings, plugins=[history])

    header = xsd.Element(
        '{http://thalesgroup.com/RTTI/2013-11-28/Token/types}AccessToken',
        xsd.ComplexType([
            xsd.Element(
                '{http://thalesgroup.com/RTTI/2013-11-28/Token/types}TokenValue',
                xsd.String()),
        ])
    )
    header_value = header(TokenValue=token)
    client.set_default_soapheaders([header_value])

    return client

def get_train_routes(origins: List[str], destinations: List[str], forceFetch: bool) -> List[dict]:
    logger.info(f"Fetching train routes for {origins} to {destinations} with forceFetch={forceFetch}")
    cache_key = f"train_routes:{'-'.join(origins)}:{'-'.join(destinations)}"

    if not forceFetch:
        cached_data = cache_service.get(cache_key)
        if cached_data:
            logger.info("Returning cached data:")

            return cached_data

    client = create_soap_client(WSDL, LDB_TOKEN)
    london_tz = pytz.timezone('Europe/London')

    logger.info("in get_train_routes")

    total_time_window = 60
    train_info_arr = []
    train_service_ids = []

    for origin in origins:
        time_offset = 0
        remaining_time_window = total_time_window
        while remaining_time_window > 0:
            try:
                response = client.service.GetDepBoardWithDetails(numRows=10,crs=origin,timeOffset=time_offset)
                if response.trainServices is None:
                    raise TrainServiceException(status_code=404, detail="No train services found")

                services = response.trainServices.service
                logger.info(f"Trains from {response.locationName}")

                latest_departure_time = None

                for service in services:
                    train_data = {
                        "service_id": service.serviceID,
                        "scheduled_departure": service.std,
                        "estimated_departure": service.etd,
                        "platform": service.platform,
                        "origin": origin,
                        "destination": service.destination.location[0].locationName,
                        "via": service.destination.location[0].via,
                        "length": service.length,
                        "operator": service.operator,
                        "is_cancelled": service.isCancelled,
                        "delay_reason": service.delayReason,
                        "cancel_reason": service.cancelReason,
                        "subsequent_calling_points": serialize_calling_points(service.subsequentCallingPoints.callingPointList)
                    }

                    now_utc = datetime.now(pytz.utc)
                    now = now_utc.astimezone(london_tz)
                    today = now.date()
                    scheduled_time_naive = datetime.combine(today, datetime.strptime(train_data['scheduled_departure'], '%H:%M').time())
                    scheduled_time = london_tz.localize(scheduled_time_naive)
                    estimated_time = None

                    if train_data['estimated_departure'] != 'On time':
                        try:
                            estimated_time = datetime.combine(today, datetime.strptime(train_data['estimated_departure'], '%H:%M').time())
                            estimated_time = estimated_time.astimezone(london_tz)
                            logger.info(f"Set estimated time to {estimated_time}")
                        except ValueError:
                            estimated_time = scheduled_time
                    else:
                        estimated_time = scheduled_time

                    if estimated_time and estimated_time < scheduled_time:
                        estimated_time += timedelta(days=1)

                    #if scheduled_time < now:
                        #scheduled_time += timedelta(days=1)

                    logger.info(f"Now: {now}")
                    logger.info(f"Scheduled Departure time: {scheduled_time}")
                    logger.info(f"Estimated Departure time: {estimated_time}")
                    logger.info(f"Service {train_data['service_id']} actual departure at {estimated_time.strftime('%Y-%m-%d %H:%M:%S')}")

                    if latest_departure_time is None or scheduled_time > latest_departure_time:
                        latest_departure_time = scheduled_time
                        logger.info(f"New latest departure time: {latest_departure_time}")
 
                    if filter_trains_by_destinations(train_data, destinations):
                        logger.info(f"Train with ID {train_data['service_id']} calls at one of our destinations!")
                        if train_data['service_id'] not in train_service_ids:
                            train_info_arr.append(train_data)
                            train_service_ids.append(train_data['service_id'])

                if latest_departure_time:
                    now_utc = datetime.now(pytz.utc)
                    logger.info(f"Time now UTC: {now_utc}")
                    now = now_utc.astimezone(london_tz)
                    logger.info(f"Time now: {now}")
                    logger.info(f"Latest dep. time in last batch: {latest_departure_time}")
                    time_offset = int((latest_departure_time - now).total_seconds() / 60)
                    if time_offset < 0:
                        time_offset = 0
                    logger.info(f"Time offset = {time_offset}")

                remaining_time_window -= time_offset
                logger.info(f"Remaining time to search: {remaining_time_window}")
 
            except Exception as e:
                logger.error(f"Error fetching train routes: {e}")
                raise TrainServiceException(status_code=500, detail="Failed to fetch train routes")

    # sort
    sort_trains(train_info_arr)

    # cache
    cache_service.setex(cache_key, timedelta(minutes=2), json.dumps(train_info_arr))
    logger.info("Data cached")

    return train_info_arr


def filter_trains_by_destinations(train_data, destinations):
    destination_set = set(destinations)
    matches = False
    points_crs = [point['crs'] for point in train_data['subsequent_calling_points']]

    for dest in destination_set:
        logger.info(f"Checking for destination {dest} in calling points: {points_crs}")
        if dest in points_crs:
            matches = True

    return matches

def serialize_calling_points(calling_points):
    logger.info("Attempting serialization...")
    serialized = []
    for point in calling_points[0]['callingPoint']:
        serialized.append({'crs': point['crs'], 'location_name': point['locationName'], 'st': point['st'], 'et': point['et'], 'at': point['at']})
    return serialized


def sort_trains(trains):
    # Sort the train_info_arr by scheduled_departure
    trains.sort(key=lambda x: datetime.strptime(x['scheduled_departure'], '%H:%M'))


