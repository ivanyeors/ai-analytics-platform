const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Display debug information
console.log('Starting API server...');
console.log('Current directory:', __dirname);
console.log('Node version:', process.version);

// Load environment variables from the backend root directory
const envPath = path.join(__dirname, '..', '.env');
console.log('Loading environment from:', envPath);
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error);
} else {
  console.log('.env file loaded successfully');
}

// Import routes
console.log('Importing routes...');
try {
  const aiRoutes = require('../routes/ai');
  console.log('Routes imported successfully');

  // Create Express app
  const app = express();
  const port = 3001; // Always use port 3001, no fallback

  console.log('Configured port:', port);

  // CORS configuration
  const corsOptions = {
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(bodyParser.json());

  // Log all requests
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
    next();
  });

  // Register routes
  app.use('/api/ai', aiRoutes);

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Root endpoint for easy testing
  app.get('/', (req, res) => {
    res.json({ 
      message: 'AI Analytics API server is running',
      endpoints: {
        health: '/health',
        chat: '/api/ai/chat',
        stream: '/api/ai/chat/stream'
      }
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });

  // Function to start the server on port 3001
  const startServer = () => {
    console.log(`Starting server on port ${port}...`);
    
    // Explicitly binding to 0.0.0.0 to listen on all available network interfaces
    const server = app.listen(port, '0.0.0.0')
      .on('listening', () => {
        console.log(`API server listening on all interfaces (0.0.0.0) on port ${port}`);
        console.log(`API routes available at: http://localhost:${port}/api/ai/chat`);
      })
      .on('error', (err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
      });
  };

  // Start the server
  startServer();
} catch (error) {
  console.error('Fatal error during server initialization:', error);
  process.exit(1);
} 