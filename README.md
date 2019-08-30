# Bottlestash App (backend)

This is a project work for the Helsinki University course [Full Stack Open 2019](https://fullstackopen.com/). Bottlestash is an application that lets you manage your beer cellar, rate beers and more.

This repository is for the apps backend only, allthough all documentation will be in this repository. You can find frontend repository from [bottlestash-app-frontend](https://github.com/MiguelSombrero/bottlestash-app-frontend)

## Main features

- Save beers in your stash to keep track what beers you have
- Search for stashes to see what beers other users have
- Rate beers and read ratings from others

## Documentation

[Clone and install](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/instructions.md)

[User Manual](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/user_manual.md)

[Hours](https://github.com/MiguelSombrero/bottlestash-app-backend/tree/master/docs/hours.md)

## Bottlestash App on live

The latest version of this application is running on Heroku and you can find it here:

[Bottlestash - Heroku](https://tranquil-inlet-27418.herokuapp.com/)

## Implementation

### Backend

Server side functionality is implemented with Node.js and Express-library. Data is persisted with axios and MongoDb.

### Frontend

Client side is implemented with React. React-bootstrap is used for styling the app.