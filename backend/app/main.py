import os
from fastapi import FastAPI
from app.simple_queue import AsyncTaskManager
from app.core.state import app_state
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.routers.users import users_router
from app.api.api_v1.routers.auth import auth_router
from app.api.api_v1.routers.train import train_router
from app.api.api_v1.routers.profile import profile_router
from app.core import config


app = FastAPI(
    title=config.PROJECT_NAME, docs_url="/api/docs", openapi_url="/api"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Replace with your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.on_event("startup")
async def startup_event():
    app_state.task_manager = AsyncTaskManager()
    await app_state.task_manager.start()

@app.on_event("shutdown")
async def shutdown_event():
    if app_state.task_manager:
        await app_state.task_manager.stop()

# Routers
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(train_router, prefix="/api/v1/train", tags=["trains"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["profiles"])
