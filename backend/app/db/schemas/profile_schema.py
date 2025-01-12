from pydantic import BaseModel
from typing import List

class ProfileBase(BaseModel):
    origins: List[str]
    destinations: List[str]
    favourite: bool

class ProfileCreate(ProfileBase):
    favourite: bool = False

class ProfileUpdate(ProfileBase):
    favourite: bool

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
