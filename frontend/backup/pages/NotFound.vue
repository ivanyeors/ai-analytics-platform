<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="back-home">
        <span class="material-icons">arrow_back</span>
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f5f5f5;
}

.not-found-content {
  max-width: 500px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 80px;
  margin: 0;
  line-height: 1;
  color: #2196f3;
}

h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 24px;
}

.back-home {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-home:hover {
  background-color: #1976d2;
}

.material-icons {
  margin-right: 8px;
}
</style> 