# Stage 1: Build the React app
FROM node:16 AS build

WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define build arguments
ARG REACT_APP_API_URL

# Set environment variables from build arguments
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app for production
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx/default.conf.prod /etc/nginx/conf.d/default.conf


# Expose the dynamic port
EXPOSE 8080

CMD ["sh", "-c", "nginx -g 'daemon off;'"]
