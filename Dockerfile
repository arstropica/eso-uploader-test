FROM node:18.20.4-alpine3.20

# Workdir
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source (tests + config)
COPY . .

# Default command runs your tests via the SDK
CMD ["npm", "run", "test"]
