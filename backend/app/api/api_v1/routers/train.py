from fastapi import APIRouter, Depends
from app.services.train_service import get_train_recommendations

train_router = r = APIRouter()

@r.get("/train_recommendations")
def read_train_recommendations(origin: str, destination: str):
    return get_train_recommendations(origin, destination)

