#!/bin/bash
set -e

echo "🚀 Deploying version $VERSION..."

podman pull docker.io/${DOCKERHUB_USER}/${FRONTEND_REPO_NAME}:${VERSION}
podman pull docker.io/${DOCKERHUB_USER}/${BACKEND_REPO_NAME}:${VERSION}

#systemctl --user stop rail-times-uk.service
#systemctl --user start rail-times-uk.service

podman-compose down
podman-compose up -d

sleep 10
if curl -sf http://localhost:8080/nginx-health >/dev/null; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed"
    journalctl --user -u rail-times-app.service --lines=20
    exit 1
fi
