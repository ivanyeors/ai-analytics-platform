const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const aiRoutes = require('./routes/ai');
const chartRoutes = require('./routes/chart');
const dataRoutes = require('./routes/data');
const spacetimeRoutes = require('./routes/spacetime');

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/spacetime', spacetimeRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Try alternative port if needed (for development environment)
  if (process.env.NODE_ENV === 'development') {
    const altPort = PORT + 10;
    const altApp = express();
    altApp.use(cors());
    altApp.use(express.json());
    
    // Copy routes
    altApp.use('/api/ai', aiRoutes);
    altApp.use('/api/chart', chartRoutes);
    altApp.use('/api/data', dataRoutes);
    altApp.use('/api/spacetime', spacetimeRoutes);
    
    altApp.listen(altPort, () => {
      console.log(`Backup server running on port ${altPort}`);
    });
  }
}); 