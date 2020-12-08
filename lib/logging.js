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

module.exports = {
  start,
};
