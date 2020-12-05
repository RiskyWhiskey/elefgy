'use strict';

const path = require('path');
const winston = require('winston');
const cluster = require('cluster');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const environment = process.env.NODE_ENV || 'development';

// Setup the logging
const logging = require('./lib/logging');
logging.start();

// Development only
if (environment === 'development') {
  const dotenv = require('dotenv');
  dotenv.config();
  const logFile = './logs/app.log';
  logging.toFile(logFile);
}

// Commonly used constants
const config = require('./lib/config');

if (cluster.isMaster) {
  // Create workers
  winston.info(`${config.name} ${config.version} starting (${process.pid})`);
  const threads = require('./lib/threads');
  threads.start(config.workerCluster);
  threads.listen();
  // Exit and kill all workers
  process.on('SIGTERM', (code) => {
    for (const id in cluster.workers) cluster.workers[id].kill();
    winston.info(`${elefgy.name} exiting (${code})`);
  });

} else {
  // Workers connect to database
  const database = require('./lib/database');
  const databaseUri = process.env.DATABASE_URI;
  database.connect(databaseUri);
  database.listen();
  // Each worker is serving requests
  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          blockAllMixedContent: [],
          fontSrc: ["'self' https: data:"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", config.allowedOrigins],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self' https: 'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );
  app.use(express.static(config.staticUrl));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    res.render('home', {
      staticUrl: config.staticUrl,
      userContentUrl: config.userContentUrl,
    });
  });
  const server = app.listen(config.port);
  // Graceful exit
  process.on('exit', () => {
    mongoose.disconnect();
    server.close();
  });
}
