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
import structlog
from app.core.logging import setup_logging, LoggingRoute

setup_logging()
log = structlog.get_logger("app.main")

def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title=config.PROJECT_NAME,
        docs_url="/api/docs",
        openapi_url="/api",
    )

    # CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[os.getenv("FRONTEND_URL", "*")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add routers
    application.include_router(
        users_router,
        prefix="/api/v1/users",
        tags=["users"]
    )
    application.include_router(
        auth_router,
        prefix="/api/v1/auth",
        tags=["auth"]
    )
    application.include_router(
        train_router,
        prefix="/api/v1/train",
        tags=["trains"]
    )
    application.include_router(
        profile_router,
        prefix="/api/v1/profile",
        tags=["profiles"]
    )

    return application

app = create_application()

@app.on_event("startup")
async def startup_event():
    """Initialize application services on startup."""
    log.info("app.startup.begin")
    try:
        app_state.task_manager = AsyncTaskManager()
        await app_state.task_manager.start()
        log.info("app.startup.completed")
    except Exception as e:
        log.error(
            "app.startup.failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup application services on shutdown."""
    log.info("app.shutdown.begin")
    try:
        if app_state.task_manager:
            await app_state.task_manager.stop()
        log.info("app.shutdown.completed")
    except Exception as e:
        log.error(
            "app.shutdown.failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise
