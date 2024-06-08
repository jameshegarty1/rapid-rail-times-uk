from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from loguru import logger
from app.db.crud.profile_crud import (
    get_profiles,
    create_profile,
    update_profile,
    delete_profile,
)
from app.core.auth import get_current_active_user

from app.db.schemas import user_schema,profile_schema
from app.db.session import get_db
profile_router = r = APIRouter()

@r.get("/", response_model=List[profile_schema.Profile])
def read_profiles_endpoint(db: Session = Depends(get_db), current_user: user_schema.User = Depends(get_current_active_user)):
    profiles = get_profiles(db=db, user_id=current_user.id)
    return [profile.to_dict() for profile in profiles]

@r.post("/", response_model=profile_schema.Profile)
def create_profile_endpoint(profile: profile_schema.ProfileCreate, db: Session = Depends(get_db), current_user: user_schema.User = Depends(get_current_active_user)):
    logger.info(f"Received profile with origins: {profile.origins} and destinations: {profile.destinations}")
    created_profile = create_profile(db=db, profile=profile, user_id=current_user.id)
    logger.info(f"Created profile: {created_profile}")
    return created_profile

@r.put("/{profile_id}", response_model=profile_schema.Profile)
def update_profile_endpoint(profile_id: int, profile: profile_schema.ProfileUpdate, db: Session = Depends(get_db), current_user: user_schema.User = Depends(get_current_active_user)):
    updated_profile = update_profile(db=db, profile_id=profile_id, profile=profile)
    return updated_profile

@r.delete("/{profile_id}", response_model=None)
def delete_profile_endpoint(profile_id: int, db: Session = Depends(get_db), current_user: user_schema.User = Depends(get_current_active_user)):
    delete_profile(db=db, profile_id=profile_id)
    return None

