from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
import structlog
log = structlog.get_logger("auth.router")

from app.db.session import get_db
from app.core import security
from app.core.auth import authenticate_user, sign_up_new_user

auth_router = r = APIRouter()


@r.post("/token")
async def login(
    db=Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    request_log = log.bind(username=form_data.username)
    request_log.info("auth.login.attempt")
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        request_log.warning("auth.login.failed", reason="invalid_credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    if user.is_superuser:
        permissions = "admin"
    else:
        permissions = "user"

    access_token = security.create_access_token(
        data={"sub": user.email, "permissions": permissions},
        expires_delta=access_token_expires,
    )

    request_log.info(
        "auth.login.success",
        email=user.email,
        permissions=permissions,
        token_expires_in_minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return {"access_token": access_token, "token_type": "bearer"}


@r.post("/signup")
async def signup(
    db=Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    request_log = log.bind(username=form_data.username)
    request_log.info("auth.signup.attempt")

    user = sign_up_new_user(db, form_data.username, form_data.password)
    if not user:
        request_log.warning("auth.signup.failed", reason="account_exists")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account already exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    if user.is_superuser:
        permissions = "admin"
    else:
        permissions = "user"
    access_token = security.create_access_token(
        data={"sub": user.email, "permissions": permissions},
        expires_delta=access_token_expires,
    )

    request_log.info(
        "auth.signup.success",
        email=user.email,
        permissions=permissions,
        token_expires_in_minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return {"access_token": access_token, "token_type": "bearer"}
