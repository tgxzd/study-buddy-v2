# Use Node.js 24 Alpine as base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL and other dependencies needed for Prisma
RUN apk add --no-cache openssl1.1

# Copy package files first (better caching)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma Client
RUN yarn prisma generate

# Build the application
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
