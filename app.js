'use strict';

const cluster = require('cluster');
const winston = require('winston');
const express = require('express');
const helmet = require('helmet');
//const mongoose = require('mongoose');

const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
  const dotenv = require('dotenv');
  dotenv.config();
}

const config = require('./lib/config');
const logging = require('./lib/logging');
const threads = require('./lib/threads');
//const database = require('./lib/database');

logging.start();

if (cluster.isMaster) {
  winston.info(`${config.name} ${config.version} starting (${process.pid})`);
  threads.createWorkers(config.workerCluster);
  threads.listenToWokers();
  threads.killWorkersOnExit();

} else {
  //const databaseUri = config.databaseUri;
  //database.connect(databaseUri);
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
  app.set('views', './views');
  app.set('view engine', 'ejs');
  app.get('/', (req, res) => {
    res.render('home', {
      staticUrl: config.staticUrl,
      userContentUrl: config.userContentUrl,
    });
  });
  const server = app.listen(config.port);
  process.on('exit', () => {
    //mongoose.disconnect();
    server.close();
  });
}
