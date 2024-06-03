#!/bin/bash

# Exit in case of error
set -e

# Function to check if Postgres is up
function wait_for_postgres() {
  echo "Waiting for Postgres to be available..."
  until docker-compose exec -T postgres pg_isready -U postgres; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 2
  done
  echo "Postgres is up - continuing..."
}

# Build and run containers
echo "Starting up Docker containers..."
docker-compose up -d

# Wait for Postgres to be available
wait_for_postgres

# Run migrations
echo "Running alembic migrations..."
docker-compose run --rm backend alembic upgrade head

# Create initial data
echo "Creating initial data..."
docker-compose run --rm backend python3 app/initial_data.py

echo "Setup complete."

