# C-Chain Indexer

An example of a blockchain indexer, implemented for Avax (C-chain) but compatible with any EVM blockchain. This project
contains 2 bricks:

- An indexer that tracks blocks and transactions as well as a history of 10,000 blocks.
- An api that allows to :
  - list transactions made or received from a certain address
  - get the number of transactions made or received from a certain address
  - list of transactions sorted by value (amount of $AVAX moved)
  - list of 100 addresses with largest balance that made or received a transaction
  - a (debug) endpoint to see the current indexed blocks

## Stack

The global stack is :

- MongoDB
- Typescript
- NestJs

Other libs :

- [TurboRepo](https://turbo.build/) for project repository
- Eslint/prettier for code linting/styling
- [Prisma](https://www.prisma.io/) for Orm
- [Zod](https://zod.dev/) for type validation
- Jest for testing

## Architecture

This is the following repo architecure : Each service has its own Dockerfile. The docker-compose allows to run them all
in the same time

```
/
  /apps
    /indexer
      Dockerfile

    /api
      Dockerfile


  /packages (common config)
    / tsconfig
    / eslint
    / database (prisma ORM schema definition)


  /mongodb
    Dockerfile

  docker-compose.yml
```

## Setup

Create a `.env` file based on the `.env.template` :

```
cp .env.template .env
```

You can for example use these values :

```
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=prisma
MONGO_INITDB_DATABASE=blockchain-indexer
MONGO_REPLICA_PORT=27017
INDEXER_MAX_HISTORY=1000
```

The variable INDEXER_MAX_HISTORY represents the number of blocks that will be retrieved by the indexer

## Start

```
docker-compose up
```

This will create the containers. You have to wait a few moments for the MongoDB replicat to set up. When the container
is ready, the api and the indexer will start

You can access the api at the following address http://localhost:3000

If its status is OK, you should have this answer on a /GET http://localhost:3000/

```
# /GET http://localhost:3000
{"data":"ok"}
```

## Development

Using Node 18 :

### Installation :

```
yarn
```

### Build :

```
yarn build
```

### Test :

```
yarn test
```

You may want to start services separatly, if it's the case you can start the indexer with `ts-node` : (in the indexer
folder) Don't forget to add the correct env variables

```
npx ts-node src/index.ts
```

And for the API : (in the api folder)

```
yarn start:dev
```
