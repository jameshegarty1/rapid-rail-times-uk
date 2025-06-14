#!/bin/bash
# Production deployment script for Hetzner VM
# Save as: deploy.sh

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.template to .env and configure your production values."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DOCKERHUB_USERNAME" "FRONTEND_REPO_NAME" "BACKEND_REPO_NAME" "VERSION" "POSTGRES_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backups logs

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 600 .env
chmod +x deploy.sh

# Login to DockerHub (optional, for private repos)
if [ ! -z "${DOCKERHUB_TOKEN}" ]; then
    echo "🔑 Logging in to DockerHub..."
    echo "${DOCKERHUB_TOKEN}" | podman login docker.io --username "${DOCKERHUB_USERNAME}" --password-stdin
fi

# Pull latest images from DockerHub
echo "📦 Pulling images from DockerHub..."
echo "Frontend: ${DOCKERHUB_USERNAME}/${FRONTEND_REPO_NAME}:${VERSION}"
echo "Backend: ${DOCKERHUB_USERNAME}/${BACKEND_REPO_NAME}:${VERSION}"

podman pull docker.io/${DOCKERHUB_USERNAME}/${FRONTEND_REPO_NAME}:${VERSION}
podman pull docker.io/${DOCKERHUB_USERNAME}/${BACKEND_REPO_NAME}:${VERSION}
podman pull postgres:15-alpine

# Stop existing containers gracefully
echo "⏹️  Stopping existing containers..."
podman-compose down --timeout 30

# Start the database first and wait for it to be healthy
echo "🗄️  Starting database..."
podman-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=60
counter=0
until podman-compose exec postgres pg_isready -U ${POSTGRES_USER} > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database failed to start within $timeout seconds"
        podman-compose logs postgres
        exit 1
    fi
    echo "Database is unavailable - sleeping (${counter}/${timeout})"
    sleep 2
    ((counter++))
done
echo "✅ Database is ready!"

# Run any database setup/migrations if needed
echo "🔄 Running database setup..."
# For FastAPI, you might have different commands, adjust as needed:
# podman-compose run --rm backend python -m alembic upgrade head
# OR if you have a custom setup script:
# podman-compose run --rm backend python scripts/setup_db.py
# OR skip if no migrations needed:
echo "ℹ️  Skipping database migrations (adjust deploy.sh if your app needs them)"

# Start all services
echo "🌟 Starting all services..."
podman-compose up -d

# Wait a moment for services to start
sleep 15

# Check service health
echo "🏥 Checking service health..."
# Try common FastAPI health endpoints
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
elif curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Application is responding!"
else
    echo "⚠️  Application health check failed, checking individual services..."
    
    # Check individual services
    echo "📋 Service status:"
    podman-compose ps
    
    echo "📋 Recent logs:"
    podman-compose logs --tail=20
    
    # Don't exit as failure, the app might still be starting
    echo "⏳ Services may still be starting up..."
fi

echo "🎉 Deployment completed!"
echo "📊 Final service status:"
podman-compose ps

echo ""
echo "🔗 Application should be available at:"
echo "   http://your-vm-ip"
echo "   http://rail-times-uk.com (after DNS setup)"
echo ""
echo "📝 Useful commands:"
echo "   View logs: podman-compose logs -f"
echo "   Check status: podman-compose ps"
echo "   Stop services: podman-compose down"
echo "   View specific service logs: podman-compose logs -f [nginx|backend|postgres]"
echo ""
echo "🔄 To deploy a new version:"
echo "   1. Update VERSION in .env file"
echo "   2. Run ./deploy.sh"
