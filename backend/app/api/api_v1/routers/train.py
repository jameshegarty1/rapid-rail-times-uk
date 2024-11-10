# routes.py
from fastapi import APIRouter, HTTPException, Query
from app.core.state import app_state
from app.simple_queue import async_task
from app.services.train_service import get_train_routes
from typing import List
from loguru import logger
import time

train_router = APIRouter()

@async_task
def get_train_routes_task(origins: List[str], destinations: List[str], forceFetch: bool):
    """
    Async version of the train routes task.
    Returns the task ID immediately, use get_result to fetch the actual result.
    """
    return get_train_routes(origins, destinations, forceFetch)


@train_router.get("/train_routes/")
async def read_train_routes(
    origins: List[str] = Query(..., alias="origins[]"),
    destinations: List[str] = Query(..., alias="destinations[]"),
    forceFetch: bool = Query(False)
):

    logger.info(f"Requested routes for {origins} to {destinations} with forceFetch={forceFetch}")

    try:
        # Start the task and return immediately with task ID
        task_id = await get_train_routes_task(origins, destinations, forceFetch)
        logger.info(f"New task ID: {task_id}")
        
        return {
            "status": "pending",
            "task_id": task_id,
            "check_status_url": f"/train_routes/task_status/{task_id}"
        }
        
    except Exception as e:
        logger.error(f"Error starting task: {e}")
        raise HTTPException(status_code=500, detail="Failed to start task")

@train_router.get("/train_routes/task_status/{task_id}")
async def get_task_status(task_id: str):
    try:
        result = await app_state.task_manager.get_result(task_id, timeout=0.1)

        if result['status'] == 'completed':
            return {
                "status": "completed",
                "result": result['result']
            }
        elif result['status'] == 'failed':
            return {
                "status": "failed",
                "error": result['result']
            }
        
    except TimeoutError:
        return {
            "status": "pending",
            "task_id": task_id
        }
    except Exception as e:
        logger.error(f"Error checking task status: {e}")
        raise HTTPException(status_code=500, detail="Failed to check task status")
