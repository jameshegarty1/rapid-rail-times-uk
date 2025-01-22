# app/db/schemas/train_schema.py
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, time

class CallingPoint(BaseModel):
    crs: str
    station_name: str
    scheduled_time: str

class KnownServiceBase(BaseModel):
    service_id: str
    origin: str
    destination: str
    destination_name: str
    scheduled_departure: time
    calling_points: List[Dict]
    operator: str
    discovered_at: datetime

class KnownService(KnownServiceBase):
    id: int

    class Config:
        from_attributes = True
