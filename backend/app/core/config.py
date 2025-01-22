import os

PROJECT_NAME = "rail-times-uk"

SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

API_V1_STR = "/api/v1"


ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
