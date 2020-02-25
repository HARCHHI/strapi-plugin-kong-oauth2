const axios = require('axios');

async function validateToken(token, userId) {
  const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;

  if (!KONG_ADMIN_HOST || !KONG_ADMIN_PORT) {
    throw new Error('Kong admin configuration missing');
  }

  const {
    data,
  } = await axios.get(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}/oauth2_tokens/${token}`);

  const {
    created_at: createdAt,
    authenticated_userid: kongUserId,
    expires_in: expiresIn,
    message,
  } = data;


  if (message === 'Not found') {
    throw new Error('Token not found');
  }

  if ((createdAt * 1000 + expiresIn * 1000) < Date.now()) {
    throw new Error('Token expired');
  }

  if (!kongUserId || kongUserId !== userId) {
    throw new Error('Token user not found');
  }
}

module.exports = {
  validateToken,
};
