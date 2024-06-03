#!/usr/bin/env python3

from app.db.session import get_db
from app.db.crud.user_crud import create_user
from app.db.schemas.user_schema import UserCreate
from app.db.session import SessionLocal


def init() -> None:
    db = SessionLocal()

    create_user(
        db,
        UserCreate(
            email="james",
            password="12345",
            is_active=True,
            is_superuser=True,
            profiles=None
        ),
    )


if __name__ == "__main__":
    print("Creating superuser jhegartyodowd@gmail.com")
    init()
    print("Superuser created")
