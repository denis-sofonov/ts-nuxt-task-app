# syntax=docker/dockerfile:1

FROM node:26-alpine AS base
RUN corepack enable
WORKDIR /app

# --- builder: install (with a toolchain for native prebuild fallbacks) and
# build the Nitro output. Reused as the one-shot migration image, since it has
# the source, drizzle-kit and the migrations. ---
FROM base AS builder
# Skip the husky git-hooks install: there is no .git inside the build context.
ENV HUSKY=0
RUN apk add --no-cache python3 make g++
# Full source is copied before install so the `nuxt prepare` postinstall has a
# project to prepare; the pnpm store is cached across builds.
COPY . .
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile
RUN pnpm build

# --- runner: minimal production image, just Node + the built output. ---
FROM base AS runner
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
COPY --from=builder /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
