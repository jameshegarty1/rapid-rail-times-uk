from app.core.celery_app import celery_app
from loguru import logger
from typing import List
from zeep import Client, Settings, xsd
from zeep.plugins import HistoryPlugin
from fastapi import HTTPException
from collections import OrderedDict
from datetime import datetime, timedelta
import pytz
import redis
import json

LDB_TOKEN='55435278-c2e4-4799-8636-ffbe1136dcae'
WSDL='http://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2021-11-01'

redis_client_cache = redis.Redis(host='redis', port=6379, db=1)

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
    
    # Implement caching logic here
    # If forceFetch is True, skip the cache and fetch fresh data

    cache_key = f"train_routes:{'-'.join(origins)}:{'-'.join(destinations)}"

    if not forceFetch:
        cached_data = redis_client_cache.get(cache_key)
        if cached_data:
            logger.info("Returning cached data")
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
                    raise HTTPException(status_code=404, detail="No train services found")
            
                services = response.trainServices.service
                logger.info(f"Trains from {response.locationName}")
 
                latest_departure_time = None

                for service in services:
                    train_data = {
                        "service_id": service.serviceID,
                        "scheduled_departure": service.std,
                        "estimated_departure": service.etd,
                        "platform": service.platform,
                        "destination": service.destination.location[0].locationName,
                        "via": service.destination.location[0].via,
                        "length": service.length,
                        "operator": service.operator,
                        "is_cancelled": service.isCancelled,
                        "delay_reason": service.delayReason,
                        "cancel_reason": service.cancelReason,
                        "subsequent_calling_points": serialize_calling_points(service.subsequentCallingPoints.callingPointList)
                    }

                    today = datetime.now(london_tz).date()
                    departure_time = london_tz.localize(datetime.combine(today, datetime.strptime(train_data['scheduled_departure'], '%H:%M').time()))

                    logger.info(f"Service {train_data['service_id']} scheduled at {departure_time}")

                    if latest_departure_time is None or departure_time > latest_departure_time:
                        latest_departure_time = departure_time
                        logger.info(f"New latest departure time: {latest_departure_time}")
 
                    if filter_trains_by_destinations(train_data,destinations):
                        logger.info(f"Train with ID {train_data['service_id']} calls at one of our destinations!")
                        if train_data['service_id'] not in train_service_ids:
                            train_info_arr.append(train_data)
                            train_service_ids.append(train_data['service_id'])

                if latest_departure_time:
                    now = datetime.now(london_tz)
                    logger.info(f"Time now: {now}")
                    time_offset = int((latest_departure_time - now).total_seconds() / 60)
                    logger.info(f"Time offset = {time_offset}")

                remaining_time_window -= time_offset
                logger.info(f"Remaining time to search: {remaining_time_window}")
 
            except Exception as e:
                logger.error(f"Error fetching train routes: {e}")
                raise HTTPException(status_code=500, detail="Failed to fetch train routes")

    redis_client_cache.setex(cache_key, timedelta(minutes=2), json.dumps(train_info_arr))
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
        serialized.append({'crs': point['crs'], 'location_name': point['locationName']})
    return serialized

