from typing import List, Dict, Optional
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.db.models import profile_model
from app.db.schemas.profile_schema import ProfileCreate, ProfileUpdate
import structlog

# Create module logger
log = structlog.get_logger("crud.profile")

MAX_PROFILES = 5


def get_profiles(db: Session, user_id: int) -> List[Dict]:
    """Get all profiles for a user."""
    log_ctx = log.bind(user_id=user_id)

    try:
        profiles = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == user_id) \
            .all()

        log_ctx.info(
            "profile.fetch.success",
            count=len(profiles)
        )
        return [profile.to_dict() for profile in profiles]

    except SQLAlchemyError as e:
        log_ctx.error(
            "profile.fetch.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Failed to fetch profiles")


def create_profile(db: Session, profile: ProfileCreate, user_id: int) -> Dict:
    """Create a new profile for a user."""
    log_ctx = log.bind(user_id=user_id)

    try:
        existing_profiles = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == user_id) \
            .count()

        log_ctx.debug(
            "profile.create.check_limit",
            existing_count=existing_profiles,
            max_profiles=MAX_PROFILES
        )

        if existing_profiles >= MAX_PROFILES:
            log_ctx.warning(
                "profile.create.limit_exceeded",
                existing_count=existing_profiles,
                max_profiles=MAX_PROFILES
            )
            raise HTTPException(
                status_code=400,
                detail=f"Profile limit reached. Maximum allowed: {MAX_PROFILES}"
            )

        db_profile = profile_model.Profile(
            origins_list=profile.origins,
            destinations_list=profile.destinations,
            user_id=user_id,
            favourite=False
        )

        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)

        log_ctx.info(
            "profile.create.success",
            profile_id=db_profile.id,
            origins_count=len(profile.origins),
            destinations_count=len(profile.destinations)
        )
        return db_profile.to_dict()

    except SQLAlchemyError as e:
        db.rollback()
        log_ctx.error(
            "profile.create.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Failed to create profile")


def update_profile(db: Session, profile_id: int, profile: ProfileUpdate) -> Dict:
    """Update an existing profile."""
    log_ctx = log.bind(profile_id=profile_id)

    try:
        db_profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not db_profile:
            log_ctx.warning("profile.update.not_found")
            raise HTTPException(status_code=404, detail="Profile not found")

        # Bind user_id to logger context
        log_ctx = log_ctx.bind(user_id=db_profile.user_id)

        db_profile.origins_list = profile.origins
        db_profile.destinations_list = profile.destinations

        db.commit()
        db.refresh(db_profile)

        log_ctx.info(
            "profile.update.success",
            origins_count=len(profile.origins),
            destinations_count=len(profile.destinations)
        )
        return db_profile.to_dict()

    except SQLAlchemyError as e:
        db.rollback()
        log_ctx.error(
            "profile.update.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Failed to update profile")


def delete_profile(db: Session, profile_id: int) -> bool:
    """Delete a profile."""
    log_ctx = log.bind(profile_id=profile_id)

    try:
        db_profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not db_profile:
            log_ctx.warning("profile.delete.not_found")
            return False

        # Bind user_id to logger context
        log_ctx = log_ctx.bind(user_id=db_profile.user_id)

        db.delete(db_profile)
        db.commit()

        log_ctx.info("profile.delete.success")
        return True

    except SQLAlchemyError as e:
        db.rollback()
        log_ctx.error(
            "profile.delete.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Failed to delete profile")


def set_profile_as_favourite(db: Session, profile_id: int, is_set: bool = True) -> bool:
    """Set or unset a profile as favourite."""
    log_ctx = log.bind(profile_id=profile_id, is_set=is_set)

    try:
        profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not profile:
            log_ctx.warning("profile.favourite.not_found")
            return False

        # Bind user_id to logger context
        log_ctx = log_ctx.bind(user_id=profile.user_id)

        # Unset any existing favourites for this user
        db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == profile.user_id) \
            .update({profile_model.Profile.favourite: False})

        # Set the new favourite
        profile.favourite = is_set
        db.commit()

        log_ctx.info("profile.favourite.updated")
        return True

    except SQLAlchemyError as e:
        db.rollback()
        log_ctx.error(
            "profile.favourite.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Failed to update favourite profile")