const { config } = require("winston");

'use strict'

const elefgyConfig = {
  name: 'elefgy',
  version: '0.0.1',
  staticUrl: 'https://elefgy.azureedge.net/static/',
  userContentUrl: 'https://elefgy.azureedge.net/usercontent/',
  allowedOrigins: 'elefgy.azureedge.net',
  downForMaintenance: process.env.ELEFGY_DOWN || false,
  workerCluster: process.env.WEB_CONCURRENCY || 1,
  port: process.env.PORT || 5000,
};

module.exports = elefgyConfig;
