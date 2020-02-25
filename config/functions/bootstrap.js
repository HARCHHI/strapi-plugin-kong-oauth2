module.exports = () => {
  strapi.admin.config.routes.map((route) => {
    if (route.config) {
      console.log(route.config.policies);
    }
    return 1;
  });

  strapi.config.routes.map((route) => {
    if (route.config) {
      console.log(route.config.policies);
    }

    return 1;
  });
  // strapi.plugins.map(plugin => {
  //   console.log(plugin.config.routes);
  // })
};
