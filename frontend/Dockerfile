# Build stage - Node.js for React build
FROM node:20-alpine as build

WORKDIR /app

# Copy package files for layer caching
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage - Nginx for serving
FROM nginx:alpine

# Copy built app to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]