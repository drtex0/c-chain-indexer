FROM node:18 as builder

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=indexer --docker


FROM node:18 as installer
WORKDIR /app

# Install scoped repo dependencies 
COPY .gitignore .gitignore
COPY --from=builder  /app/out/json/ .
COPY --from=builder  /app/out/yarn.lock ./yarn.lock
RUN yarn install
RUN ls -l .

# Build scoped repo
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=indexer

FROM node:18 as runner
WORKDIR /app
COPY --from=installer /app .

RUN ls -l /app


CMD ["node", "apps/indexer/dist/index.js" ]

