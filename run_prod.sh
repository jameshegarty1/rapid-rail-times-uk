#!/bin/bash

source .env.prod.local
export $(grep -v '^#' .env.prod.local | cut -d= -f1)
podman compose -f compose.prod.yml pull
podman compose -f compose.prod.yml up -d --build
