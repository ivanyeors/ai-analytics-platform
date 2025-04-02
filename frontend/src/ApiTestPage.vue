<template>
  <div class="api-test-page">
    <h1>API Connection Testing</h1>
    <p>This page is used to test connections to the backend API.</p>
    <ApiTest />
  </div>
</template>

<script setup>
import ApiTest from './components/ApiTest.vue';
</script>

<style scoped>
.api-test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
</style> 