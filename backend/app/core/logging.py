# app/core/logging.py
import sys
import logging
import structlog
from typing import Union
from datetime import datetime
import time
from fastapi import Request, Response
from fastapi.routing import APIRoute
from app.core import config


def setup_logging():
    """Configure structured logging for the application."""

    # Set up timestamp processor
    def add_timestamp(_, __, event_dict):
        now = time.time()
        event_dict["timestamp"] = datetime.now().strftime("%Y%m%d-%H%M%S.%f")
        return event_dict

    # Configure standard logging first
    logging.basicConfig(
        format="%(message)s",
        level=logging.DEBUG,
        stream=sys.stdout,
    )

    # Configure processors for structlog
    shared_processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        add_timestamp,
        structlog.processors.format_exc_info,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    # Development configuration (human-readable output)
    if config.ENVIRONMENT == "development":
        processors = [
            *shared_processors,
            structlog.dev.ConsoleRenderer(colors=True)
        ]
    # Production configuration (JSON output)
    else:
        processors = [
            *shared_processors,
            structlog.processors.JSONRenderer()
        ]

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


class LoggingRoute(APIRoute):
    """Custom route class to add request logging."""

    def get_route_handler(self):
        original_route_handler = super().get_route_handler()
        log = structlog.get_logger("api.request")

        async def route_handler(request: Request) -> Response:
            start_time = time.time()

            # Create request context
            request_id = request.headers.get('X-Request-ID', str(time.time()))
            log_ctx = log.bind(
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                client_ip=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
            )

            log_ctx.debug("api.request.started")

            try:
                response = await original_route_handler(request)
                duration_ms = round((time.time() - start_time) * 1000, 2)

                log_ctx.info(
                    "api.request.completed",
                    status_code=response.status_code,
                    duration_ms=duration_ms,
                )
                return response

            except Exception as e:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                log_ctx.error(
                    "api.request.failed",
                    error=str(e),
                    error_type=type(e).__name__,
                    duration_ms=duration_ms,
                    exc_info=True,
                )
                raise

        return route_handler