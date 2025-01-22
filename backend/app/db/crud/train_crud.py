from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import structlog
from app.db.models.train_model import KnownService

log = structlog.get_logger("train_crud")

def get_services_for_origin(
        db: Session,
        origin: str,
        current_time: datetime,
        window_minutes: int = 60
) -> List[KnownService]:
    """Get known services from an origin within time window."""
    try:
        start_time = current_time.strftime("%H:%M")
        end_datetime = current_time + timedelta(minutes=window_minutes)
        end_time = end_datetime.strftime("%H:%M")

        query = db.query(KnownService).filter(
            KnownService.origin == origin,
        )

        # Handle time windows that cross midnight
        if end_time > start_time:
            query = query.filter(
                KnownService.scheduled_departure.between(start_time, end_time)
            )
        else:
            query = query.filter(
                or_(
                    KnownService.scheduled_departure >= start_time,
                    KnownService.scheduled_departure <= end_time
                )
            )

        return query.all()

    except Exception as e:
        log.error(
            "train.services.fetch.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch train services: {str(e)}"
        )

def create_or_update_service(
        db: Session,
        service_id: str,
        origin: str,
        destination: str,
        destination_name: str,
        scheduled_departure: str,  # HH:MM format
        calling_points: List[dict],
        operator: str
) -> KnownService:
    """Create or update a known service."""
    try:
        db_service = db.query(KnownService).filter(
            KnownService.service_id == service_id
        ).first()

        if db_service:
            # Update existing service
            db_service.origin = origin
            db_service.destination = destination
            db_service.scheduled_departure = scheduled_departure
            db_service.calling_points = calling_points
            db_service.operator = operator
        else:
            # Create new service
            db_service = KnownService(
                service_id=service_id,
                origin=origin,
                destination=destination,
                destination_name=destination_name,
                scheduled_departure=scheduled_departure,
                calling_points=calling_points,
                operator=operator,
                discovered_at=datetime.now()
            )
            db.add(db_service)

        db.commit()
        db.refresh(db_service)
        return db_service

    except Exception as e:
        db.rollback()
        log.error(
            "train.service.save.failed",
            service_id=service_id,
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save service: {str(e)}"
        )