import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AnalyticsDashboard from '../pages/AnalyticsDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'AI Chat Interface'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: AnalyticsDashboard,
    meta: {
      title: 'Analytics Dashboard'
    }
  },
  // Additional routes can be added here
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title based on route metadata
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | AI Analytics Platform` : 'AI Analytics Platform'
  next()
})

export default router 