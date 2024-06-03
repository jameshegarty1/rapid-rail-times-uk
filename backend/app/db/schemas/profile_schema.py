from pydantic import BaseModel

class ProfileBase(BaseModel):
    origin: str
    destination: str

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
