'use strict';

const winston = require('winston');

const start = () => {
  winston.configure({
    level: 'info',
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console(),
    ],
  });
}

const toFile = (file) => {
  winston.add(new winston.transports.File({
    filename: file,
    maxsize: 5242880,
    maxFiles: 3,
    tailable: true,
  }));
}

module.exports = {
  start,
  toFile,
};
