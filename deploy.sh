#!/bin/bash
set -e

cd /opt/rtuk

echo "=== Starting Deployment ==="

# 1. Login to Docker Hub
echo "1. Authenticating with Docker Hub..."
source .env
if [ ! -f "/root/.config/containers/auth.json" ]; then
    podman login docker.io -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
fi

# 2. Pull latest images
echo "2. Pulling latest images..."
podman-compose pull

# 3. Stop existing services
echo "3. Stopping existing services..."
podman-compose down

# 4. Start services
echo "4. Starting services..."
podman-compose up -d

# 5. Check if SSL needs setup
if [ ! -f "ssl/fullchain.pem" ] || [ ! -f "ssl/privkey.pem" ]; then
    echo "5. SSL certificates not found, running setup..."
    ./setup-ssl.sh
else
    echo "5. SSL certificates found, skipping setup..."
fi

# 6. Check status
echo "6. Checking service status..."
sleep 5
podman-compose ps

echo "=== Deployment Complete ==="
echo "Frontend: https://rail-times-uk.com"
echo "Backend API: https://rail-times-uk.com/api"
echo "Postgres: localhost:5433"
