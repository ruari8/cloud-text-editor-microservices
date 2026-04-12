# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create database directory
RUN mkdir -p /app/data

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy only necessary files from builder
COPY --from=builder /app/app.js ./
COPY --from=builder /app/init_db.js ./

ENV DB_PATH=/app/data/text_storage.db
VOLUME ["/app/data"]

EXPOSE 4000

CMD ["node", "app.js"]