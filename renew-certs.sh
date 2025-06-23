#!/bin/bash
# renew-certs.sh
#systemctl --user stop rail-times-uk.service
podman-compose down
sudo certbot renew
sudo cp /etc/letsencrypt/live/rail-times-uk.com/*.pem ./ssl/
sudo chown $(id -u):$(id -g) ./ssl/*
podman-compose up -d
#systemctl --user start rail-times-uk.service
