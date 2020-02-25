const _ = require('lodash');

module.exports = () => ({
  beforeInitialize() {
    strapi.config.middleware.load.before.unshift('maxwin-auth');
  },

  initialize() {
    _.forEach(strapi.admin.config.routes, (value) => {
      if (_.get(value.config, 'policies')) {
        value.config.policies.unshift(
          'plugins.maxwin-auth.auth',
        );
      }
    });

    _.forEach(strapi.config.routes, (value) => {
      if (_.get(value.config, 'policies')) {
        value.config.policies.unshift(
          'plugins.maxwin-auth.auth',
        );
      }
    });

    if (strapi.plugins) {
      _.forEach(strapi.plugins, (plugin) => {
        _.forEach(plugin.config.routes, (value) => {
          if (_.get(value.config, 'policies')) {
            value.config.policies.unshift(
              'plugins.maxwin-auth.auth',
            );
          }
        });
      });
    }
  },
});
