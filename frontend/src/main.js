import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Create the app instance
const app = createApp(App)

// Use the router and Pinia store
app.use(router)
app.use(createPinia())

// Mount the app
app.mount('#app') 