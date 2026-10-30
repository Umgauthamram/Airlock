FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy root monorepo configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# Copy packages and gateway
COPY packages/ packages/
COPY apps/gateway/ apps/gateway/

# Install dependencies with exact frozen lockfile and build packages
RUN pnpm install --frozen-lockfile
RUN pnpm -r --filter "./packages/*" build
RUN pnpm --filter @airlock/gateway build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy node_modules and built dist artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/gateway/node_modules ./apps/gateway/node_modules
COPY --from=builder /app/packages/ packages/
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder /app/apps/gateway/package.json ./apps/gateway/package.json

# Run as unprivileged node user
USER node

EXPOSE 4000

CMD ["node", "apps/gateway/dist/server.js"]
