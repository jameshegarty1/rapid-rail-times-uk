import jwt
from fastapi import Depends, HTTPException, status
from jwt import PyJWTError
import structlog
from app.db.models import user_model
from app.db.schemas import user_schema
from app.db import session
from app.db.crud.user_crud import get_user_by_email, create_user
from app.core import security

log = structlog.get_logger("auth.core")

async def get_current_user(
    db=Depends(session.get_db), token: str = Depends(security.oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        permissions: str = payload.get("permissions")
        token_data = user_schema.TokenData(email=email, permissions=permissions)

        log.debug("auth.token.decoded", email=email, permissions=permissions)

    except PyJWTError:
        log.warning(
            "auth.token.invalid",
            error=str(e),
            error_type=type(e).__name__
        )
        raise credentials_exception
    user = get_user_by_email(db, token_data.email)
    if user is None:
        log.warning("auth.user.not_found", email=token_data.email)
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: user_model.User = Depends(get_current_user),
):
    log_ctx = log.bind(
        user_id=current_user.id,
        email=current_user.email
    )

    log_ctx.debug("auth.user.active_check")
    if not current_user.is_active:
        log_ctx.warning("auth.user.inactive")
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_superuser(
    current_user: user_model.User = Depends(get_current_user),
) -> user_model.User:
    log_ctx = log.bind(
        user_id=current_user.id,
        email=current_user.email
    )

    log_ctx.debug("auth.user.superuser_check")

    if not current_user.is_superuser:
        log_ctx.warning("auth.user.insufficient_privileges")
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user


def authenticate_user(db, email: str, password: str):
    log_ctx = log.bind(email=email)
    log_ctx.debug("auth.user.authenticate_attempt")
    user = get_user_by_email(db, email)
    if not user:
        log_ctx.warning("auth.user.not_found")
        return False
    if not security.verify_password(password, user.hashed_password):
        log_ctx.warning("auth.user.invalid_password")
        return False

    log_ctx.info(
        "auth.user.authenticated",
        user_id=user.id,
        is_superuser=user.is_superuser
    )

    return user


def sign_up_new_user(db, email: str, password: str):
    log_ctx = log.bind(email=email)
    log_ctx.debug("auth.user.signup_attempt")

    user = get_user_by_email(db, email)

    if user:
        log_ctx.info("auth.user.signup_failed", reason="email_exists")
        return False  # User already exists
    new_user = create_user(
        db,
        user_schema.UserCreate(
            email=email,
            password=password,
            is_active=True,
            is_superuser=False,
        ),
    )

    log_ctx.info(
        "auth.user.created",
        user_id=new_user.id,
        is_active=new_user.is_active,
        is_superuser=new_user.is_superuser
    )

    return new_user
