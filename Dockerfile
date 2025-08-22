FROM node:20-bullseye

# Workdir
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source (tests + config)
COPY . .

# Default command runs your tests via the SDK
CMD ["npm", "run", "test"]
