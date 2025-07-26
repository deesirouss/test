const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all users');
    const users = await userService.getAllUsers();
    console.log(`✅ Retrieved ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`🔍 Fetching user with ID: ${userId}`);
    const user = await userService.getUserById(userId);
    if (!user) {
      console.log(`⚠️ User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`✅ User found: ${user.name} (${user.email})`);
    res.json(user);
  } catch (error) {
    console.error(`❌ Error fetching user ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log(`👤 Creating new user: ${name} (${email})`);
    
    if (!name || !email) {
      console.log('⚠️ User creation failed: Missing name or email');
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const newUser = await userService.createUser({ name, email });
    console.log(`✅ User created successfully: ID ${newUser.id}, Name: ${newUser.name}`);
    res.status(201).json({ ...newUser, message: 'User created successfully' });
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`✏️ Updating user with ID: ${userId}`);
    const updatedUser = await userService.updateUser(userId, req.body);
    if (!updatedUser) {
      console.log(`⚠️ Update failed: User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`✅ User updated successfully: ${updatedUser.name} (${updatedUser.email})`);
    res.json({ ...updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error(`❌ Error updating user ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`🗑️ Deleting user with ID: ${userId}`);
    const deleted = await userService.deleteUser(userId);
    if (!deleted) {
      console.log(`⚠️ Delete failed: User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`✅ User deleted successfully: ID ${userId}`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting user ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;