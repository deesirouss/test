const pool = require('../config/database');

class UserService {
  constructor() {
    console.log('🐘 UserService initialized with PostgreSQL storage');
  }

  async getAllUsers() {
    console.log('📋 Service: Retrieving all users from database');
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    console.log(`📊 Service: Retrieved ${result.rows.length} users from database`);
    return result.rows;
  }

  async getUserById(id) {
    const parsedId = parseInt(id);
    console.log(`🔍 Service: Looking for user with ID: ${parsedId}`);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [parsedId]);
    const user = result.rows[0];
    if (user) {
      console.log(`✅ Service: User found - ${user.name}`);
    } else {
      console.log(`⚠️ Service: No user found with ID: ${parsedId}`);
    }
    return user;
  }

  async createUser(userData) {
    console.log(`👤 Service: Creating user - Name: ${userData.name}, Email: ${userData.email}`);
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [userData.name, userData.email]
    );
    const newUser = result.rows[0];
    console.log(`✅ Service: User created - ID: ${newUser.id}, Name: ${newUser.name}`);
    return newUser;
  }

  async updateUser(id, userData) {
    const parsedId = parseInt(id);
    console.log(`✏️ Service: Updating user with ID: ${parsedId}`);
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [userData.name, userData.email, parsedId]
    );
    
    const updatedUser = result.rows[0];
    if (updatedUser) {
      console.log(`✅ Service: User updated - ${updatedUser.name} (${updatedUser.email})`);
    } else {
      console.log(`⚠️ Service: Update failed - User not found with ID: ${parsedId}`);
    }
    return updatedUser;
  }

  async deleteUser(id) {
    const parsedId = parseInt(id);
    console.log(`🗑️ Service: Deleting user with ID: ${parsedId}`);
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [parsedId]);
    const deletedUser = result.rows[0];
    
    if (deletedUser) {
      console.log(`✅ Service: User deleted - ${deletedUser.name} (${deletedUser.email})`);
      return true;
    } else {
      console.log(`⚠️ Service: Delete failed - User not found with ID: ${parsedId}`);
      return false;
    }
  }
}

module.exports = new UserService();