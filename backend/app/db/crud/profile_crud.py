from typing import List
from sqlalchemy.orm import Session
from app.db.models import profile_model
from app.db.schemas.profile_schema import ProfileCreate, ProfileUpdate
from loguru import logger

def get_profiles(db: Session, user_id: int) -> List[profile_model.Profile]:
    return db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).all()

def create_profile(db: Session, profile: ProfileCreate, user_id: int) -> profile_model.Profile:
    db_profile = profile_model.Profile(**profile.dict(), user_id=user_id)
    logger.info("Creating profile with ")
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, profile_id: int, profile: ProfileUpdate) -> profile_model.Profile:
    db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
    for key, value in profile.dict().items():
        setattr(db_profile, key, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_profile(db: Session, profile_id: int) -> None:
    db_profile = db.query(profile_model.Profile).filter(profile_model.Profile.id == profile_id).first()
    db.delete(db_profile)
    db.commit()
