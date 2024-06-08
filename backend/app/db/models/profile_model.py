from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
import json
from loguru import logger

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_user.id"))
    origins = Column(String)
    destinations = Column(String)
    user = relationship("User", back_populates="profiles")

    @property
    def origins_list(self):
        try:
            logger.info(f"Deserializing origins: {self.origins}")
            return json.loads(self.origins)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize origins: {e}")
            return []

    @origins_list.setter
    def origins_list(self, value):
        logger.info(f"Value = {value}")
        test = json.dumps(value)
        logger.info(f"JSON dumps value = {test}")
        self.origins = json.dumps(value)

    @property
    def destinations_list(self):
        try:
            logger.info(f"Deserializing destinations: {self.destinations}")
            return json.loads(self.destinations)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize destinations: {e}")
            return []

    @destinations_list.setter
    def destinations_list(self, value):
        logger.info(f"Value = {value}")
        test = json.dumps(value)
        logger.info(f"JSON dumps value = {test}")
        self.destinations = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "origins": self.origins_list,
            "destinations": self.destinations_list,
        }
