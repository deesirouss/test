import React, { useState } from 'react';

const UserForm = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 UserForm: Form submission attempted');
    
    if (formData.name && formData.email) {
      console.log(`✅ UserForm: Valid form data - Name: ${formData.name}, Email: ${formData.email}`);
      onUserCreated(formData);
      setFormData({ name: '', email: '' });
      console.log('📝 UserForm: Form cleared after submission');
    } else {
      console.log('⚠️ UserForm: Form validation failed - missing name or email');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    console.log(`✏️ UserForm: Field updated - ${e.target.name}: ${e.target.value}`);
  };

  return (
    <div>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit} data-testid="user-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            data-testid="name-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            data-testid="email-input"
            required
          />
        </div>
        <button type="submit" data-testid="submit-button">
          Add User
        </button>
      </form>
    </div>
  );
};

export default UserForm;