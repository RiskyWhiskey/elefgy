const { config } = require("winston");

'use strict'

const elefgyConfig = {
  name: 'elefgy',
  version: '0.0.1',
  staticUrl: 'https://elefgy.azureedge.net/static/',
  userContentUrl: 'https://elefgy.azureedge.net/usercontent/',
  allowedOrigins: 'elefgy.azureedge.net',
};

module.exports = elefgyConfig;
