module.exports = {
  // SpacetimeDB configuration
  spacetimedb: {
    host: 'localhost',
    port: 3000,
    moduleName: 'analytics-module'
  },
  
  // API configuration
  api: {
    port: 3001,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // Dashboard configuration
  dashboard: {
    title: 'Analytics Dashboard',
    defaultChartType: 'line',
    refreshInterval: 5000, // milliseconds
    defaultCategories: [
      { name: 'Revenue', color: '#1f77b4', description: 'Revenue metrics' },
      { name: 'Users', color: '#ff7f0e', description: 'User metrics' },
      { name: 'Engagement', color: '#2ca02c', description: 'Engagement metrics' },
      { name: 'Conversion', color: '#d62728', description: 'Conversion metrics' }
    ]
  }
}; 