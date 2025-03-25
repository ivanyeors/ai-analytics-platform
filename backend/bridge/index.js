const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Sample data storage (in a real app, this would connect to SpacetimeDB)
let dataPoints = [];
let categories = [
  { id: '1', name: 'Performance', color: '#4285F4' },
  { id: '2', name: 'Revenue', color: '#34A853' },
  { id: '3', name: 'Users', color: '#FBBC05' },
  { id: '4', name: 'Errors', color: '#EA4335' }
];

// Generate some initial sample data
function generateSampleData(count = 20) {
  const newDataPoints = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const timestamp = new Date(now - Math.random() * 30 * oneDay);
    
    newDataPoints.push({
      id: uuidv4(),
      timestamp: timestamp.toISOString(),
      category: categories[categoryIndex].name,
      value: Math.random() * 100
    });
  }
  
  return newDataPoints;
}

// Initialize with sample data
dataPoints = generateSampleData();

// API Routes
// Get all data points
app.get('/api/datapoints', (req, res) => {
  res.json(dataPoints);
});

// Get a specific data point
app.get('/api/datapoints/:id', (req, res) => {
  const dataPoint = dataPoints.find(dp => dp.id === req.params.id);
  if (!dataPoint) {
    return res.status(404).json({ error: 'Data point not found' });
  }
  res.json(dataPoint);
});

// Add a new data point
app.post('/api/datapoints', (req, res) => {
  const { category, value } = req.body;
  
  if (!category || value === undefined) {
    return res.status(400).json({ error: 'Category and value are required' });
  }
  
  const newDataPoint = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    category,
    value: Number(value)
  };
  
  dataPoints.push(newDataPoint);
  res.status(201).json(newDataPoint);
});

// Update a data point
app.put('/api/datapoints/:id', (req, res) => {
  const { category, value } = req.body;
  const index = dataPoints.findIndex(dp => dp.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Data point not found' });
  }
  
  dataPoints[index] = {
    ...dataPoints[index],
    ...(category && { category }),
    ...(value !== undefined && { value: Number(value) })
  };
  
  res.json(dataPoints[index]);
});

// Delete a data point
app.delete('/api/datapoints/:id', (req, res) => {
  const index = dataPoints.findIndex(dp => dp.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Data point not found' });
  }
  
  const deletedDataPoint = dataPoints[index];
  dataPoints.splice(index, 1);
  
  res.json(deletedDataPoint);
});

// Generate sample data
app.post('/api/datapoints/generate', (req, res) => {
  const count = req.body.count || 20;
  const newDataPoints = generateSampleData(count);
  dataPoints = [...dataPoints, ...newDataPoints];
  res.json(newDataPoints);
});

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Get a specific category
app.get('/api/categories/:id', (req, res) => {
  const category = categories.find(c => c.id === req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// Add a new category
app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;
  
  if (!name || !color) {
    return res.status(400).json({ error: 'Name and color are required' });
  }
  
  const newCategory = {
    id: uuidv4(),
    name,
    color
  };
  
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Update a category
app.put('/api/categories/:id', (req, res) => {
  const { name, color } = req.body;
  const index = categories.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  categories[index] = {
    ...categories[index],
    ...(name && { name }),
    ...(color && { color })
  };
  
  res.json(categories[index]);
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
  const index = categories.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const deletedCategory = categories[index];
  categories.splice(index, 1);
  
  // Remove data points with this category
  dataPoints = dataPoints.filter(dp => dp.category !== deletedCategory.name);
  
  res.json(deletedCategory);
});

// Start the server
app.listen(port, () => {
  console.log(`API bridge server running on port ${port}`);
}); 