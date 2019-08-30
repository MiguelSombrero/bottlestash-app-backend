# Install the application

## Requirements

To run the project on your own machine you must have [Node.js](https://nodejs.org/en/) (at least version 8.0) installed.

## Cloning project

Clone project to your computer:

    git clone https://github.com/MiguelSombrero/bottlestash-app-backend

## Set up environment variables

Application is dependant on next environment variables you must set before starting the application

    MONGODB_URI=<PATH TO YOUR MONGO_DB DATABASE>

    PORT=<PORT SERVER LISTENS>

    SECRET=<SECRET STRING FOR PASSWORD HASHING>

This project uses [dotenv](https://www.npmjs.com/package/dotenv) -library to handle environment variables. Save .env -file to your applications root directory and set your variables there.

## Install dependencies and run

Navigate in cloned folder (bottlestash-app-backend), install dependencies and start application

    npm install
    npm run start