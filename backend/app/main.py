from fastapi import FastAPI, Depends
from starlette.requests import Request
from starlette.types import ASGIApp, Receive, Scope, Send, Message
from loguru import logger
import sys

import time
import uvicorn
import json

from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

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

#logger.add('debug.log', format="{time} {level} {message}", level="DEBUG")
'''
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request path: {request.url.path}")

    body = await request.body()
    try:
        body = body.decode('utf-8')
        logger.info(f"Request body: {body}")
    except UnicodeDecodeError:
        logger.info(f"Request body (binary): {body}")

    async def receive():
        return {"type": "http.request", "body": body}

    request._receive = receive
    response = await call_next(request)
    logger.info(f"Response status code: {response.status_code}")
    return response
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
