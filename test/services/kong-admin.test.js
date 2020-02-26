const nock = require('nock');
const { validateToken } = require('../../services/kong-admin');

beforeEach(() => {
  process.env.KONG_ADMIN_HOST = 'kong.com';
  process.env.KONG_ADMIN_PORT = '8811';
});

describe('test service kong-admin', () => {
  describe('validateToken', () => {
    const token = 'token';
    const userId = 'userId';

    test('should throw error when kong admin uri not configed', async () => {
      delete process.env.KONG_ADMIN_HOST;
      delete process.env.KONG_ADMIN_PORT;

      try {
        await validateToken(token, userId);

        throw new Error('expect throw error, but not');
      } catch (error) {
        expect(error.message).toEqual('Kong admin configuration missing');
      }
    });

    test('should capture token not found error', async () => {
      const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
      nock(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}`)
        .get(`/oauth2_tokens/${token}`)
        .reply(200, { message: 'Not found' });

      try {
        await validateToken(token, userId);

        throw new Error('expect throw error, but not');
      } catch (error) {
        expect(error.message).toEqual('Token not found');
      }
      nock.cleanAll();
    });

    test('should capture token expired error', async () => {
      const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
      nock(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}`)
        .get(`/oauth2_tokens/${token}`)
        .reply(200, {
          created_at: 0,
          expires_in: 10,
        });
      try {
        await validateToken(token, userId);

        throw new Error('expect throw error, but not');
      } catch (error) {
        expect(error.message).toEqual('Token expired');
      }
      nock.cleanAll();
    });

    test('should capture empty user error', async () => {
      const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
      nock(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}`)
        .get(`/oauth2_tokens/${token}`)
        .reply(200, {
          created_at: Date.now() / 1000,
          expires_in: 10,
        });

      try {
        await validateToken(token, userId);
        throw new Error('expect throw error, but not');
      } catch (error) {
        expect(error.message).toEqual('Token user not found');
      }
      nock.cleanAll();
    });

    test('should capture token user not found error', async () => {
      const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
      nock(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}`)
        .get(`/oauth2_tokens/${token}`)
        .reply(200, {
          created_at: Date.now() / 1000,
          expires_in: 10,
          authenticated_userid: 'other id',
        });
      try {
        await validateToken(token, userId);
        throw new Error('expect throw error, but not');
      } catch (error) {
        expect(error.message).toEqual('Token user not found');
      }
      nock.cleanAll();
    });

    test('should pass trycache', async () => {
      const { KONG_ADMIN_HOST, KONG_ADMIN_PORT } = process.env;
      nock(`http://${KONG_ADMIN_HOST}:${KONG_ADMIN_PORT}`)
        .get(`/oauth2_tokens/${token}`)
        .reply(200, {
          created_at: Date.now() / 1000,
          expires_in: 10,
          authenticated_userid: userId,
        });
      try {
        await validateToken(token, userId);
      } catch (error) {
        throw new Error('should not capture error');
      }
      nock.cleanAll();
    });
  });
});
