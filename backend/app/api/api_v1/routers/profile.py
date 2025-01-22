from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import structlog
from app.db.crud.profile_crud import (
    get_profiles,
    create_profile,
    update_profile,
    delete_profile,
    set_profile_as_favourite,
)
from app.core.auth import get_current_active_user
from app.db.schemas import user_schema, profile_schema
from app.db.session import get_db

# Create module logger
log = structlog.get_logger("api.profile")

profile_router = r = APIRouter()


@r.get("/", response_model=List[profile_schema.Profile])
def read_profiles_endpoint(
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
):
    """Get all profiles for the current user."""
    log_ctx = log.bind(
        user_id=current_user.id,
        endpoint="read_profiles"
    )

    log_ctx.debug("api.profiles.fetch.start")

    try:
        profiles = get_profiles(db=db, user_id=current_user.id)

        log_ctx.info(
            "api.profiles.fetch.success",
            profiles_count=len(profiles)
        )
        return profiles

    except Exception as e:
        log_ctx.error(
            "api.profiles.fetch.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise


@r.post("/", response_model=profile_schema.Profile)
def create_profile_endpoint(
        profile: profile_schema.ProfileCreate,
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
):
    """Create a new profile."""
    log_ctx = log.bind(
        user_id=current_user.id,
        endpoint="create_profile",
        origins_count=len(profile.origins),
        destinations_count=len(profile.destinations)
    )

    log_ctx.debug(
        "api.profile.create.start",
        origins=profile.origins,
        destinations=profile.destinations
    )

    try:
        created_profile = create_profile(
            db=db,
            profile=profile,
            user_id=current_user.id
        )

        log_ctx.info(
            "api.profile.create.success",
            profile_id=created_profile["id"]
        )
        return created_profile

    except Exception as e:
        log_ctx.error(
            "api.profile.create.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise


@r.put("/{profile_id}", response_model=profile_schema.Profile)
def update_profile_endpoint(
        profile_id: int,
        profile: profile_schema.ProfileUpdate,
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
):
    """Update an existing profile."""
    log_ctx = log.bind(
        user_id=current_user.id,
        profile_id=profile_id,
        endpoint="update_profile",
        origins_count=len(profile.origins),
        destinations_count=len(profile.destinations)
    )

    log_ctx.debug("api.profile.update.start")

    try:
        updated_profile = update_profile(
            db=db,
            profile_id=profile_id,
            profile=profile
        )

        log_ctx.info("api.profile.update.success")
        return updated_profile

    except Exception as e:
        log_ctx.error(
            "api.profile.update.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise


@r.delete("/{profile_id}")
def delete_profile_endpoint(
        profile_id: int,
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
):
    """Delete a profile."""
    log_ctx = log.bind(
        user_id=current_user.id,
        profile_id=profile_id,
        endpoint="delete_profile"
    )

    log_ctx.debug("api.profile.delete.start")

    try:
        result = delete_profile(db=db, profile_id=profile_id)

        if result:
            log_ctx.info("api.profile.delete.success")
        else:
            log_ctx.warning("api.profile.delete.not_found")

        return None

    except Exception as e:
        log_ctx.error(
            "api.profile.delete.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise


@r.post("/{profile_id}/favourite")
def set_favourite(
        profile_id: int,
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
) -> bool:
    """Set a profile as favourite."""
    log_ctx = log.bind(
        user_id=current_user.id,
        profile_id=profile_id,
        endpoint="set_favourite"
    )

    log_ctx.debug("api.profile.favourite.start")

    try:
        result = set_profile_as_favourite(db, profile_id)

        if result:
            log_ctx.info("api.profile.favourite.success")
        else:
            log_ctx.warning("api.profile.favourite.not_found")

        return result

    except Exception as e:
        log_ctx.error(
            "api.profile.favourite.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise


@r.post("/{profile_id}/unfavourite")
def set_unfavourite(
        profile_id: int,
        db: Session = Depends(get_db),
        current_user: user_schema.User = Depends(get_current_active_user)
) -> bool:
    """Unset a profile as favourite."""
    log_ctx = log.bind(
        user_id=current_user.id,
        profile_id=profile_id,
        endpoint="unset_favourite"
    )

    log_ctx.debug("api.profile.unfavourite.start")

    try:
        result = set_profile_as_favourite(db, profile_id, False)

        if result:
            log_ctx.info("api.profile.unfavourite.success")
        else:
            log_ctx.warning("api.profile.unfavourite.not_found")

        return result

    except Exception as e:
        log_ctx.error(
            "api.profile.unfavourite.failed",
            error=str(e),
            error_type=type(e).__name__
        )
        raise