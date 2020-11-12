if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const cluster = require('cluster');
const express = require('express');
const path = require('path');
const helmet = require('helmet');

const elefgy = {
  name: 'elefgy',
  version: '0.0.1'
};

if (cluster.isMaster) {
  // Create workers
  console.log(`[${elefgy.name}] ${elefgy.version} starting (${process.pid})`);
  const clusterSize = process.env.WEB_CONCURRENCY || 1;
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork();
  }
  // Workers are alive
  cluster.on('listening', (worker, address) => {
    console.log(`[${elefgy.name}] worker ${worker.process.pid}`,
        `listening on ${address.port}`);
  });
  // Replace dead workers
  cluster.on('exit', (worker, code, signal) => {
    if (code === null) {
      console.log(`[${elefgy.name}] worker ${worker.process.pid}`,
          `has exited (${signal})`);
    }
    if (signal === null) {
      console.log(`[${elefgy.name}] worker ${worker.process.pid}`,
          `has exited (${code})`);
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
    console.log(`[${elefgy.name}] exiting (${code})`);
  });

// Each worker is serving requests
} else {
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
