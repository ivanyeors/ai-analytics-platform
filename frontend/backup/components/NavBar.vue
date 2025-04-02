<template>
  <div class="navbar">
    <div class="logo">AI Analytics</div>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
      <router-link to="/api-test" class="nav-link">API Test</router-link>
    </div>
  </div>
</template>

<script setup>
// No setup needed for a basic navbar
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
}

.nav-link {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover, .router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style> 