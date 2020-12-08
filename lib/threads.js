'use strict';

const winston = require('winston');
const cluster = require('cluster');

const createWorkers = (clusterSize) => {
  for (let i = 0; i < clusterSize; i++) cluster.fork();
}

const listenToWokers = () => {
  cluster.on('listening', (worker, address) => {
    winston.info(`worker ${worker.process.pid} listening on ${address.port}`);
  });
  cluster.on('exit', (worker, code, signal) => {
    if (worker.exitedAfterDisconnect === true) {
      winston.info(`worker ${worker.process.pid} exited`);
    } else {
      winston.error(`worker ${worker.process.pid} died`);
      cluster.fork();
    }
  });
}

const killWorkersOnExit = () => {
  process.on('SIGTERM', () => {
    for (const id in cluster.workers) cluster.workers[id].kill();
  });
}

module.exports = {
  createWorkers,
  listenToWokers,
  killWorkersOnExit,
};
