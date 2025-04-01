<template>
  <div class="api-test">
    <h2>API Connection Test</h2>
    
    <div class="test-section">
      <h3>Axios Test</h3>
      <button @click="testAxios">Test Axios API</button>
      <div v-if="axiosResult" class="result success">
        <p>Success: {{ axiosResult }}</p>
      </div>
      <div v-if="axiosError" class="result error">
        <p>Error: {{ axiosError }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h3>Fetch Test</h3>
      <button @click="testFetch">Test Fetch API</button>
      <div v-if="fetchResult" class="result success">
        <p>Success: {{ fetchResult }}</p>
      </div>
      <div v-if="fetchError" class="result error">
        <p>Error: {{ fetchError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const axiosResult = ref('');
const axiosError = ref('');
const fetchResult = ref('');
const fetchError = ref('');

const testAxios = async () => {
  try {
    // Clear previous results
    axiosResult.value = '';
    axiosError.value = '';
    
    // Test with regular axios call
    console.log('Testing axios API call...');
    console.log('Current axios baseURL:', axios.defaults.baseURL);
    
    // Use correct path with baseURL already set to /api
    const response = await axios.post('/ai/chat', {
      message: 'Test message',
      sessionId: 'test-session'
    });
    
    axiosResult.value = JSON.stringify(response.data);
    console.log('Axios test successful:', response.data);
  } catch (error) {
    axiosError.value = error.message;
    console.error('Axios test error:', error);
    
    // Log more detailed error info
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  }
};

const testFetch = async () => {
  try {
    // Clear previous results
    fetchResult.value = '';
    fetchError.value = '';
    
    // Test with fetch API
    console.log('Testing fetch API call...');
    
    // Use absolute URL to test direct connection
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Test message',
        sessionId: 'test-session'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    fetchResult.value = JSON.stringify(data);
    console.log('Fetch test successful:', data);
  } catch (error) {
    fetchError.value = error.message;
    console.error('Fetch test error:', error);
  }
};
</script>

<style scoped>
.api-test {
  margin: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f7f7f7;
}

.test-section {
  margin-bottom: 20px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

button:hover {
  background-color: #45a049;
}

.result {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.success {
  background-color: #e7f3e8;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
</style> 