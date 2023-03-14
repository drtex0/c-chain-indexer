FROM node:18

RUN apt-get -qy update && apt-get -qy install openssl

WORKDIR /app

COPY ../../package*.json ./

RUN yarn

COPY . .

RUN yarn build

RUN npx prisma generate

CMD ["node", "dist/index.js" ]