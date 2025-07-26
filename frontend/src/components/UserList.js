import React from 'react';

const UserList = ({ users, onUserDeleted }) => {
  const handleDelete = (user) => {
    console.log(`🗑️ UserList: Delete button clicked for user - ID: ${user.id}, Name: ${user.name}`);
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      console.log(`✅ UserList: Delete confirmed for user - ${user.name}`);
      onUserDeleted(user.id);
    } else {
      console.log(`❌ UserList: Delete cancelled for user - ${user.name}`);
    }
  };

  console.log(`📋 UserList: Rendering ${users.length} users`);
  
  return (
    <div>
      <h2>Users ({users.length})</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        users.map(user => (
          <div key={user.id} className="user-card" data-testid={`user-${user.id}`}>
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>ID: {user.id}</p>
            <button 
              className="delete"
              onClick={() => handleDelete(user)}
              data-testid={`delete-user-${user.id}`}
              style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;