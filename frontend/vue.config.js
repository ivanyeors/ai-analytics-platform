module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
          console.log(`Proxying ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onError: (err, req, res) => {
          console.log('Proxy error:', err);
          // Try to contact API server on alternative ports if main port fails
          if (err.code === 'ECONNREFUSED') {
            console.log('Attempting to connect to alternative API server ports...');
          }
        }
      }
    }
  }
}; 