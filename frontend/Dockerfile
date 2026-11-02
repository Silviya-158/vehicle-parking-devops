# ============================================================
# Stage 1: Build the React Application
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production and dev dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# ============================================================
# Stage 2: Serve with Nginx Alpine
# ============================================================
FROM nginx:1.27-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx docroot
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
