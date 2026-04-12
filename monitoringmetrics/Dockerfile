FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Expose monitoring service port
EXPOSE 3001

CMD ["node", "src/server.js"]