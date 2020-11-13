'use strict';

const winston = require('winston');
const cluster = require('cluster');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');

// The logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 3,
      tailable: true,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

// Development only
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Config could be better
const elefgy = {
  name: 'elefgy',
  version: '0.0.1',
};

if (cluster.isMaster) {
  // Create workers
  logger.info(`${elefgy.name} ${elefgy.version} starting (${process.pid})`);
  const clusterSize = process.env.WEB_CONCURRENCY || 1;
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork();
  }
  // Workers are alive
  cluster.on('listening', (worker, address) => {
    logger.info(`worker ${worker.process.pid} listening on ${address.port}`);
  });
  // Replace dead workers
  cluster.on('exit', (worker, code, signal) => {
    if (code === null) {
      logger.info(`worker ${worker.process.pid} has exited (${signal})`);
    } else if (code !== 0) {
      logger.error(`worker ${worker.process.pid} has exited (${code})`);
    } else if (signal === null) {
      logger.info(`worker ${worker.process.pid} has exited (${code})`);
    }
    if (signal !== 'SIGTERM') {
      cluster.fork();
    }
  });
  // Exit and kill all workers
  process.on('SIGTERM', (code) => {
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    logger.info(`${elefgy.name} exiting (${code})`);
  });

} else {
  // Workers connect to database
  mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    logger.info(`worker ${process.pid} connected to database`);
  });
  // Each worker is serving requests
  const PORT = process.env.PORT || 5000;
  const app = express();
  app.use(helmet());
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    res.render('home');
  });
  const server = app.listen(PORT);
  process.on('exit', () => {
    server.close();
  });
}
