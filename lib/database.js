'use strict';

const winston = require('winston');
const mongoose = require('mongoose');

const connect = (databaseUrl) => {
  mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const listen = () => {
  mongoose.connection.on('error', () => {
    winston.error(`worker ${process.pid} had a database connection error`);
  });
  mongoose.connection.on('connected', () => {
    winston.info(`worker ${process.pid} connected to database`);
  });
  mongoose.connection.on('disconnected', () => {
    winston.info(`worker ${process.pid} disconnected from database`);
  });
}

module.exports = {
  connect,
  listen,
};
