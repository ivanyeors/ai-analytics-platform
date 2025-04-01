import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import './assets/main.css'

// Initialize Pinia
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Register plugins
app.use(pinia)
app.use(router)

// Configure axios
axios.defaults.baseURL = '/api'

// Add axios interceptors for debugging
axios.interceptors.request.use(config => {
  console.log('Axios Request:', config);
  return config;
}, error => {
  console.error('Axios Request Error:', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('Axios Response:', response);
  return response;
}, error => {
  console.error('Axios Response Error:', error);
  return Promise.reject(error);
});

app.mount('#app') 