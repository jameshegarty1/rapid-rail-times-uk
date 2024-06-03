import os
from loguru import logger
from typing import List
from zeep import Client, Settings, xsd
from zeep.plugins import HistoryPlugin
from fastapi import HTTPException

LDB_TOKEN='55435278-c2e4-4799-8636-ffbe1136dcae'
WSDL='http://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2021-11-01'



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

def get_train_routes(origin: str, destination: str) -> List[dict]:
    client = create_soap_client(WSDL, LDB_TOKEN)

    try:
        response = client.service.GetDepBoardWithDetails(numRows=10, crs=origin)
        if response.trainServices is None:
            raise HTTPException(status_code=404, detail="No train services found")
        
        services = response.trainServices.service
        logger.info(f"Trains at {response.locationName}")
        logger.info("===============================================================================")

        train_info = []
        for service in services:
            train_data = {
                "scheduled_departure": service.std,
                "estimated_departure": service.etd,
                "destination": service.destination.location[0].locationName
            }
            logger.info(f"{train_data['scheduled_departure']} to {train_data['destination']} - {train_data['estimated_departure']}")
            train_info.append(train_data)

        return train_info

    except Exception as e:
        logger.error(f"Error fetching train routes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch train routes")

