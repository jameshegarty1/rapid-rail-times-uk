#!/bin/bash
set -e

DOMAIN="railtimes.net"

echo "Checking certificate renewal for $DOMAIN..."

podman run --rm \
  -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot \
  certbot/certbot renew \
  --non-interactive \
  --agree-tos

if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "Certificates renewed, updating..."
    cp -f certbot/conf/live/$DOMAIN/fullchain.pem ssl/
    cp -f certbot/conf/live/$DOMAIN/privkey.pem ssl/

    podman-compose exec frontend nginx -s reload
    echo "Certificates updated and nginx reloaded at $(date)"
else
    echo "Certificates not due for renewal"
fi
