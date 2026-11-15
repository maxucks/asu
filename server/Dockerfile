# Match repo bun.lock (lockfileVersion 2); 1.3.x images cannot parse it.
FROM oven/bun:1.4-alpine
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]