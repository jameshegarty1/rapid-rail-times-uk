#!/bin/bash

source .env.prod

# Automatically authenticate
echo "Authenticating with Dockerhub..."
echo $DOCKERHUB_PAT | docker login --username $DOCKERHUB_USER --password-stdin

echo "Building and pushing backend: " $BACKEND_REPO_NAME $VERSION
docker build --platform linux/amd64 --build-arg LDB_TOKEN=$LDB_TOKEN --build-arg WSDL=$WSDL -t $DOCKERHUB_USER/$BACKEND_REPO_NAME:$VERSION -f backend/Dockerfile backend/
docker push $DOCKERHUB_USER/$BACKEND_REPO_NAME:$VERSION

echo "Building and pushing frontend: " $FRONTEND_REPO_NAME $VERSION
docker build --platform linux/amd64 --build-arg REACT_APP_API_URL=$REACT_APP_API_URL -t $DOCKERHUB_USER/$FRONTEND_REPO_NAME:$VERSION -f frontend/Dockerfile frontend/
docker push $DOCKERHUB_USER/$FRONTEND_REPO_NAME:$VERSION 
