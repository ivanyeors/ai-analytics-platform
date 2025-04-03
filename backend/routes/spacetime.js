/**
 * SpaceTimeDB API Routes
 * Handles communication between the frontend and SpaceTimeDB
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/default');

// SpaceTimeDB connection configuration
const SPACETIME_HOST = process.env.SPACETIMEDB_HOST || config.spacetimedb.host;
const SPACETIME_PORT = process.env.SPACETIMEDB_PORT || config.spacetimedb.port;
const SPACETIME_MODULE = process.env.SPACETIMEDB_MODULE || config.spacetimedb.moduleName;

// SpaceTimeDB API base URL
const SPACETIME_API_URL = `http://${SPACETIME_HOST}:${SPACETIME_PORT}`;

/**
 * Check SpaceTimeDB status
 * GET /api/spacetime/status
 */
router.get('/status', async (req, res) => {
  try {
    // Check if SpaceTimeDB host is reachable (even if API endpoints return 404)
    const alive = await new Promise((resolve) => {
      const net = require('net');
      const client = net.createConnection({ host: SPACETIME_HOST, port: SPACETIME_PORT }, () => {
        client.end();
        resolve(true);
      });
      client.on('error', () => {
        resolve(false);
      });
      // Set a timeout of 2 seconds
      client.setTimeout(2000, () => {
        client.end();
        resolve(false);
      });
    });

    if (alive) {
      res.json({
        available: true,
        status: 'running',
        message: 'SpaceTimeDB service is running'
      });
    } else {
      res.json({
        available: false,
        status: 'unavailable',
        message: 'SpaceTimeDB service is not reachable'
      });
    }
  } catch (error) {
    console.error('SpaceTimeDB status check failed:', error.message);
    res.json({
      available: false,
      status: 'unavailable',
      message: `Failed to connect to SpaceTimeDB: ${error.message}`
    });
  }
});

/**
 * Connect to SpaceTimeDB
 * POST /api/spacetime/connect
 */
router.post('/connect', async (req, res) => {
  try {
    // Check if SpaceTimeDB is reachable using the same method as the status endpoint
    const alive = await new Promise((resolve) => {
      const net = require('net');
      const client = net.createConnection({ host: SPACETIME_HOST, port: SPACETIME_PORT }, () => {
        client.end();
        resolve(true);
      });
      client.on('error', () => {
        resolve(false);
      });
      // Set a timeout of 2 seconds
      client.setTimeout(2000, () => {
        client.end();
        resolve(false);
      });
    });

    if (alive) {
      res.json({
        success: true,
        message: `Connected to SpaceTimeDB on ${SPACETIME_HOST}:${SPACETIME_PORT}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'SpaceTimeDB service is not reachable'
      });
    }
  } catch (error) {
    console.error('Failed to connect to SpaceTimeDB:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to connect to SpaceTimeDB: ${error.message}`
    });
  }
});

/**
 * List all tables
 * GET /api/spacetime/tables
 */
router.get('/tables', async (req, res) => {
  try {
    // In a real implementation, you would query the SpaceTimeDB API
    // This is a simplified implementation that returns mock data
    res.json({ 
      tables: ['DataPoint', 'Category'] 
    });
  } catch (error) {
    console.error('Failed to list SpaceTimeDB tables:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to list SpaceTimeDB tables: ${error.message}`
    });
  }
});

/**
 * Get table schema
 * GET /api/spacetime/tables/:tableName/schema
 */
router.get('/tables/:tableName/schema', async (req, res) => {
  const { tableName } = req.params;
  
  try {
    // In a real implementation, you would query the SpaceTimeDB API
    // This is a simplified implementation that returns mock data
    let schema = [];
    
    if (tableName === 'DataPoint') {
      schema = [
        { name: 'id', type: 'u64' },
        { name: 'timestamp', type: 'Timestamp' },
        { name: 'category', type: 'String' },
        { name: 'value', type: 'f64' }
      ];
    } else if (tableName === 'Category') {
      schema = [
        { name: 'name', type: 'String' },
        { name: 'description', type: 'String' },
        { name: 'color', type: 'String' }
      ];
    }
    
    res.json({ schema });
  } catch (error) {
    console.error(`Failed to get schema for table ${tableName}:`, error.message);
    res.status(500).json({
      success: false,
      message: `Failed to get schema for table ${tableName}: ${error.message}`
    });
  }
});

/**
 * Query data from a table
 * POST /api/spacetime/tables/:tableName/query
 */
router.post('/tables/:tableName/query', async (req, res) => {
  const { tableName } = req.params;
  const { filters, limit, offset } = req.body;
  
  try {
    // In a real implementation, you would send a query to the SpaceTimeDB API
    // This is a simplified implementation that returns mock data
    let results = [];
    
    if (tableName === 'DataPoint') {
      results = [
        { id: 1, timestamp: new Date().toISOString(), category: 'Revenue', value: 75.42 },
        { id: 2, timestamp: new Date().toISOString(), category: 'Users', value: 85.29 },
        { id: 3, timestamp: new Date().toISOString(), category: 'Engagement', value: 62.18 }
      ];
    } else if (tableName === 'Category') {
      results = [
        { name: 'Revenue', description: 'Revenue metrics', color: '#1f77b4' },
        { name: 'Users', description: 'User metrics', color: '#ff7f0e' },
        { name: 'Engagement', description: 'Engagement metrics', color: '#2ca02c' }
      ];
    }
    
    // Apply filters if provided
    if (filters && Object.keys(filters).length > 0) {
      results = results.filter(item => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      });
    }
    
    // Apply limit if provided
    if (limit) {
      results = results.slice(0, limit);
    }
    
    // Apply offset if provided
    if (offset) {
      results = results.slice(offset);
    }
    
    res.json({ results });
  } catch (error) {
    console.error(`Failed to query table ${tableName}:`, error.message);
    res.status(500).json({
      success: false,
      message: `Failed to query table ${tableName}: ${error.message}`
    });
  }
});

/**
 * Import data from data.gov.sg
 * POST /api/spacetime/import/datagovsg
 */
router.post('/import/datagovsg', async (req, res) => {
  const { datasetId, tableName } = req.body;
  
  if (!datasetId || !tableName) {
    return res.status(400).json({
      success: false,
      message: 'Dataset ID and table name are required'
    });
  }
  
  try {
    // This would need to be implemented based on your specific import logic
    // Here's a placeholder implementation
    
    console.log(`Importing dataset ${datasetId} from data.gov.sg to table ${tableName}...`);
    
    // Simulate the import process
    // In a real implementation, this would:
    // 1. Fetch data from data.gov.sg API
    // 2. Transform the data as needed
    // 3. Create the table in SpaceTimeDB
    // 4. Insert the data into the table
    
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: `Successfully imported dataset ${datasetId} as ${tableName}`,
      recordCount: 100 // Placeholder record count
    });
  } catch (error) {
    console.error('Failed to import data from data.gov.sg:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to import data: ${error.message}`
    });
  }
});

module.exports = router; 