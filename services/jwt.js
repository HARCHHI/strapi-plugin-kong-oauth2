async function issue(userId, userName) {
  let user = await strapi.query('user', 'users-permissions')
    .findOne({ username: userName });

  if (user === null) {
    user = await strapi
      .plugins['kong-oauth2']
      .services.user.create(userId, userName);
  }

  return strapi.plugins['users-permissions'].services.jwt.issue({
    id: user.id,
  });
}

module.exports = {
  issue,
};
