FROM oven/bun:1 AS builder
WORKDIR /usr/src/app

RUN apt update && apt install -y git && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock tsconfig.json ./

COPY packages/api ./packages/api
COPY packages/data ./packages/data
COPY packages/txs ./packages/txs
COPY packages/math ./packages/math
COPY packages/blockfrost/ ./packages/blockfrost/

COPY packages/app/package.json ./packages/app/
COPY packages/cli/package.json ./packages/cli/

RUN bun i --frozen-lockfile

FROM oven/bun:1-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

WORKDIR /usr/src/app/packages/api

EXPOSE 8080

ENTRYPOINT ["bun", "src/index.ts"]
