const express = require('express');
const pool = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Test database connection with lightweight query
    const dbResult = await pool.query('SELECT 1 as test');
    
    console.log('💚 Health check: Database connection successful');
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true
      },
      message: 'Backend is healthy and database is connected'
    });
  } catch (error) {
    console.error('❌ Health check: Database connection failed:', error.message);
    
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        error: error.message
      },
      message: 'Backend is running but database connection failed'
    });
  }
});

module.exports = router;