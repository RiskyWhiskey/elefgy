'use strict';

const winston = require('winston');
const cluster = require('cluster');

const setupCluster = {
  start: (clusterSize) => {
    for (let i = 0; i < clusterSize; i++) {
      cluster.fork();
    }
  },
  liston: () => {
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
  },
};

module.exports = setupCluster;