const _ = require('lodash');

// **********************
// * police injection code from:
// * https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-users-permissions/middlewares/users-permissions/index.js
// **********************


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
