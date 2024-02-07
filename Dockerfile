FROM node:18.15.0-slim as prisma

ENV DATABASE_URL="file:/src/db.db"
WORKDIR /src
COPY --link prisma/ ./prisma

RUN npx prisma generate && npx prisma db push
RUN npm prune


FROM oven/bun
WORKDIR /app

ENV DATABASE_URL="file:/app/db/db.db"
CMD ["bun" , "src/index.ts"]
EXPOSE 3000

COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install
COPY . .
COPY --from=prisma /src/node_modules/.prisma /app/node_modules/.prisma
COPY --from=prisma /src/node_modules/@prisma /app/node_modules/@prisma
COPY --from=prisma /src/db.db /app/db/db.db
RUN bun seed

LABEL org.opencontainers.image.source=https://github.com/PassiDel/mkss-klausur-rest