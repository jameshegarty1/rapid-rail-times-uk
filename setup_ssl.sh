#!/bin/bash
set -e

DOMAIN="railtimes.net"
EMAIL="jhegartyodowd@gmail.com"

echo "Setting up SSL for $DOMAIN..."

# Create necessary directories
mkdir -p certbot/www certbot/conf ssl

cp nginx.conf.init nginx.conf

# Start services with HTTP-only config
echo "Starting containers with HTTP-only config..."
source .env
podman login docker.io -u "$DOCKERHUB_USER" -p "$DOCKERHUB_PAT"
podman-compose up -d frontend

# Wait for nginx to start
echo "Waiting for nginx to start..."
sleep 10

# Get SSL certificate using webroot mode
echo "Requesting SSL certificate from Let's Encrypt for domain: $DOMAIN"
podman run --rm \
    -v ./certbot/conf:/etc/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Restore full config with SSL
echo "Restoring full nginx config..."
cp nginx.conf.full nginx.conf

# Restart frontend with SSL config
echo "Restarting frontend with SSL..."
podman-compose restart frontend

echo "SSL setup complete!"
echo "Your site should now be available at: https://$DOMAIN"
