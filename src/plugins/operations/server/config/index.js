'use strict';

module.exports = {
  default: {
    localLawUrl: '',
    adminApiToken: '',
  },
  validator(config) {
    if (config.localLawUrl != null && typeof config.localLawUrl !== 'string') {
      throw new Error('plugin::operations config.localLawUrl must be a string');
    }
    if (config.adminApiToken != null && typeof config.adminApiToken !== 'string') {
      throw new Error('plugin::operations config.adminApiToken must be a string');
    }
  },
};
