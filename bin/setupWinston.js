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
    if (process.env.NODE_ENV === 'development') {
      winston.add(new winston.transports.File({
        filename: 'logs/app.log',
        maxsize: 5242880,
        maxFiles: 3,
        tailable: true,
      }));
    }
  }
};

module.exports = setupWinston;
