FROM node:22-slim

WORKDIR /app

# npm itself crashes with "Exit handler never called!" on Node 22 inside
# several CI/Docker builders (npm/cli#8974) — install with pnpm instead.
# pnpm uses its own fetch pipeline and is unaffected.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json ./
RUN pnpm install --prod

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
