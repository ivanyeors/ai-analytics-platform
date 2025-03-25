import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Data points API
export const dataPointsAPI = {
  getAll: () => api.get('/data-points'),
  add: (category, value) => api.post('/data-points', { category, value }),
  update: (id, data) => api.put(`/data-points/${id}`, data),
  delete: (id) => api.delete(`/data-points/${id}`),
  generateSample: (numPoints = 50) => api.post('/generate-sample-data', { numPoints })
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  add: (name, description, color) => api.post('/categories', { name, description, color }),
  delete: (name, reassignTo) => api.delete(`/categories/${name}`, { 
    params: { reassignTo } 
  })
};

export default {
  dataPoints: dataPointsAPI,
  categories: categoriesAPI
}; 