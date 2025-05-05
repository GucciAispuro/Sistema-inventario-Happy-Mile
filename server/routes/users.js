
const express = require('express');
const router = express.Router();

// Check if users table exists route
router.post('/check-users-table', async (req, res) => {
  try {
    const db = req.db;
    
    // Check if the users table exists by querying it
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );`
    );
    
    const tableExists = result.rows[0].exists;
    
    if (tableExists) {
      return res.status(200).json({ 
        success: true, 
        message: 'Users table exists and is accessible' 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'Users table does not exist' 
      });
    }
  } catch (error) {
    console.error('Error checking users table:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while checking the users table',
    });
  }
});

// Create users table route (if needed)
router.post('/create-users-table', async (req, res) => {
  try {
    const db = req.db;
    
    // First check if table exists
    const checkResult = await db.query(
      `SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );`
    );
    
    if (checkResult.rows[0].exists) {
      return res.status(200).json({ 
        success: true, 
        message: 'Users table already exists' 
      });
    }
    
    // Create users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'viewer',
        location TEXT NOT NULL,
        receive_alerts BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Users table created successfully' 
    });
  } catch (error) {
    console.error('Error creating users table:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while creating the users table',
    });
  }
});

module.exports = router;
