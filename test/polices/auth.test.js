const authPolice = require('../../config/policies/auth');

beforeAll(() => {
  global.strapi = {
    log: { debug: jest.fn() },
    plugins: {
      'kong-oauth2': {
        services: {
          'kong-admin': { validateToken: jest.fn() },
          jwt: { issue: jest.fn() },
        },
      },
    },
  };
});

describe('test pollice auth', () => {
  const mockNext = jest.fn();
  const ctx = {
    request: { header: { authorization: 'Bearer iamtoken' } },
    headers: {
      'x-consumer-username': 'username',
      'x-consumer-id': 'id',
    },
  };

  beforeEach(() => {
    const pluginServices = global.strapi.plugins['kong-oauth2'].services;

    global.strapi.log.debug.mockRestore();
    pluginServices['kong-admin'].validateToken.mockRestore();
    pluginServices.jwt.issue.mockRestore();

    ctx.request.header = { authorization: 'Bearer iamtoken' };

    ctx.headers = {
      'x-consumer-username': 'username',
      'x-consumer-id': 'id',
    };

    process.env.KONG_ADMIN_HOST = 'host';
    process.env.KONG_ADMIN_PORT = 'port';
    mockNext.mockRestore();
  });

  test('should check authorization header and kong custom header', async () => {
    ctx.request.header.authorization = null;

    await authPolice(ctx, mockNext);
    expect(mockNext).toBeCalled();
    expect(global.strapi.log.debug).not.toBeCalled();
  });

  test('should check kong admin configuration', async () => {
    delete process.env.KONG_ADMIN_HOST;

    await authPolice(ctx, mockNext);
    expect(mockNext).toBeCalled();
    expect(global.strapi.log.debug).toBeCalled();
  });

  test('should check authorization header type', async () => {
    ctx.request.header = { authorization: 'notBeareriamtoken' };

    try {
      await authPolice(ctx, mockNext);
      throw new Error('should not be here');
    } catch (error) {
      expect(mockNext).not.toBeCalled();
    }
  });

  test('should capture validate error from kong-admin', async () => {
    const { services } = global.strapi.plugins['kong-oauth2'];
    const errMsg = 'errmsg';

    services['kong-admin'].validateToken.mockRejectedValue({ message: errMsg });
    await authPolice(ctx, mockNext);
    expect(global.strapi.log.debug).toBeCalledWith(`kong-oauth2: ${errMsg}`);
    expect(mockNext).toBeCalled();
  });

  test('should pass new jwt token to authorization header', async () => {
    const { services } = global.strapi.plugins['kong-oauth2'];
    const jwtToken = 'new jwt token';

    services.jwt.issue.mockReturnValue(jwtToken);

    await authPolice(ctx, mockNext);

    expect(ctx.request.header.authorization).toEqual(`Bearer ${jwtToken}`);
    expect(services.jwt.issue).toBeCalled();
    expect(services['kong-admin'].validateToken).toBeCalled();
    expect(mockNext).toBeCalled();
  });
});
