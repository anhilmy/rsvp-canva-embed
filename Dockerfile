# Canva App Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip postinstall script for Docker)
RUN npm ci --ignore-scripts

# Copy source files
COPY . .

# Build argument for backend host
ARG CANVA_BACKEND_HOST
ENV CANVA_BACKEND_HOST=$CANVA_BACKEND_HOST

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create proper nginx config with MIME types
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Proper MIME types for JS modules \
    types { \
        text/html html; \
        text/css css; \
        application/javascript js mjs; \
        application/json json; \
    } \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache static assets \
    location ~* \\.(?:css|js|mjs|json|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
