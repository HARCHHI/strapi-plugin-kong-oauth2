const { issue } = require('../../services/jwt');

beforeAll(() => {
  const strapi = {
    query: jest.fn(),
  };

  global.strapi = strapi;
});

beforeEach(() => {
  global.strapi.query.mockReset();

  global.strapi.plugins = {
    'users-permissions': {
      services: { jwt: { issue: jest.fn() } },
    },
    'kong-oauth2': {
      services: { user: { create: jest.fn() } },
    },
  };
});

describe('test service jwt', () => {
  describe('issue', () => {
    const userId = 'userId';
    const userName = 'userName';

    test('should issue jwt token when user exists', async () => {
      const token = 'token';
      const mockFindOne = jest.fn();
      const user = { id: 'id' };
      const mockIssue = global.strapi
        .plugins['users-permissions']
        .services.jwt.issue;
      const mockCreate = global.strapi
        .plugins['kong-oauth2']
        .services.user.create;
      global.strapi.query.mockReturnValue({
        findOne: mockFindOne.mockReturnValue(user),
      });
      mockIssue.mockReturnValue(token);

      const result = await issue(userId, userName);

      expect(result).toEqual(token);
      expect(mockFindOne).toBeCalledWith({ username: userName });
      expect(mockCreate).not.toBeCalled();
      expect(mockIssue).toBeCalledWith({ id: user.id });
    });

    test('should issue jwt token and create new user', async () => {
      const token = 'token';
      const mockFindOne = jest.fn();
      const user = { id: 'id' };

      const mockIssue = global.strapi
        .plugins['users-permissions']
        .services.jwt.issue;
      const mockCreate = global.strapi
        .plugins['kong-oauth2']
        .services.user.create;

      global.strapi.query.mockReturnValue({
        findOne: mockFindOne.mockReturnValue(null),
      });
      mockIssue.mockReturnValue(token);
      mockCreate.mockReturnValue(user);

      const result = await issue(userId, userName);

      expect(result).toEqual(token);
      expect(mockFindOne).toBeCalledWith({ username: userName });
      expect(mockIssue).toBeCalledWith({ id: user.id });
      expect(mockCreate).toBeCalledWith(userId, userName);
    });
  });
});
