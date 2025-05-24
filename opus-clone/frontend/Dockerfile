# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration
# Adjust path if you placed nginx.conf in a subdirectory e.g. /config/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
