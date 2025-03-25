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
axios.defaults.baseURL = 'http://localhost:3001/api'

app.mount('#app') 