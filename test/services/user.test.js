const { create } = require('../../services/user');

beforeAll(() => {
  const strapi = {
    query: jest.fn(),
    store: jest.fn(),
  };

  global.strapi = strapi;
});

beforeEach(() => {
  global.strapi.query.mockReset();
  global.strapi.store.mockReset();
});

describe('test service user', () => {
  describe('create', () => {
    test('should create strapi user and assign default role of strapi', async () => {
      const userId = 'userId';
      const userName = 'userName';
      const defaultRole = { id: '1' };
      const mockFindOne = jest.fn();
      const mockCreate = jest.fn();

      global.strapi.query.mockReturnValue({
        findOne: mockFindOne,
        create: mockCreate,
      });
      global.strapi.store.mockReturnValue({
        get: jest.fn().mockReturnValue({ default_role: defaultRole }),
      });
      mockFindOne.mockReturnValue(defaultRole);
      mockCreate.mockReturnValue('return user');

      const newUser = await create(userId, userName);

      expect(newUser).toEqual('return user');
      expect(global.strapi.query).toBeCalledWith('role', 'users-permissions');
      expect(global.strapi.query).toBeCalledWith('user', 'users-permissions');
      expect(global.strapi.query).toBeCalledTimes(2);
      expect(mockFindOne).toBeCalledWith({ type: defaultRole }, []);
      expect(mockCreate).toBeCalledWith({
        id: userId,
        username: userName,
        email: 'email@email.email',
        provider: 'kong',
        role: defaultRole.id,
        confirmed: true,
      });
    });
  });
});
