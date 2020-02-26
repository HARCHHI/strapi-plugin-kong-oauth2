async function create(userId, userName) {
  const advanced = await strapi
    .store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
      key: 'advanced',
    })
    .get();

  const defaultRole = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: advanced.default_role }, []);

  return strapi
    .query('user', 'users-permissions')
    .create({
      id: userId,
      username: userName,
      email: 'email@email.email',
      provider: 'kong',
      role: defaultRole.id,
      confirmed: true,
    });
}

module.exports = {
  create,
};
