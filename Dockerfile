FROM node:22-alpine AS builder

WORKDIR /app

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hr?schema=public"

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./
COPY src ./src
COPY seed.js ./

RUN mkdir -p /app/logs && chown -R node:node /app

USER node

EXPOSE 4500

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]