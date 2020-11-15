'use strict';

const winston = require('winston');

const setupWinston = {
  start: () => {
    winston.configure({
      level: 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console(),
      ],
    });
  },
  toFile: (file) => {
    winston.add(new winston.transports.File({
      filename: file,
      maxsize: 5242880,
      maxFiles: 3,
      tailable: true,
    }));
  },
};

module.exports = setupWinston;
