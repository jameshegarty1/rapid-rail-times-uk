# routes.py
from fastapi import APIRouter, Depends, HTTPException, Query
from celery.result import AsyncResult
from app.tasks import get_train_routes_task
from typing import List
from loguru import logger
from pydantic import BaseModel
import time

train_router = APIRouter()

@train_router.get("/train_routes/")
async def read_train_routes(origins: List[str] = Query(..., alias="origins[]"), destinations: List[str] = Query(..., alias="destinations[]")):
    logger.info(f"Requested routes for {origins} to {destinations}")

    try:
        task = get_train_routes_task.delay(origins, destinations)
        logger.info(f"Task ID: {task.id}")
        
        while not task.ready():
            logger.info("Task not ready yet...")
            time.sleep(1)
        
        if task.successful():
            return {"status": "Success", "result": task.result}
        else:
            raise HTTPException(status_code=500, detail=f"Task failed: {task.result}")
    except Exception as e:
        logger.error(f"Error starting Celery task: {e}")
        raise HTTPException(status_code=500, detail="Failed to start task")

@train_router.get("/task_status/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id)

    if task_result.state == 'PENDING':
        response = {"state": task_result.state, "status": "Pending..."}
    elif task_result.state == 'SUCCESS':
        response = {"state": task_result.state, "result": task_result.result}
    elif task_result.state == 'FAILURE':
        response = {"state": task_result.state, "status": str(task_result.info)}
    else:
        response = {"state": task_result.state, "status": "Unknown state"}

    return response

