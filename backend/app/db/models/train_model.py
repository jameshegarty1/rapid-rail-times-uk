from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.db.session import Base
import structlog

log = structlog.get_logger("train_model")

class KnownService(Base):
    """Known train services and their calling points."""
    __tablename__ = "known_services"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(String, nullable=False, unique=True, index=True)
    origin = Column(String(3), nullable=False, index=True)
    destination = Column(String(3), nullable=False, index=True)
    destination_name = Column(String(30), nullable=False, index=True)
    scheduled_departure = Column(String(5), nullable=False)  # HH:MM format
    calling_points = Column(JSON)  # [{crs, station_name, scheduled_time}]
    operator = Column(String)
    discovered_at = Column(DateTime, nullable=False)

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "service_id": self.service_id,
            "origin": self.origin,
            "destination": self.destination,
            "destination_name": self.destination_name,
            "scheduled_departure": self.scheduled_departure,
            "subsequent_calling_points": self.calling_points,
            "operator": self.operator
        }