from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.db.models import profile_model
from app.db.schemas.profile_schema import ProfileCreate, ProfileUpdate
from loguru import logger
import json

MAX_PROFILES = 5

def get_profiles(db: Session, user_id: int) -> List[profile_model.Profile]:
    return db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).all()

def create_profile(db: Session, profile: ProfileCreate, user_id: int) -> profile_model.Profile:
    logger.info("Trying to create profile")
    existing_profiles = db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).count()
    if existing_profiles >= MAX_PROFILES:
        raise HTTPException(status_code=400, detail=f"Profile limit reached. You can only have up to {MAX_PROFILES} profiles.")

    db_profile = profile_model.Profile(
        origins_list=profile.origins,
        destinations_list=profile.destinations,
        user_id=user_id,
        favourite=False
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile.to_dict()

def update_profile(db: Session, profile_id: int, profile: ProfileUpdate) -> profile_model.Profile:
    db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
    if db_profile:
        db_profile.origins_list = profile.origins
        db_profile.destinations_list = profile.destinations
        db.commit()
        db.refresh(db_profile)
    return db_profile.to_dict()

def delete_profile(db: Session, profile_id: int) -> None:
    db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
    db.delete(db_profile)
    db.commit()


def set_profile_as_favourite(db: Session, profile_id: int, user_id: int):
    profile = db.query(profile_model.Profile) \
        .filter(profile_model.Profile.id == profile_id).first()
    db.query(profile_model.Profile) \
        .filter(profile_model.Profile.user_id == profile.user) \
        .update({profile_model.Profile.favourite: False})

    profile = db.query(profile_model.Profile) \
        .filter(profile_model.Profile.id == profile_id) \
        .first()
    if profile:
        profile.favourite = True
        db.commit()
    return profile.to_dict()