# Bottlestash App (backend)

This is a project work for the Helsinki University course [Full Stack Open 2019](https://fullstackopen.com/). Bottlestash is an application that lets you manage your beer cellar, rate beers and more.

This repository is for the apps backend and documentation. You can find frontend repository from [bottlestash-app-frontend](https://github.com/MiguelSombrero/bottlestash-app-frontend)

## Main features

- Save beers in your stash to keep track what beers you have
- Search for stashes to see what beers other users have
- Rate beers and read ratings from others

## Documentation

[Clone and install](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/instructions.md)

[User Manual for Bottlestash](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/user_manual.md)

[Hours](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/hours.md)

## Bottlestash App on live

The latest version of this application is running on Heroku:

[Bottlestash - Heroku](https://tranquil-inlet-27418.herokuapp.com/)

## Implementation

Server side (backend) is implemented with [Node.js](https://nodejs.org/en/) and [Express](https://expressjs.com/). Data is persisted with axios and MongoDb.

## Tests

Integration testing is done with [Jest](https://jestjs.io/) and [Supertest](https://www.npmjs.com/package/supertest). Test coverage is for branches ~ 79 % and for lines ~ 91 %.

Tests can be run on applications root directory

    npm test

Test coverage report

    CI=true npm test -- --coverage