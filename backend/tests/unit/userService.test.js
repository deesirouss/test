const userService = require('../../src/services/userService');
const pool = require('../../src/config/database');

// Mock the database pool
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

describe('UserService Unit Tests', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      pool.query.mockResolvedValue({ rows: mockUsers });
      
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('name', 'John Doe');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY id');
    });
  });

  describe('getUserById', () => {
    test('should return user by id', async () => {
      pool.query.mockResolvedValue({ rows: [mockUsers[0]] });
      
      const user = await userService.getUserById(1);
      expect(user).toHaveProperty('name', 'John Doe');
      expect(user).toHaveProperty('email', 'john@example.com');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    test('should return undefined for non-existent user', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const user = await userService.getUserById(999);
      expect(user).toBeUndefined();
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [999]);
    });
  });

  describe('createUser', () => {
    test('should create new user', async () => {
      const userData = { name: 'Bob Wilson', email: 'bob@example.com' };
      const newUser = { id: 3, name: 'Bob Wilson', email: 'bob@example.com' };
      pool.query.mockResolvedValue({ rows: [newUser] });
      
      const result = await userService.createUser(userData);
      
      expect(result).toHaveProperty('id', 3);
      expect(result).toHaveProperty('name', 'Bob Wilson');
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        ['Bob Wilson', 'bob@example.com']
      );
    });
  });

  describe('updateUser', () => {
    test('should update existing user', async () => {
      const updatedUser = { id: 1, name: 'John Updated', email: 'john@example.com' };
      pool.query.mockResolvedValue({ rows: [updatedUser] });
      
      const result = await userService.updateUser(1, { name: 'John Updated', email: 'john@example.com' });
      expect(result).toHaveProperty('name', 'John Updated');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['John Updated', 'john@example.com', 1]
      );
    });

    test('should return undefined for non-existent user', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await userService.updateUser(999, { name: 'Test', email: 'test@example.com' });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteUser', () => {
    test('should delete existing user', async () => {
      pool.query.mockResolvedValue({ rows: [mockUsers[0]] });
      
      const result = await userService.deleteUser(1);
      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1 RETURNING *', [1]);
    });

    test('should return false for non-existent user', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await userService.deleteUser(999);
      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1 RETURNING *', [999]);
    });
  });
});