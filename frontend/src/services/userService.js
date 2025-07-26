import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UserService {
  constructor() {
    console.log('🌐 UserService initialized with API URL:', API_BASE_URL);
  }

  async getUsers() {
    try {
      console.log('📋 Frontend: Fetching all users from API');
      const response = await axios.get(`${API_BASE_URL}/users`);
      console.log(`✅ Frontend: Successfully fetched ${response.data.length} users`);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error fetching users:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  }

  async getUserById(id) {
    try {
      console.log(`🔍 Frontend: Fetching user with ID: ${id}`);
      const response = await axios.get(`${API_BASE_URL}/users/${id}`);
      console.log(`✅ Frontend: Successfully fetched user: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Frontend: Error fetching user ${id}:`, error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
  }

  async createUser(userData) {
    try {
      console.log(`👤 Frontend: Creating user - ${userData.name} (${userData.email})`);
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      console.log(`✅ Frontend: User created successfully - ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error creating user:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  }

  async updateUser(id, userData) {
    try {
      console.log(`✏️ Frontend: Updating user with ID: ${id}`);
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
      console.log(`✅ Frontend: User updated successfully: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Frontend: Error updating user ${id}:`, error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  }

  async deleteUser(id) {
    try {
      console.log(`🗑️ Frontend: Deleting user with ID: ${id}`);
      const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
      console.log(`✅ Frontend: User deleted successfully - ID: ${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Frontend: Error deleting user ${id}:`, error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete user');
    }
  }

  async getHealth() {
    try {
      console.log('💚 Frontend: Checking API health');
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Frontend: API health check successful');
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: API health check failed:', error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || 'API health check failed');
    }
  }
}

export const userService = new UserService();