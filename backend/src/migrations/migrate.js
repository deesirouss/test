const pool = require('../config/database');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const insertInitialData = `
  INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com')
  ON CONFLICT (email) DO NOTHING;
`;

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    await pool.query(createUsersTable);
    console.log('✅ Users table created/verified');
    
    await pool.query(insertInitialData);
    console.log('✅ Initial data inserted');
    
    console.log('🎉 Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

module.exports = runMigrations;