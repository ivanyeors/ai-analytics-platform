<template>
  <div id="app">
    <header>
      <h1>AI Analytics Assistant</h1>
    </header>
    <main>
      <AIChat />
    </main>
  </div>
</template>

<script>
import AIChat from './components/AIChat.vue';

export default {
  name: 'App',
  components: {
    AIChat
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'DM Sans', sans-serif;
  background-color: #f8f9fa;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #007bff;
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  font-size: 1.8rem;
}

main {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style> 