module.exports = async (ctx, next) => {
  const userName = ctx.headers['x-consumer-username'];
  const userId = ctx.headers['x-consumer-id'];
  const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
  let token = '';

  if (!userName || !userId || !ctx.request.header.authorization) {
    return next();
  }

  if (!KONG_ADMIN_HOST || !KONG_ADMIN_PORT) {
    strapi.log.debug('kong-oauth2: Kong admin configuration missing');
    return next();
  }

  const parts = ctx.request.header.authorization.split(' ');

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  } else {
    throw new Error(
      'Invalid authorization header format. Format is Authorization: Bearer [token]',
    );
  }

  if (token === '') return next();

  try {
    await strapi.plugins['kong-oauth2'].services['kong-admin'].validateToken(token, userName);
  } catch (error) {
    strapi.log.debug(`kong-oauth2: ${error.message}`);
    return next();
  }

  const jwtToken = await strapi.plugins['kong-oauth2'].services.jwt.issue(userId, userName);

  ctx.request.header.authorization = `Bearer ${jwtToken}`;
  await next();
};
