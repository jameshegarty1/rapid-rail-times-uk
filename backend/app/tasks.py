from app.core.celery_app import celery_app
from app.services.train_service import get_train_routes
from typing import List

@celery_app.task(name="app.tasks.get_train_routes_task")
def get_train_routes_task(origins: List[str], destinations: List[str]):
    return get_train_routes(origins, destinations)

@celery_app.task(acks_late=True)
def example_task(word: str) -> str:
    return f"test task returns {word}"
