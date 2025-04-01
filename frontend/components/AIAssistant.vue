<template>
  <div class="ai-assistant-container" v-if="visible">
    <div class="ai-assistant-header">
      <h3>AI Assistant</h3>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    
    <div v-if="isThinking" class="ai-thinking">
      <div class="thinking-animation">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>Thinking...</p>
    </div>

    <div v-else class="ai-suggestion">
      <p>{{ suggestion }}</p>
      <div class="ai-buttons">
        <button 
          v-for="(action, index) in actions" 
          :key="index" 
          class="action-button"
          @click="$emit('action-click', action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIAssistant',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    suggestion: {
      type: String,
      default: 'How can I help you with your data analysis today?'
    },
    isThinking: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Array,
      default: () => [
        { label: 'Create Chart', type: 'chart' },
        { label: 'Analyze Data', type: 'analyze' }
      ]
    }
  }
}
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  font-family: 'DM Sans', sans-serif;
}

.ai-assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.ai-assistant-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 22px;
  color: #666;
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.ai-suggestion {
  padding: 16px;
}

.ai-thinking {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.thinking-animation {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.thinking-animation span {
  width: 10px;
  height: 10px;
  background-color: #2CE4CF;
  border-radius: 50%;
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-animation span:nth-child(1) {
  animation-delay: 0s;
}

.thinking-animation span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-animation span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.6; }
  40% { transform: scale(1.0); opacity: 1; }
}

.ai-thinking p {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
}

.ai-suggestion p {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.ai-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 14px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.action-button:hover {
  background-color: #2CE4CF;
  color: white;
}
</style> 