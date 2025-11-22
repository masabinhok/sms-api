## Multi-stage Dockerfile for deploying the NestJS monorepo and running the gateway app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (dev + prod) so we can build and run prisma generate
RUN npm ci

# Copy full repository
COPY . .

# Generate Prisma clients for all app schemas (ignore failures if no schema found)
RUN set -eux; \
    for f in apps/*/prisma/schema.prisma; do \
      if [ -f "$f" ]; then npx prisma generate --schema="$f" || true; fi; \
    done

# Build the project (nest build configured in repo)
RUN npm run build --if-present

### Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy package manifests and install only production deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Copy generated prisma client artifacts from builder (if present)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# copy start script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the gateway app (runs migrations then the server)
CMD ["sh", "./start.sh"]
