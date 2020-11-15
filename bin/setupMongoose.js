'use strict';

const winston = require('winston');
const mongoose = require('mongoose');

const setupMongoose = {
  start: () => {
    mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },
  listen: () => {
    mongoose.connection.on('error', () => {
      winston.error(`worker ${process.pid} has had a database connection error`);
    });
    mongoose.connection.on('connected', () => {
      winston.info(`worker ${process.pid} connected to database`);
    });
    mongoose.connection.on('disconnected', () => {
      winston.info(`worker ${process.pid} disconnected from database`);
    });
  },
};

module.exports = setupMongoose;
