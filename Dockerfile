FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./

RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Run server
CMD ["node", "src/server.js"]
