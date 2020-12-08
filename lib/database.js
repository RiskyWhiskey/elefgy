'use strict';

const winston = require('winston');
const mongoose = require('mongoose');

const connect = (databaseUrl) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  mongoose.connect(databaseUrl, options)
    .then(() => {
      winston.info(`worker ${process.pid} connected to database`);
      listen();
    })
    .catch((error) => {
      winston.error(`worker ${process.pid} failed connection with database `);
      return;
    });
}

function listen() {
  mongoose.connection.on('error', () => {
    winston.error(`worker ${process.pid} had a database connection error`);
  });
  mongoose.connection.on('disconnected', () => {
    winston.info(`worker ${process.pid} disconnected from database`);
  });
}

module.exports = {
  connect,
};
