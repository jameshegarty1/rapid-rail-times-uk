from fastapi import FastAPI, Depends
from starlette.requests import Request
from loguru import logger
import sys

import time
import uvicorn

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from app.api.api_v1.routers.users import users_router
from app.api.api_v1.routers.auth import auth_router
from app.api.api_v1.routers.train import train_router
from app.api.api_v1.routers.profile import profile_router
from app.core import config
from app.db.session import SessionLocal
from app.core.auth import get_current_active_user
from app.core.celery_app import celery_app
from app import tasks


app = FastAPI(
    title=config.PROJECT_NAME, docs_url="/api/docs", openapi_url="/api"
)

logger.add(sys.stdout, format="{time} {level} {message}", level="DEBUG")

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    request.state.db = SessionLocal()
    response = await call_next(request)
    request.state.db.close()
    return response

'''
class LogRequestsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Request: {request.method} {request.url}")

        # Read and log the request body
        request_body = await request.body()
        logger.info(f"Request Body: {request_body.decode('utf-8')}")
        return True

        start_time = time.time()
        logger.info("Calling next middleware/handler...")
        response = await call_next(request)
        logger.info("Returned from next middleware/handler.")
        process_time = time.time() - start_time

        # Collect and log the response body
        response_body = b''
        async for chunk in response.body_iterator:
            response_body += chunk
        
        response = Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type
        )

        logger.info(f"Response: {response.status_code} in {process_time} secs")
        if response_body:
            logger.info(f"Response Body: {response_body.decode('utf-8')}")

        return response

app.add_middleware(LogRequestsMiddleware)
'''

@app.get("/api/v1")
async def root():
    return {"message": "Hello World"}


@app.get("/api/v1/task")
async def example_task():
    celery_app.send_task("app.tasks.example_task", args=["Hello World"])

    return {"message": "success"}


# Routers
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(train_router, prefix="/api/v1/train", tags=["trains"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["profiles"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", reload=True, port=8888)
