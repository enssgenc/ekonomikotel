FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && npm run check
RUN npm prune --omit=dev --no-audit --no-fund

FROM node:24-alpine
LABEL org.opencontainers.image.title="ekonomikotel" \
      org.opencontainers.image.description="Ekonomikotel hotel and tour catalogue with administration" \
      org.opencontainers.image.source="https://github.com/enssgenc/ekonomikotel"
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data TRUST_PROXY=1
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/.ssr ./.ssr
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/src/lib ./src/lib
COPY --from=build --chown=node:node /app/src/data/catalog.json ./src/data/catalog.json
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server/index.mjs"]
