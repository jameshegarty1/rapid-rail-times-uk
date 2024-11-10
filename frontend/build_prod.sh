#!/bin/bash
source ../.env.prod

# Automatically authenticate to Heroku using the API key
echo "Authenticating with Heroku API..."
echo $HEROKU_API_KEY | docker login --username=_ --password-stdin registry.heroku.com
echo "Heroku app name: " $HEROKU_FRONTEND_APP_NAME
docker build --build-arg REACT_APP_API_URL=$REACT_APP_API_URL -t registry.heroku.com/$HEROKU_FRONTEND_APP_NAME/web .
heroku container:push web --app $HEROKU_FRONTEND_APP_NAME

heroku config:set REACT_APP_API_URL=$REACT_APP_API_URL --app $HEROKU_FRONTEND_APP_NAME

heroku stack:set container --app $HEROKU_FRONTEND_APP_NAME
heroku container:release web --app $HEROKU_FRONTEND_APP_NAME

heroku config --app $HEROKU_FRONTEND_APP_NAME
