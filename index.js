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

// Main process creates workers and listens for their exit
if (cluster.isMaster) {
  console.log(`[${elefgy.name}] ${elefgy.version} has started`);
  const clusterSize = process.env.WEB_CONCURRENCY || 1;
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork();
  }
  cluster.on('listening', (worker, address) => {
    console.log(`[${elefgy.name}] worker ${worker.process.pid}`,
        `listening on ${address.port}`);
  });
  cluster.on('exit', (worker, code, signal) => {
    console.log(`[${elefgy.name}] worker ${worker.process.pid}`,
        `has exited (${code || signal}) restarting`);
    cluster.fork();
  });

// Each worker creates a server to listen to port
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
