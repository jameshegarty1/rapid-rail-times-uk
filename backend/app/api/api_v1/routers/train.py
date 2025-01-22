# app/api/api_v1/routers/train.py
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import structlog
from app.core.auth import get_current_active_user
from app.db.schemas import user_schema
from app.db.session import get_db, SessionLocal
from app.services.train_service import create_train_service
from app.simple_queue import async_task
from app.core.state import app_state
from time import time

# Create module logger
log = structlog.get_logger("api.train")

train_router = r = APIRouter()

def get_background_db():
    """Get DB session for background tasks."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@async_task
def get_train_routes_task(
    origins: List[str],
    destinations: List[str],
    forceFetch: bool,
    user_id: int
) -> Dict[str, Any]:
    """Async version of the train routes task."""
    task_log = log.bind(
        user_id=user_id,
        origins=origins,
        destinations=destinations,
        force_fetch=forceFetch
    )

    task_log.debug("api.train.task.started")

    db_generator = get_background_db()

    try:
        db = next(db_generator)
        start_time = time()
        train_service = create_train_service(db)
        result = train_service.get_train_routes(origins, destinations, forceFetch)
        task_log.debug("api.train.task.debugoutput", result=result)

        duration = time() - start_time

        task_log.info(
            "api.train.task.completed",
            duration=round(duration, 3),
            routes_count=len(result)
        )

        return result

    except Exception as e:
        task_log.error(
            "api.train.task.failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise
    finally:
        if db:
            db.close()

@r.get("/train_routes/")
async def read_train_routes(
    origins: List[str] = Query(..., alias="origins[]"),
    destinations: List[str] = Query(..., alias="destinations[]"),
    forceFetch: bool = Query(False),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """Create a new train routes task."""
    request_log = log.bind(
        user_id=current_user.id,
        endpoint="read_train_routes",
        origins=origins,
        destinations=destinations,
        force_fetch=forceFetch
    )

    request_log.debug("api.train.routes.fetch.start")

    try:
        task_id = await get_train_routes_task(
            origins,
            destinations,
            forceFetch,
            current_user.id
        )

        request_log.info(
            "api.train.task.created",
            task_id=task_id
        )

        return {
            "status": "pending",
            "task_id": task_id,
            "check_status_url": f"/train_routes/task_status/{task_id}"
        }

    except Exception as e:
        request_log.error(
            "api.train.task.creation.failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to start task")

@r.get("/train_routes/task_status/{task_id}")
async def get_task_status(
    task_id: str,
    current_user: user_schema.User = Depends(get_current_active_user)
):
    """Check status of a train routes task."""
    request_log = log.bind(
        user_id=current_user.id,
        task_id=task_id,
        endpoint="get_task_status"
    )

    request_log.debug("api.train.status.check.start")

    try:
        result = await app_state.task_manager.get_result(task_id, timeout=0.1)
        #request_log.debug(result)

        if result['status'] == 'completed':
            request_log.info(
                "api.train.status.check.completed",
                duration=result.get('duration')
            )
            return {
                "status": "completed",
                "result": result['result']
            }
        elif result['status'] == 'failed':
            request_log.error(
                "api.train.status.check.failed",
                error=result['result']
            )
            return {
                "status": "failed",
                "error": result['result']
            }

        request_log.debug("api.train.status.check.pending")
        return {
            "status": "pending",
            "task_id": task_id
        }

    except TimeoutError:
        request_log.debug(
            "api.train.status.check.timeout",
            timeout_value=0.1
        )
        return {
            "status": "pending",
            "task_id": task_id
        }
    except Exception as e:
        request_log.error(
            "api.train.status.check.error",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to check task status")