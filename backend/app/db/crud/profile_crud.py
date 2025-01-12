from typing import List, Dict, Optional
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.db.models import profile_model
from app.db.schemas.profile_schema import ProfileCreate, ProfileUpdate
from loguru import logger
import json

MAX_PROFILES = 5

def get_profiles(db: Session, user_id: int) -> List[Dict]:
    """
    Get all profiles for a user.
    Raises HTTPException if database error occurs.
    """
    try:
        profiles = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == user_id) \
            .all()
        return [profile.to_dict() for profile in profiles]
    except SQLAlchemyError as e:
        logger.error(f"Database error while fetching profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profiles")


def create_profile(db: Session, profile: ProfileCreate, user_id: int) -> Dict:
    """
    Create a new profile for a user.
    Raises HTTPException if profile limit reached or database error occurs.
    """
    try:
        # Check profile limit in a transaction
        existing_profiles = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == user_id) \
            .count()

        if existing_profiles >= MAX_PROFILES:
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

        logger.info(f"Created profile id={db_profile.id} for user_id={user_id}")
        return db_profile.to_dict()

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while creating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")


def update_profile(db: Session, profile_id: int, profile: ProfileUpdate) -> Dict:
    """
    Update an existing profile.
    Raises HTTPException if profile not found or database error occurs.
    """
    try:
        db_profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not db_profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        db_profile.origins_list = profile.origins
        db_profile.destinations_list = profile.destinations

        db.commit()
        db.refresh(db_profile)

        logger.info(f"Updated profile id={profile_id}")
        return db_profile.to_dict()

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while updating profile id={profile_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


def delete_profile(db: Session, profile_id: int) -> bool:
    """
    Delete a profile.
    Returns True if profile was deleted, False if profile not found.
    Raises HTTPException if database error occurs.
    """
    try:
        db_profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not db_profile:
            return False

        db.delete(db_profile)
        db.commit()

        logger.info(f"Deleted profile id={profile_id}")
        return True

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while deleting profile id={profile_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete profile")


def set_profile_as_favourite(db: Session, profile_id: int, is_set: bool = True) -> bool:
    try:
        profile = db.query(profile_model.Profile) \
            .filter(profile_model.Profile.id == profile_id) \
            .first()

        if not profile:
            return False

        # Unset any existing favourites for this user
        db.query(profile_model.Profile) \
            .filter(profile_model.Profile.user_id == profile.user.id) \
            .update({profile_model.Profile.favourite: False})

        # Set the new favourite
        profile.favourite = is_set
        db.commit()
        return True

    except Exception:
        db.rollback()
        return False

# from typing import List
# from fastapi import HTTPException
# from sqlalchemy.orm import Session
# from app.db.models import profile_model
# from app.db.schemas.profile_schema import ProfileCreate, ProfileUpdate
# from loguru import logger
# import json
#
# MAX_PROFILES = 5
#
#
# def get_profiles(db: Session, user_id: int) -> List[profile_model.Profile]:
#     return db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).all()
#
#
# def create_profile(db: Session, profile: ProfileCreate, user_id: int) -> profile_model.Profile:
#     logger.info("Trying to create profile")
#     existing_profiles = db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).count()
#     if existing_profiles >= MAX_PROFILES:
#         raise HTTPException(status_code=400,
#                             detail=f"Profile limit reached. You can only have up to {MAX_PROFILES} profiles.")
#
#     db_profile = profile_model.Profile(
#         origins_list=profile.origins,
#         destinations_list=profile.destinations,
#         user_id=user_id,
#         favourite=False
#     )
#     db.add(db_profile)
#     db.commit()
#     db.refresh(db_profile)
#     logger.info(f"Completed profile creation: [{db_profile}]")
#     return db_profile.to_dict()
#
#
# def update_profile(db: Session, profile_id: int, profile: ProfileUpdate) -> profile_model.Profile:
#     db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
#     if db_profile:
#         db_profile.origins_list = profile.origins
#         db_profile.destinations_list = profile.destinations
#         db.commit()
#         db.refresh(db_profile)
#     return db_profile.to_dict()
#
#
# def delete_profile(db: Session, profile_id: int) -> None:
#     db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
#     db.delete(db_profile)
#     db.commit()
#
#
# def set_profile_as_favourite(db: Session, profile_id: int, is_set: bool = True) -> bool:
#     try:
#         profile = db.query(profile_model.Profile) \
#             .filter(profile_model.Profile.id == profile_id) \
#             .first()
#
#         if not profile:
#             return False
#
#         # Unset any existing favourites for this user
#         db.query(profile_model.Profile) \
#             .filter(profile_model.Profile.user_id == profile.user.id) \
#             .update({profile_model.Profile.favourite: False})
#
#         # Set the new favourite
#         profile.favourite = is_set
#         db.commit()
#         return True
#
#     except Exception:
#         db.rollback()
#         return False
