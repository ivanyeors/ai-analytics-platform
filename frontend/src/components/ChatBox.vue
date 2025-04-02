<template>
  <div class="chat-container" :class="{ 'chat-mode': chatMode }">
    <!-- Chat messages area - only shown after first message is sent or in chat mode -->
    <div class="chat-messages" ref="chatMessages" v-if="chatMode || messagesExist">
      <div v-for="(message, index) in displayMessages" :key="index" 
           class="chat-bubble" 
           :class="{ 
             'user-message': message.isUser, 
             'system-message': !message.isUser,
             'animate-in': true,
             'post-thinking': index === lastThinkingMessageIndex.value + 1 && !message.isUser,
             'empty-bubble': !message.text || message.text.trim() === '',
             'hidden': !message.isUser && hideInitialMessage && index === 0 && displayMessages.length === 1,
             'chart-bubble': message.chart
           }"
           :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="message-content">
          <p>{{ message.text }}</p>
          
          <!-- Chart visualization inside the chat bubble -->
          <div v-if="message.chart" class="chat-chart-container">
            <ChartVisualizer
              :chartType="message.chart.type"
              :data="message.chart.data"
              :title="message.chart.title"
              :options="message.chart.options || {}"
              :showCode="false"
              compact-mode="true"
            />
          </div>
          
          <!-- Multiple charts in a grid layout -->
          <div v-if="message.multipleCharts" class="chat-multichart-container">
            <div class="chart-grid" :class="{ 'two-columns': message.multipleCharts.layout === 'grid' }">
              <div v-for="(chart, idx) in message.multipleCharts.charts" :key="idx" 
                   class="chart-grid-item" :class="{ 'full-width': chart.fullWidth }">
                <ChartVisualizer
                  :chartType="chart.type"
                  :data="chart.data"
                  :title="chart.title"
                  :options="chart.options || {}"
                  :showCode="false"
                  compact-mode="true"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-if="showTimestamp(message, index)" class="message-time">
          {{ formatMessageTime(message.time || new Date()) }}
        </div>
      </div>
      <div v-if="isTyping" class="chat-bubble thinking-state animate-in">
        <div class="thinking-content">
          <div>Thinking</div>
        </div>
      </div>
    </div>
    
    <!-- Chat input -->
    <div class="chat-input-container">
      <div class="chat-input-wrapper">
        <input 
          type="text" 
          class="chat-input" 
          placeholder="Ask anything related to your data..."
          v-model="chatInput"
          @keyup.enter="sendMessage"
        />
        <div class="ai-dropdown-container">
          <button 
            class="ai-dropdown-toggle" 
            @click="toggleAIDropdown"
            :class="{ 'active': showAIDropdown }"
          >
            <span class="current-provider-icon">
              <svg v-if="selectedProvider === 'openai'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z"></path>
                <path d="M12 14c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
            </span>
            <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          <div class="ai-dropdown-menu" v-if="showAIDropdown">
            <div 
              class="ai-dropdown-item"
              :class="{ 'selected': selectedProvider === 'openai' }"
              @click="changeProvider('openai')"
            >
              <span class="provider-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z"></path>
                  <path d="M12 14c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"></path>
                </svg>
              </span>
              <span>OpenAI</span>
            </div>
            <div 
              class="ai-dropdown-item"
              :class="{ 'selected': selectedProvider === 'claude' }"
              @click="changeProvider('claude')"
            >
              <span class="provider-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                </svg>
              </span>
              <span>Claude</span>
            </div>
          </div>
        </div>
        <button class="chat-button" @click="sendMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="chat-divider"></div>
      <div class="chat-filters">
        <div 
          v-for="(filter, index) in filters" 
          :key="index"
          class="filter-pill"
          :class="{ 'active': activeFilters.includes(filter.id) }"
          @click="toggleFilter(filter.id)"
        >
          {{ filter.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, watchEffect } from 'vue';
import ChartVisualizer from './ui/chart/ChartVisualizer.vue';
import StaticMedicalChart from './ui/chart/StaticMedicalChart.vue';
import axios from 'axios';

// Add axios interceptors for debugging
axios.interceptors.request.use(config => {
  console.log('Axios Request:', config);
  return config;
}, error => {
  console.error('Axios Request Error:', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('Axios Response:', response);
  return response;
}, error => {
  console.error('Axios Response Error:', error);
  return Promise.reject(error);
});

// Reactive state
const chatInput = ref('');
const localMessages = ref([]);
const chatMessages = ref(null);
const activeFilters = ref([]);
const initialMessageSent = ref(false);
const isTyping = ref(false);
const lastThinkingMessageIndex = ref(-1);
const selectedProvider = ref('openai'); // Default AI provider
const showAIDropdown = ref(false);

// Format message time
const formatMessageTime = (time) => {
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Computed properties
const messagesExist = computed(() => {
  const msgs = props.messages && props.messages.length > 0 
    ? props.messages 
    : localMessages.value;
  return msgs.length > 0;
});

// Get messages from props or use local if none provided
const displayMessages = computed(() => {
  return props.messages && props.messages.length > 0 
    ? props.messages 
    : localMessages.value;
});

// Update emits to include message-updated, provider-changed
const emit = defineEmits(['chat-started', 'message-sent', 'message-updated', 'thinking-state', 'chart-displayed', 'provider-changed']);

// Props
const props = defineProps({
  filters: {
    type: Array,
    default: () => [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'charts', name: 'Charts' },
      { id: 'dataset', name: 'Dataset' }
    ]
  },
  chatMode: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: Number,
    default: null
  },
  messages: {
    type: Array,
    default: () => []
  },
  hideInitialMessage: {
    type: Boolean,
    default: false
  },
  chartActionsVisible: {
    type: Boolean,
    default: false
  },
  chartActionsCollapsed: {
    type: Boolean,
    default: false
  },
  chatHistoryVisible: {
    type: Boolean,
    default: false
  }
});

// When component mounts, check if we're in chat mode
onMounted(() => {
  // Load preferred provider from localStorage if available
  const savedProvider = localStorage.getItem('preferredAIProvider');
  if (savedProvider) {
    selectedProvider.value = savedProvider;
  }

  if (props.chatMode && props.messages.length === 0) {
    localMessages.value = [
      { text: 'Hello! How can I help you with your data analysis today?', isUser: false, time: new Date() }
    ];
  }

  // This will watch for external changes to the input element's value
  watchEffect(() => {
    const chatInputEl = document.querySelector('.chat-input');
    if (chatInputEl && chatInputEl.value && chatInputEl.value !== chatInput.value) {
      // Update our local v-model with the externally set value
      chatInput.value = chatInputEl.value;
    }
  });
  
  // Check for existing chart messages on mount
  checkForChartMessages();
  updateContainerClasses();

  // Add click event listener to close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    const dropdown = document.querySelector('.ai-dropdown-container');
    if (dropdown && !dropdown.contains(event.target)) {
      showAIDropdown.value = false;
    }
  });
});

// Check if any messages contain charts and emit event
const checkForChartMessages = () => {
  if (displayMessages.value && displayMessages.value.length > 0) {
    // Count both types of charts
    let singleChartCount = 0;
    let multipleChartCount = 0;
    let totalChartCount = 0;
    
    displayMessages.value.forEach(msg => {
      if (msg.chart) {
        singleChartCount++;
        totalChartCount++;
      }
      
      if (msg.multipleCharts && msg.multipleCharts.charts) {
        multipleChartCount++;
        totalChartCount += msg.multipleCharts.charts.length;
      }
    });
    
    // Send detailed chart information to parent
    emit('chart-displayed', {
      hasSingleChart: singleChartCount > 0,
      hasMultipleCharts: multipleChartCount > 0,
      singleChartCount,
      multipleChartCount,
      chartCount: totalChartCount
    });
  } else {
    // No messages or no charts
    emit('chart-displayed', {
      hasSingleChart: false,
      hasMultipleCharts: false,
      singleChartCount: 0,
      multipleChartCount: 0,
      chartCount: 0
    });
  }
};

// When messages change, check for charts
watch(displayMessages, (newMessages, oldMessages) => {
  if (newMessages !== oldMessages) {
    nextTick(() => {
      checkForChartMessages();
    });
  }
}, { deep: true });

// Also check when props.messages changes
watch(() => props.messages, (newMessages, oldMessages) => {
  if (newMessages !== oldMessages) {
    nextTick(() => {
      checkForChartMessages();
    });
  }
}, { deep: true });

// Update the sendMessage function to use our streaming response
const sendMessage = () => {
  if (!chatInput.value.trim()) return;
  
  // If this is the first message and we're not in a session yet
  if (!props.chatMode && !initialMessageSent.value) {
    // Emit chat-started event to create a new session
    emit('chat-started', chatInput.value);
    initialMessageSent.value = true;
    
    // Clear input after sending the first message
    chatInput.value = '';
    return;
  }
  
  // Add user message to the appropriate store
  const userMessage = {
    text: chatInput.value,
    isUser: true,
    time: new Date()
  };
  
  if (props.sessionId !== null) {
    // If we're in a session, emit it to the parent
    emit('message-sent', props.sessionId, userMessage);
  } else {
    // Otherwise store locally (this shouldn't happen often)
    localMessages.value.push(userMessage);
  }
  
  // Store the query and clear input
  const userQuery = chatInput.value;
  chatInput.value = '';
  
  // Show typing indicator
  isTyping.value = true;
  
  // Emit thinking state for gradient animation
  if (props.sessionId !== null) {
    emit('message-sent', props.sessionId, { isThinking: true });
    emit('thinking-state', true);
  }
  
  // Check if this is a chart-related query first
  if (isChartRelatedQuery(userQuery)) {
    // Use existing chart handling logic
    setTimeout(() => {
      handleChartQuery(userQuery);
    }, 1500);
  } else {
    // Use streaming response for better UX
    streamResponse(userQuery)
      .finally(() => {
        // Scroll to bottom after streaming completes
        scrollToBottom();
      });
  }
};

// Stream response from OpenAI
const streamResponse = async (prompt) => {
  try {
    console.log('Starting streaming response for query:', prompt);
    
    // Create a fetch request to streaming endpoint with provider
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: prompt,
        sessionId: props.sessionId !== null ? props.sessionId.toString() : 'local-session',
        provider: selectedProvider.value // Add provider to request
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Create empty AI response message
    const aiMessage = {
      text: '',
      isUser: false,
      time: new Date(),
      afterThinking: true,
      streaming: true
    };
    
    // Add the empty message to display
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, aiMessage);
    } else {
      localMessages.value.push(aiMessage);
    }
    
    // Get references to update the message
    const messageIndex = props.sessionId !== null ? -1 : localMessages.value.length - 1;
    
    // Hide typing indicator once streaming starts
    isTyping.value = false;
    
    // Emit end of thinking state
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, { isThinking: false });
      emit('thinking-state', false);
    }
    
    // Process the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let streamedText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk and append to message
      const chunk = decoder.decode(value, { stream: true });
      streamedText += chunk;
      
      // Update the message text
      if (props.sessionId !== null) {
        // For session-based chats, emit update event
        emit('message-updated', props.sessionId, {
          text: streamedText,
          isUser: false,
          time: new Date(),
          afterThinking: true
        });
      } else if (messageIndex >= 0) {
        // For local messages, update directly
        localMessages.value[messageIndex].text = streamedText;
      }
      
      // Scroll to keep up with streaming text
      scrollToBottom();
    }
    
    console.log('Stream completed');
    
  } catch (error) {
    console.error('Streaming error:', error);
    isTyping.value = false;
    
    // Emit end of thinking state
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, { isThinking: false });
      emit('thinking-state', false);
    }
    
    // Show error message
    const errorMessage = {
      text: 'Sorry, I encountered an error streaming the response. Please try again.',
      isUser: false,
      time: new Date(),
      afterThinking: true
    };
    
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, errorMessage);
    } else {
      localMessages.value.push(errorMessage);
    }
  }
};

// Helper function to check if a query is chart-related
const isChartRelatedQuery = (query) => {
  const chartKeywords = [
    'chart', 'graph', 'plot', 'visualization', 'viz', 'visual',
    'bar', 'line', 'pie', 'scatter', 'trend', 'compare'
  ];
  
  return chartKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
};

// Handle chart-related queries
const handleChartQuery = async (query) => {
  console.log("Processing chart query in ChatBox:", query);
  
  // Hide typing indicator
  isTyping.value = false;
  
  // Emit end of thinking state
  if (props.sessionId !== null) {
    emit('message-sent', props.sessionId, { isThinking: false });
    emit('thinking-state', false);
  }
  
  try {
    // Call the backend chart generation endpoint with provider
    const response = await axios.post('/api/ai/chart', {
      query: query,
      sessionId: props.sessionId !== null ? props.sessionId.toString() : 'local-session',
      provider: selectedProvider.value // Add provider to request
    });
    
    if (!response.data.success || !response.data.chartData) {
      throw new Error('Invalid chart data received from server');
    }
    
    const chartData = response.data.chartData;
    
    // Create chart response message
    const chartResponse = {
      text: chartData.explanation || `Here's a chart based on your query: "${query}"`,
      isUser: false,
      time: new Date(),
      afterThinking: true,
      chart: {
        type: chartData.chartType || 'bar',
        data: chartData.data || [],
        title: chartData.title || 'Chart Visualization',
        options: chartData.options || {}
      }
    };
    
    // Add the chart response to messages
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, chartResponse);
    } else {
      localMessages.value.push(chartResponse);
    }
    
    // Scroll to bottom after adding the chart
    scrollToBottom();
    
  } catch (error) {
    console.error("Error generating chart:", error);
    
    // Show error message
    const errorMessage = {
      text: "Sorry, I encountered an error generating the chart. Please try a different query.",
      isUser: false,
      time: new Date(),
      afterThinking: true
    };
    
    if (props.sessionId !== null) {
      emit('message-sent', props.sessionId, errorMessage);
    } else {
      localMessages.value.push(errorMessage);
    }
    
    scrollToBottom();
  }
};

const toggleFilter = (filterId) => {
  const index = activeFilters.value.indexOf(filterId);
  if (index > -1) {
    // Remove filter if already active
    activeFilters.value.splice(index, 1);
  } else {
    // Add filter
    activeFilters.value.push(filterId);
  }
};

// Auto-scroll chat to bottom when new messages are added
const scrollToBottom = async () => {
  // Wait for next tick to ensure DOM updates
  await nextTick();
  
  // Add a small delay to allow charts to render before scrolling
  setTimeout(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    }
  }, 100);
};

// Watch for new messages and scroll to bottom
watch(
  [displayMessages, () => props.messages],
  () => {
    scrollToBottom();
  },
  { deep: true }
);

const showTimestamp = (message, index) => {
  // Always show timestamp for user messages
  if (message.isUser) {
    return true;
  }
  
  // Hide timestamp if this message was created after thinking
  if (message.afterThinking) {
    return false;
  }
  
  // Hide timestamp during thinking state
  if (isTyping.value && index === displayMessages.value.length - 1) {
    return false;
  }
  
  // Check if this is a system message that's part of a sequence
  const nextMessage = index < displayMessages.value.length - 1 ? displayMessages.value[index + 1] : null;
  const prevMessage = index > 0 ? displayMessages.value[index - 1] : null;
  
  // Hide timestamp if this is part of consecutive system messages (except the last one)
  if (!message.isUser && nextMessage && !nextMessage.isUser) {
    return false;
  }
  
  // Hide timestamp if this message is empty or just follows a thinking state
  if (!message.isUser && prevMessage && !prevMessage.isUser && (!message.text || message.text.trim() === '')) {
    return false;
  }
  
  // Hide timestamps for the first message after thinking state
  if (!message.isUser && index === lastThinkingMessageIndex.value + 1) {
    return false;
  }
  
  return true;
};

// Add a watcher to update the thinking message index
watch(isTyping, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    // When thinking state ends, record the index
    lastThinkingMessageIndex.value = displayMessages.value.length - 1;
  }
});

// Watch for changes to props to update container classes
watch(() => props.chartActionsVisible, (newValue) => {
  updateContainerClasses();
});

watch(() => props.chartActionsCollapsed, (newValue) => {
  updateContainerClasses();
});

watch(() => props.chatHistoryVisible, (newValue) => {
  updateContainerClasses();
});

// Method to update the container classes based on current state
const updateContainerClasses = () => {
  const chatContainer = document.querySelector('.chat-container');
  if (!chatContainer) return;
  
  // Clear existing layout classes
  chatContainer.classList.remove('chat-box-with-charts', 'chat-box-with-collapsed-charts', 'chat-box-with-history');
  
  // Add appropriate classes based on current state
  if (props.chatHistoryVisible) {
    chatContainer.classList.add('chat-box-with-history');
  }
  
  if (props.chartActionsVisible) {
    if (props.chartActionsCollapsed) {
      chatContainer.classList.add('chat-box-with-collapsed-charts');
    } else {
      chatContainer.classList.add('chat-box-with-charts');
    }
  }
};

// Function to change the AI provider
const changeProvider = (provider) => {
  selectedProvider.value = provider;
  showAIDropdown.value = false; // Close dropdown after selection
  
  // Save preference to localStorage
  localStorage.setItem('preferredAIProvider', provider);
  
  // Emit event to notify parent components
  emit('provider-changed', provider);
};

// Toggle dropdown visibility
const toggleAIDropdown = () => {
  showAIDropdown.value = !showAIDropdown.value;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

.chat-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px); /* 20px padding on each side */
  max-width: 600px;
  display: flex;
  flex-direction: column;
  z-index: 990; /* Reduced z-index to ensure chart panel appears on top when needed */
  transition: all 0.3s ease;
  font-family: 'DM Sans', sans-serif;
}

/* Chat container modifications when in chat mode */
.chat-container.chat-mode {
  max-width: 1200px; /* Base max width */
  width: calc(100% - 48px); /* 24px padding on each side */
  height: calc(100vh - 150px);
  top: 120px;
  bottom: auto;
  padding: 0;
  border-radius: 18px;
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 auto; /* Center the container */
  left: 50%;
  transform: translateX(-50%);
}

.chat-container.chat-mode .chat-messages {
  padding: 32px; /* Standardized base padding */
  max-height: none;
  height: calc(100% - 100px);
}

.chat-messages {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px; /* Standardized spacing for better consistency */
  max-height: calc(100% - 100px);
}

.chat-bubble {
  max-width: 70%; /* Adjusted to provide better readability in a wider container */
  border-radius: 16px;
  padding: 16px 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease forwards;
  opacity: 0;
}

/* Chat input container also needs adjustment for wider display */
.chat-container.chat-mode .chat-input-container {
  padding: 25px 40px; /* Increased padding for better spacing */
}

.chat-messages::-webkit-scrollbar {
  width: 5px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.chat-bubble {
  padding: 12px;
  border-radius: 16px;
  word-wrap: break-word;
  box-shadow: 0px 0px 3px rgba(123, 123, 123, 0.10);
  margin-bottom: 12px;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat-mode .chat-bubble {
  margin-bottom: 16px;
}

.chat-mode .user-message,
.chat-mode .system-message,
.chat-mode .thinking-state {
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  background: linear-gradient(90deg, white 0%, #ECF2FF 100%);
  color: #323232;
}

.system-message {
  align-self: flex-start;
  background: white;
  color: #323232;
}

.thinking-state {
  align-self: flex-start;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.95));
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  min-width: 140px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  z-index: 0;
  box-shadow: 0 0 15px rgba(44, 228, 207, 0.2);
  border: 1px solid rgba(220, 220, 220, 0.4);
}

/* Enhanced glowing border effect */
.thinking-state::before {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(
    45deg,
    #2CE4CF,
    #43c0ff,
    #257BDF,
    #6A5ACD,
    #2CE4CF
  );
  z-index: -1;
  border-radius: 18px;
  background-size: 400%;
  filter: blur(1px);
  opacity: 0.9;
  animation: glowing-border 8s ease-in-out infinite;
}

/* Add translucent white inner shadow */
.thinking-state::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.9), 
              inset 0 0 3px rgba(180, 180, 180, 0.2);
  border-radius: 15px;
  z-index: 1;
  pointer-events: none;
}

@keyframes glowing-border {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #323232;
  font-size: 15px;
  font-family: 'DM Sans';
  font-weight: 500;
  line-height: 20px;
  width: 100%;
  position: relative;
  z-index: 2;
}

/* Restore and enhance wave animation */
.thinking-wave-container {
  display: block;
  height: 24px;
  width: 60px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.thinking-wave {
  display: block;
  height: 3px;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(90deg, 
    rgba(44, 228, 207, 0),
    #43c0ff,
    #257BDF,
    #6A5ACD,
    rgba(44, 228, 207, 0)
  );
  animation: wave 2s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
}

@keyframes wave {
  0% {
    left: -100%;
    right: 100%;
  }
  50% {
    left: 0%;
    right: 0%;
  }
  100% {
    left: 100%;
    right: -100%;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
  width: 100%;
  max-width: 100%;
}

.message-content p {
  margin: 0;
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans';
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

.message-time {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
}

/* Chat bubble animations - enhanced timing */
.chat-bubble.animate-in {
  animation: bubbleIn 0.5s ease forwards;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

@keyframes bubbleIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced thinking state transition */
.thinking-state.animate-in {
  animation: thinkingIn 0.4s ease forwards;
}

@keyframes thinkingIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Typing indicator */
.typing-indicator {
  display: none;
}

.typing-dots {
  display: none;
}

.chat-input-container {
  position: relative;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  font-family: 'DM Sans', sans-serif;
}

.chat-input {
  flex: 1;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #777777;
  letter-spacing: -0.02em;
  line-height: 1.2em;
  padding: 8px 0;
  outline: none;
  background-color: transparent;
}

.chat-input::placeholder {
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.chat-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  color: #257BDF;
  font-family: 'DM Sans', sans-serif;
}

.chat-button:hover {
  transform: scale(1.1);
}

.chat-divider {
  width: 100%;
  height: 1px;
  background: radial-gradient(circle, rgba(239, 239, 239, 0.7) 54.5%, transparent 100%);
  margin: 8px 0;
}

.chat-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
}

.filter-pill {
  background-color: rgba(237, 237, 237, 0.7);
  border-radius: 384px;
  padding: 4px 8px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #676767;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.43em;
  letter-spacing: -0.02em;
}

.filter-pill.active {
  background-color: rgba(37, 123, 223, 0.9);
  color: #FFFFFF;
}

.filter-pill:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Update responsive breakpoints based on standard device sizes */
@media (min-width: 1441px) {
  .chat-container.chat-mode {
    max-width: 1400px;
    width: calc(100% - 64px); /* 32px padding on each side */
    padding: 0;
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 40px;
  }
  
  .chat-bubble {
    max-width: 60%; /* Narrower for better readability on large screens */
  }
}

@media (min-width: 1200px) and (max-width: 1440px) {
  .chat-container.chat-mode {
    max-width: 1000px;
    width: calc(100% - 48px); /* 24px padding on each side */
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 32px;
  }
  
  .chat-bubble {
    max-width: 65%;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .chat-container.chat-mode {
    max-width: 900px;
    width: calc(100% - 40px); /* 20px padding on each side */
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 28px;
  }
  
  .chat-bubble {
    max-width: 70%;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .chat-container.chat-mode {
    max-width: 700px;
    width: calc(100% - 32px); /* 16px padding on each side */
    height: calc(100vh - 140px);
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 24px;
  }
  
  .chat-container.chat-mode .chat-input-container {
    padding: 20px;
  }
  
  .chat-bubble {
    max-width: 75%;
  }
}

@media (max-width: 767px) {
  .chat-container {
    width: calc(100% - 32px); /* 16px padding on each side */
  }
  
  .chat-container.chat-mode {
    width: calc(100% - 24px); /* 12px padding on each side */
    height: calc(100vh - 130px);
    top: 110px;
    max-width: 100%; /* Take up full width on mobile */
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 20px 16px;
  }
  
  .chat-container.chat-mode .chat-input-container {
    padding: 16px;
  }
  
  .chat-bubble {
    max-width: 85%;
    padding: 12px 16px;
  }
  
  .chat-mode .user-message,
  .chat-mode .system-message,
  .chat-mode .thinking-state {
    max-width: 85%;
  }
}

@media (max-width: 480px) {
  .chat-container.chat-mode {
    width: calc(100% - 16px); /* 8px padding on each side */
    height: calc(100vh - 120px);
    top: 100px;
  }

  .chat-messages {
    max-height: calc(100% - 80px);
    padding: 16px 12px;
  }
  
  .chat-input {
    font-size: 14px;
  }
  
  .chat-bubble {
    max-width: 90%;
    padding: 10px 14px;
  }
  
  .chat-mode .user-message,
  .chat-mode .system-message,
  .chat-mode .thinking-state {
    max-width: 90%;
  }

  .chat-container.chat-mode .chat-input-container {
    padding: 12px;
  }
}

/* Content layout adjustments for wide screens */
@media (min-width: 1600px) {
  .chat-bubble {
    max-width: 60%; /* Even narrower for very wide screens */
  }
  
  .chat-container.chat-mode .chat-messages {
    padding: 50px; /* More padding on very large screens */
  }
}

/* Hide empty bubbles */
.chat-bubble.empty-bubble {
  display: none;
}

/* Hide timestamps for post-thinking messages */
.chat-bubble.post-thinking .message-time {
  display: none;
}

/* Hide timestamp in thinking state */
.thinking-state .message-time {
  display: none;
}

/* Additional style to ensure proper display */
.chat-bubble.system-message:has(.message-content:empty) {
  display: none;
}

/* Add CSS to hide bubble when needed */
.chat-bubble.hidden {
  display: none !important;
}

/* Add these new styles to support charts in chat bubbles */
.chat-chart-container {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;
  width: 100%;
  max-width: 100%;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Styles for multiple charts in a message */
.chat-multichart-container {
  margin-top: 16px;
  width: 100%;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
}

.chart-grid.two-columns {
  grid-template-columns: repeat(2, 1fr);
}

.chart-grid-item {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-grid-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-grid-item.full-width {
  grid-column: 1 / -1;
}

/* Make chat bubbles with charts wider */
.chart-bubble {
  max-width: 85% !important; /* Wider to accommodate charts */
  min-width: 280px;
  width: auto;
  padding-right: 16px;
}

/* Adjust chart bubble width at different breakpoints */
@media (min-width: 768px) {
  .chart-bubble {
    max-width: 70% !important;
    min-width: 350px;
  }
}

@media (min-width: 992px) {
  .chart-bubble {
    max-width: 65% !important;
    min-width: 400px;
  }
}

@media (min-width: 1200px) {
  .chart-bubble {
    max-width: 60% !important;
    min-width: 450px;
  }
}

/* When in chat mode, make chart bubbles even wider */
.chat-mode .chart-bubble {
  max-width: 90% !important;
}

@media (min-width: 768px) {
  .chat-mode .chart-bubble {
    max-width: 75% !important;
  }
}

@media (min-width: 992px) {
  .chat-mode .chart-bubble {
    max-width: 70% !important;
  }
}

@media (min-width: 1200px) {
  .chat-mode .chart-bubble {
    max-width: 65% !important;
  }
}

/* Add hover effect to make charts more interactive */
.chat-chart-container:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Smaller screens */
@media (max-width: 480px) {
  .chat-bubble.chart-bubble {
    max-width: 95% !important;
    min-width: 250px;
    padding: 12px;
  }
  
  .chart-bubble .message-content p {
    font-size: 13px;
    margin-bottom: 12px;
  }
  
  .chat-chart-container {
    margin-top: 12px;
    border-radius: 8px;
  }
}

.chat-box {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* Adjust when sidebar is visible */
.chat-box.chat-box-with-history {
  width: calc(100% - 240px);
  margin-left: 240px;
}

/* Adjust when chart actions panel is visible */
.chat-box.chat-box-with-charts {
  width: calc(100% - 240px);
  margin-right: 240px;
  transition: all 0.3s ease;
}

/* Adjust when chart actions panel is collapsed */
.chat-box.chat-box-with-collapsed-charts {
  width: calc(100% - 60px);
  margin-right: 60px;
  transition: all 0.3s ease;
}

/* Handle both panels visible at once */
.chat-box.chat-box-with-history.chat-box-with-charts {
  width: calc(100% - 480px);
  margin-left: 240px;
  margin-right: 240px;
  transition: all 0.3s ease;
}

/* Handle both panels with chart panel collapsed */
.chat-box.chat-box-with-history.chat-box-with-collapsed-charts {
  width: calc(100% - 300px);
  margin-left: 240px;
  margin-right: 60px;
  transition: all 0.3s ease;
}

/* Remove duplicate responsive media queries */
@media (max-width: 1200px) {
  .chat-box.chat-box-with-charts {
    width: calc(100% - 220px);
    margin-right: 220px;
  }
  
  .chat-box.chat-box-with-history.chat-box-with-charts {
    width: calc(100% - 440px);
    margin-left: 220px;
    margin-right: 220px;
  }
  
  .chat-box.chat-box-with-history.chat-box-with-collapsed-charts {
    width: calc(100% - 280px);
    margin-left: 220px;
    margin-right: 60px;
  }
}

@media (max-width: 992px) {
  .chat-box.chat-box-with-charts {
    width: calc(100% - 200px);
    margin-right: 200px;
  }
  
  .chat-box.chat-box-with-collapsed-charts {
    width: calc(100% - 50px);
    margin-right: 50px;
  }
  
  .chat-box.chat-box-with-history.chat-box-with-charts {
    width: calc(100% - 400px);
    margin-left: 200px;
    margin-right: 200px;
  }
  
  .chat-box.chat-box-with-history.chat-box-with-collapsed-charts {
    width: calc(100% - 250px);
    margin-left: 200px;
    margin-right: 50px;
  }
}

@media (max-width: 768px) {
  /* For mobile devices, the panels will overlay the chat instead of shrinking it */
  .chat-container.chat-box-with-charts,
  .chat-container.chat-box-with-collapsed-charts,
  .chat-container.chat-box-with-history.chat-box-with-charts,
  .chat-container.chat-box-with-history.chat-box-with-collapsed-charts {
    max-width: 100%;
    width: calc(100% - 24px);
    margin-left: auto;
    margin-right: auto;
    /* Ensure content stays visible under the panels */
    position: relative;
    z-index: 900; /* Lower z-index to ensure panels overlay properly */
  }
  
  /* Add padding to chat content to ensure it's visible when panels are open */
  .chat-container.chat-mode .chat-messages {
    padding: 16px;
  }
}

/* Responsive styles for the chat container with chart actions panel */
.chat-container.chat-box-with-charts {
  max-width: calc(100% - 240px);
  transition: all 0.3s ease;
  margin-right: 240px;
}

.chat-container.chat-box-with-collapsed-charts {
  max-width: calc(100% - 60px);
  transition: all 0.3s ease;
  margin-right: 60px;
}

/* Handle both panels visible at once */
.chat-container.chat-box-with-history.chat-box-with-charts {
  max-width: calc(100% - 480px);
  margin-left: 240px;
  margin-right: 240px;
  transition: all 0.3s ease;
}

/* Handle both panels with chart panel collapsed */
.chat-container.chat-box-with-history.chat-box-with-collapsed-charts {
  max-width: calc(100% - 300px);
  margin-left: 240px;
  margin-right: 60px;
  transition: all 0.3s ease;
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 1200px) {
  .chat-container.chat-box-with-charts {
    max-width: calc(100% - 220px);
    margin-right: 220px;
  }
  
  .chat-container.chat-box-with-history.chat-box-with-charts {
    max-width: calc(100% - 440px);
    margin-left: 220px;
    margin-right: 220px;
  }
  
  .chat-container.chat-box-with-history.chat-box-with-collapsed-charts {
    max-width: calc(100% - 280px);
    margin-left: 220px;
    margin-right: 60px;
  }
}

@media (max-width: 992px) {
  .chat-container.chat-box-with-charts {
    max-width: calc(100% - 200px);
    margin-right: 200px;
  }
  
  .chat-container.chat-box-with-collapsed-charts {
    max-width: calc(100% - 50px);
    margin-right: 50px;
  }
  
  .chat-container.chat-box-with-history.chat-box-with-charts {
    max-width: calc(100% - 400px);
    margin-left: 200px;
    margin-right: 200px;
  }
  
  .chat-container.chat-box-with-history.chat-box-with-collapsed-charts {
    max-width: calc(100% - 250px);
    margin-left: 200px;
    margin-right: 50px;
  }
}

@media (max-width: 768px) {
  /* For mobile devices, the panels will overlay the chat instead of shrinking it */
  .chat-container.chat-box-with-charts,
  .chat-container.chat-box-with-collapsed-charts,
  .chat-container.chat-box-with-history.chat-box-with-charts,
  .chat-container.chat-box-with-history.chat-box-with-collapsed-charts {
    max-width: 100%;
    width: calc(100% - 24px);
    margin-left: auto;
    margin-right: auto;
    /* Ensure content stays visible under the panels */
    position: relative;
    z-index: 900; /* Lower z-index to ensure panels overlay properly */
  }
  
  /* Add padding to chat content to ensure it's visible when panels are open */
  .chat-container.chat-mode .chat-messages {
    padding: 16px;
  }
}

/* Responsive handling for multiple charts */
@media (max-width: 768px) {
  .chart-grid.two-columns {
    grid-template-columns: 1fr;
  }
  
  .chat-multichart-container {
    margin-top: 12px;
  }
  
  .chart-grid {
    gap: 12px;
  }
}

/* For very small screens, adjust the bubble containing multiple charts */
@media (max-width: 480px) {
  .chat-bubble:has(.chat-multichart-container) {
    max-width: 95% !important;
    padding: 12px;
  }
  
  .chart-grid-item {
    border-radius: 8px;
  }
  
  .chart-grid {
    gap: 10px;
  }
}

/* Replace the provider-selector styles with dropdown styles */
.ai-dropdown-container {
  position: relative;
  z-index: 1000;
}

.ai-dropdown-toggle {
  display: flex;
  align-items: center;
  background-color: rgba(237, 237, 237, 0.5);
  border: none;
  border-radius: 16px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.ai-dropdown-toggle:hover, .ai-dropdown-toggle.active {
  background-color: rgba(220, 220, 220, 0.7);
}

.current-provider-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.ai-dropdown-toggle.active .dropdown-arrow {
  transform: rotate(180deg);
}

.ai-dropdown-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 140px;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease;
}

.ai-dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  gap: 8px;
}

.ai-dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.ai-dropdown-item.selected {
  background-color: rgba(37, 123, 223, 0.1);
  font-weight: 500;
}

.ai-dropdown-item .provider-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}

.ai-dropdown-item.selected .provider-icon {
  color: rgba(37, 123, 223, 0.9);
}

/* Animation for dropdown */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Remove the old provider selector styles that are no longer needed */
.provider-selector {
  display: none;
}

/* Remove the old AI providers section that was below the input */
.ai-providers {
  display: none;
}
</style> 