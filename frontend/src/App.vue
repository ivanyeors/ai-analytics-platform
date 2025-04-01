<template>
  <div class="app-container">
    <!-- Remove default header, since the HomePage component has its own header -->
    <main class="app-content no-padding">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

:root {
  /* Keep original palette but add EVYD theme colors */
  --primary-color: #2196f3;
  --primary-dark: #1976d2;
  --primary-light: #bbdefb;
  --accent-color: #ff4081;
  --text-color: #333333;
  --text-light: #757575;
  --bg-color: #FFFFFF;
  --card-color: #ffffff;
  --border-color: #e0e0e0;
  --error-color: #f44336;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --info-color: #2196f3;
  
  /* EVYD specific colors */
  --evyd-gradient-start: #2CE4CF;
  --evyd-gradient-end: #0076B4;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'DM Sans', sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
  font-size: 16px;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-content {
  flex: 1 0 auto;
  width: 100%;
}

.app-content.no-padding {
  padding: 0;
}

h1 {
  font-size: 32px;
  font-weight: 400;
  color: #232323;
  letter-spacing: -0.02em;
  line-height: 1.2em;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

button, select, input {
  font-family: inherit;
  font-size: inherit;
}

/* For tooltips and other global elements */
.tooltip {
  position: absolute;
  background-color: rgba(33, 33, 33, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  max-width: 300px;
  white-space: normal;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style> 