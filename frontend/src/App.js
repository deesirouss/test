import React, { useState, useEffect } from 'react';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import { userService } from './services/userService';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    console.log('🚀 App: Initializing user management application');
    loadUsers();
  }, []);

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const loadUsers = async () => {
    try {
      console.log('🔄 App: Loading users...');
      setLoading(true);
      const userData = await userService.getUsers();
      setUsers(userData);
      setError(null);
      console.log(`✅ App: Successfully loaded ${userData.length} users`);
    } catch (err) {
      console.error('❌ App: Failed to load users:', err.message);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = async (userData) => {
    try {
      console.log(`👤 App: Creating user - ${userData.name}`);
      const newUser = await userService.createUser(userData);
      setSuccess(`User "${newUser.name}" created successfully!`);
      console.log(`✅ App: User creation successful - ${newUser.name}`);
      await loadUsers();
      clearMessages();
    } catch (err) {
      console.error('❌ App: User creation failed:', err.message);
      setError(err.message || 'Failed to create user');
      clearMessages();
    }
  };

  const handleUserDeleted = async (userId) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      console.log(`🗑️ App: Deleting user - ID: ${userId}`);
      await userService.deleteUser(userId);
      setSuccess(`User "${userToDelete?.name || userId}" deleted successfully!`);
      console.log(`✅ App: User deletion successful - ID: ${userId}`);
      await loadUsers();
      clearMessages();
    } catch (err) {
      console.error(`❌ App: User deletion failed - ID: ${userId}:`, err.message);
      setError(err.message || 'Failed to delete user');
      clearMessages();
    }
  };

  if (loading) {
    console.log('⏳ App: Loading state active');
    return <div>Loading users...</div>;
  }

  return (
    <div className="container">
      <h1>CICD Workshop - User Management</h1>
      
      {error && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#dc3545', 
          padding: '10px', 
          borderRadius: '4px', 
          margin: '10px 0' 
        }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#28a745', 
          padding: '10px', 
          borderRadius: '4px', 
          margin: '10px 0' 
        }}>
          ✅ {success}
        </div>
      )}
      
      <UserForm onUserCreated={handleUserCreated} />
      <UserList users={users} onUserDeleted={handleUserDeleted} />
    </div>
  );
}

export default App;