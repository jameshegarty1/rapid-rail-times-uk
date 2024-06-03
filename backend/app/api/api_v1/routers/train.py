from fastapi import APIRouter, Depends
from app.services.train_service import get_train_routes

train_router = r = APIRouter()

@r.get("/train_routes/")
def read_train_routes(origin: str, destination: str):
    return get_train_routes(origin, destination)

