const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { SpacetimeDBClient } = require('spacetimedb-sdk');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create SpacetimeDB client
const spacetimeClient = new SpacetimeDBClient('localhost:3000', {
  moduleName: 'analytics-module'
});

// Connect to SpacetimeDB
let connected = false;

async function connectToSpacetimeDB() {
  try {
    await spacetimeClient.connect();
    console.log('Connected to SpacetimeDB');
    
    // Subscribe to data changes
    spacetimeClient.subscribe('DataPoint');
    spacetimeClient.subscribe('Category');
    
    connected = true;
  } catch (error) {
    console.error('Failed to connect to SpacetimeDB:', error);
    // Retry connection after a delay
    setTimeout(connectToSpacetimeDB, 5000);
  }
}

connectToSpacetimeDB();

// API Routes

// Get all data points
app.get('/api/data-points', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const dataPoints = spacetimeClient.getSubscribedRows('DataPoint');
    res.json(dataPoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const categories = spacetimeClient.getSubscribedRows('Category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new data point
app.post('/api/data-points', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const { category, value } = req.body;
    
    if (!category || value === undefined) {
      return res.status(400).json({ error: 'Category and value are required' });
    }
    
    const id = await spacetimeClient.call('add_data_point', [category, value]);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a data point
app.put('/api/data-points/:id', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const id = parseInt(req.params.id);
    const { category, value } = req.body;
    
    const success = await spacetimeClient.call('update_data_point', [id, category, value]);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Data point not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a data point
app.delete('/api/data-points/:id', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const id = parseInt(req.params.id);
    
    const success = await spacetimeClient.call('delete_data_point', [id]);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Data point not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update a category
app.post('/api/categories', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    await spacetimeClient.call('add_category', [
      name, 
      description || `Category ${name}`,
      color || '#1f77b4'
    ]);
    
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category
app.delete('/api/categories/:name', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const name = req.params.name;
    const { reassignTo } = req.query;
    
    const success = await spacetimeClient.call('delete_category', [name, reassignTo]);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate sample data
app.post('/api/generate-sample-data', async (req, res) => {
  if (!connected) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  
  try {
    const { numPoints } = req.body;
    
    await spacetimeClient.call('generate_sample_data', [numPoints || 50]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API bridge listening on port ${port}`);
}); 