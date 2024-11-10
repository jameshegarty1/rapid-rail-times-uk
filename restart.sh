#!/bin/zsh

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Stopping current podman compose services..."
podman compose down

if [ "$1" = "f" ]; then
    log "Building podman images with no cache..."
    podman compose build --no-cache
else
    log "Building podman images..."
    podman compose build
fi

log "Starting podman compose services..."
podman compose --env-file .env.dev up -d
log "Services started."
