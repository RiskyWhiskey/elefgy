'use strict';

const path = require('path');
const winston = require('winston');
const cluster = require('cluster');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const environment = process.env.NODE_ENV || 'development';

// Setup the logging
const setupWinston = require('./bin/setupWinston');
setupWinston.start();

// Development only
if (environment === 'development') {
  const dotenv = require('dotenv').config();
  setupWinston.toFile();
}

// Config could be better
const elefgy = {
  name: 'elefgy',
  version: '0.0.1',
};

if (cluster.isMaster) {
  // Create workers
  winston.info(`${elefgy.name} ${elefgy.version} starting (${process.pid})`);
  const clusterSize = process.env.WEB_CONCURRENCY || 1;
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork();
  }
  // Workers are alive
  cluster.on('listening', (worker, address) => {
    winston.info(`worker ${worker.process.pid} listening on ${address.port}`);
  });
  // Replace dead workers
  cluster.on('exit', (worker, code, signal) => {
    if (code === null) {
      winston.info(`worker ${worker.process.pid} has exited (${signal})`);
    } else if (code !== 0) {
      winston.error(`worker ${worker.process.pid} has exited (${code})`);
    } else if (signal === null) {
      winston.info(`worker ${worker.process.pid} has exited (${code})`);
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
    winston.info(`${elefgy.name} exiting (${code})`);
  });

} else {
  // Workers connect to database
  const setupMongoose = require('./bin/setupMongoose');
  try {
    setupMongoose.start();
  } catch {
    winston.error(`worker ${process.pid} cannot connect to database`);
    process.exit(1);
  }
  setupMongoose.listen();
  // Each worker is serving requests
  const app = express();
  app.use(helmet());
  app.use(express.static(path.join(__dirname, 'public')));
  if (process.env.ELEFGY_DOWN === 'true') {
    app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'down.html'));
    });
  } else {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.get('/', (req, res) => {
      res.render('home');
    });
  }
  const port = process.env.PORT || 5000;
  const server = app.listen(port);
  // Graceful exit
  process.on('exit', () => {
    mongoose.disconnect();
    server.close();
  });
}
