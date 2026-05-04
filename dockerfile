# -------------------------
# 1. Build Stage
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# -------------------------
# 2. Production Stage
# -------------------------
FROM node:20-alpine

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy env if needed (optional)
# COPY .env .env

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/server.js"]