'use strict';

const config = require('./server/config');
const controllers = require('./server/controllers');
const routes = require('./server/routes');
const services = require('./server/services');

module.exports = () => ({
  config,
  controllers,
  routes,
  services,
});
