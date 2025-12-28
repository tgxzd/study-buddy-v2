# =============================================================================
# Build Stage - Compile the application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# =============================================================================
# Production Stage - Minimal runtime image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 studybuddy

# Copy from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.container/scripts ./scripts

# Set ownership
RUN chown -R studybuddy:nodejs /app

# Switch to non-root user
USER studybuddy

EXPOSE 3000

ENV NODE_ENV=production

# Default to production startup script
ENTRYPOINT ["/app/scripts/2-start-prod.sh"]
