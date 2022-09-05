<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

## Description

Sticker Album (FIFA World Cup 2018) Backend for learning purposes

## Stack

* Nodejs https://nodejs.org/es/
* Nestjs https://nestjs.com/
* Prisma https://www.prisma.io/
* MongoDB https://www.mongodb.com/
* Socket.IO https://socket.io/
* Swagger https://swagger.io/

## Installation

```bash
$ sudo npm i -g @nestjs/cli
$ yarn install
```

## MongoDB

Run the following commands to setup mongodb docker container:

```bash
$ docker-compose up -d
$ docker-compose exec mongo mongo --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]});"
```

Create database and insert the stickers in the database by running the following python script:

```bash
$ pip install -r scripts/requirements.txt
$ python scripts/insert_stickers_in_mongodb.py
```

Create the rest of the schema:

```bash
$ yarn prisma:dev:deploy
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev
```

## Swagger

API documentation will be available at: http://localhost:3000/api/docs

## Prisma Studio

Run prisma studio in port 2323

```bash
$ npx prisma studio --port 2323
```

## Websocket

Trading system is implemented through Socket.IO

You can use Postman to establish a websocket connection at: http://localhost:3000/trading

Provide the auth token (/signin) in the Authorization header

Suported events:

* pullTrades (client->server): ask the server for pending trades. Message body can be empty

* pushTrades (server->client): server response to the client with the pending (not acked) trades

* ackTrade (client->server): client send an ack for received trades. Message body must be the acked trade id (that came in the server message)