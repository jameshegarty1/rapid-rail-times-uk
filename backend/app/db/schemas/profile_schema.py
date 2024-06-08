from pydantic import BaseModel
from typing import List

class ProfileBase(BaseModel):
    origins: List[str]
    destinations: List[str]

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
