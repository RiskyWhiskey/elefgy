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
  const logFile = process.env.LOG_FILE;
  logging.toFile(logFile);
}

// Commonly used strings
const config = require('./lib/config');

if (cluster.isMaster) {
  // Create workers
  winston.info(`${config.name} ${config.version} starting (${process.pid})`);
  const clusterSize = process.env.WEB_CONCURRENCY || 1;
  const threads = require('./lib/threads');
  threads.start(clusterSize);
  threads.listen();
  // Exit and kill all workers
  process.on('SIGTERM', (code) => {
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    winston.info(`${elefgy.name} exiting (${code})`);
  });

} else {
  // Workers connect to database
  const database = require('./lib/database');
  const databaseUrl = process.env.DATABASE_URI;
  database.connect(databaseUrl);
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
  const port = process.env.PORT || 5000;
  const server = app.listen(port);
  // Graceful exit
  process.on('exit', () => {
    mongoose.disconnect();
    server.close();
  });
}
