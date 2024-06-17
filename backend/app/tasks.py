from app.core.celery_app import celery_app
from app.services.train_service import get_train_routes
from app.exceptions import TrainServiceException
from typing import List

@celery_app.task(name="app.tasks.get_train_routes_task")
def get_train_routes_task(origins: List[str], destinations: List[str], forceFetch: bool):
    try:
        return get_train_routes(origins, destinations, forceFetch)
    except TrainServiceException as e:
        # Log the error or handle it as needed
        return {'status_code': e.status_code, 'detail': e.detail}

@celery_app.task(acks_late=True)
def example_task(word: str) -> str:
    return f"test task returns {word}"
