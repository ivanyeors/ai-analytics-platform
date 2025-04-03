const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:mysecretpassword@localhost:5432/singapore_demographics'
});

// Error handler for database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
router.get('/test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      time: result.rows[0].time
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Get Singapore demographics data
router.get('/demographics', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM singapore_demographics 
      ORDER BY ethnic_group, highest_qualification
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching demographics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demographics data',
      error: error.message
    });
  }
});

// Get aggregated data by ethnic group
router.get('/demographics/by-ethnicity', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT ethnic_group, SUM(total) as total
      FROM singapore_demographics
      GROUP BY ethnic_group
      ORDER BY total DESC
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching ethnicity data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ethnicity data',
      error: error.message
    });
  }
});

// Get aggregated data by education level
router.get('/demographics/by-education', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT highest_qualification, SUM(total) as total
      FROM singapore_demographics
      GROUP BY highest_qualification
      ORDER BY total DESC
    `);
    client.release();
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching education data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education data',
      error: error.message
    });
  }
});

module.exports = router; 