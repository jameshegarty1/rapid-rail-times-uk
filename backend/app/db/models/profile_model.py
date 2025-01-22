from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
import json
import structlog

# Create module logger
log = structlog.get_logger("models.profile")


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_user.id"))
    origins = Column(String)
    destinations = Column(String)
    user = relationship("User", back_populates="profiles")
    favourite = Column(Boolean)

    def __get_logger(self):
        """Get logger with profile context."""
        return log.bind(
            profile_id=self.id,
            user_id=self.user_id
        )

    @property
    def origins_list(self):
        log_ctx = self.__get_logger()
        try:
            log_ctx.debug(
                "profile.origins.deserialize.attempt",
                raw_value=self.origins
            )
            result = json.loads(self.origins) if self.origins else []
            log_ctx.debug(
                "profile.origins.deserialize.success",
                value=result
            )
            return result
        except json.JSONDecodeError as e:
            log_ctx.error(
                "profile.origins.deserialize.failed",
                error=str(e),
                error_type="JSONDecodeError",
                raw_value=self.origins
            )
            return []

    @origins_list.setter
    def origins_list(self, value):
        log_ctx = self.__get_logger()
        try:
            log_ctx.debug(
                "profile.origins.serialize.attempt",
                value=value
            )
            serialized = json.dumps(value)
            self.origins = serialized
            log_ctx.debug(
                "profile.origins.serialize.success",
                serialized_value=serialized
            )
        except (TypeError, ValueError) as e:
            log_ctx.error(
                "profile.origins.serialize.failed",
                error=str(e),
                error_type=type(e).__name__,
                invalid_value=value
            )
            raise

    @property
    def destinations_list(self):
        log_ctx = self.__get_logger()
        try:
            log_ctx.debug(
                "profile.destinations.deserialize.attempt",
                raw_value=self.destinations
            )
            result = json.loads(self.destinations) if self.destinations else []
            log_ctx.debug(
                "profile.destinations.deserialize.success",
                value=result
            )
            return result
        except json.JSONDecodeError as e:
            log_ctx.error(
                "profile.destinations.deserialize.failed",
                error=str(e),
                error_type="JSONDecodeError",
                raw_value=self.destinations
            )
            return []

    @destinations_list.setter
    def destinations_list(self, value):
        log_ctx = self.__get_logger()
        try:
            log_ctx.debug(
                "profile.destinations.serialize.attempt",
                value=value
            )
            serialized = json.dumps(value)
            self.destinations = serialized
            log_ctx.debug(
                "profile.destinations.serialize.success",
                serialized_value=serialized
            )
        except (TypeError, ValueError) as e:
            log_ctx.error(
                "profile.destinations.serialize.failed",
                error=str(e),
                error_type=type(e).__name__,
                invalid_value=value
            )
            raise

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "origins": self.origins_list,
            "destinations": self.destinations_list,
            "favourite": self.favourite,
        }