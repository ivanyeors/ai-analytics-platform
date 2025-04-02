<template>
  <div class="ai-chat-container">
    <div class="chat-messages" ref="chatContainer">
      <div v-for="(message, index) in messages" 
           :key="index" 
           :class="['message', message.type]">
        <div class="message-content" v-html="formatMessage(message.content)"></div>
      </div>
      <div v-if="isTyping" class="message ai typing">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <input 
        v-model="userMessage" 
        @keyup.enter="sendMessage"
        placeholder="Type your message here..."
        :disabled="isLoading"
      >
      <button 
        @click="sendMessage" 
        :disabled="isLoading || !userMessage.trim()"
      >
        {{ isLoading ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AIChat',
  data() {
    return {
      messages: [],
      userMessage: '',
      isLoading: false,
      isTyping: false,
      conversationHistory: [],
      apiKey: '', // Ideally this should be secured on the server side
      streamController: null
    };
  },
  created() {
    // Optional: Add a system welcome message
    this.messages.push({
      type: 'ai',
      content: 'Hello! How can I assist you today?'
    });
  },
  methods: {
    async sendMessage() {
      if (!this.userMessage.trim() || this.isLoading) return;
      
      const message = this.userMessage.trim();
      
      // Add user message to UI
      this.messages.push({
        type: 'user',
        content: message
      });
      
      // Store the message in conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });
      
      this.userMessage = '';
      this.isLoading = true;
      this.isTyping = true;
      
      // Scroll to bottom after user message is added
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Use the streaming method instead of the regular API call
      try {
        await this.streamResponse(message);
      } catch (error) {
        console.error('Error:', error);
        this.isTyping = false;
        this.messages.push({
          type: 'error',
          content: 'Sorry, there was an error processing your request.'
        });
        this.isLoading = false;
      } finally {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    // Method to enable streaming responses (optional)
    async streamResponse(prompt) {
      // If a previous request is in progress, cancel it
      if (this.streamController) {
        this.streamController.abort();
      }
      
      // Create a new AbortController for this request
      this.streamController = new AbortController();
      
      try {
        console.log('Attempting to connect to streaming API...');
        
        const response = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: prompt,
            conversationHistory: this.conversationHistory
          }),
          signal: this.streamController.signal
        });
        
        if (!response.ok) {
          console.error(`Server returned error ${response.status}: ${response.statusText}`);
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Create empty AI response message
        const messageIndex = this.messages.length;
        this.messages.push({
          type: 'ai',
          content: ''
        });
        
        // Hide typing indicator once streaming starts
        this.isTyping = false;
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let aiResponse = '';
        
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and append to message
          const chunk = decoder.decode(value, { stream: true });
          aiResponse += chunk;
          
          // Update the UI with accumulated text
          this.messages[messageIndex].content = aiResponse;
          
          // Scroll to keep up with streaming text
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
        
        // Add completed response to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Streaming error:', error);
          
          // Try fallback to regular API if streaming fails due to connection issues
          if (
            error.name === 'TypeError' || 
            error.message.includes('Failed to fetch') || 
            error.code === 'ECONNREFUSED' || 
            error.message.includes('Server error')
          ) {
            console.log('Streaming API unavailable, trying fallback API method...');
            await this.fallbackApiRequest(prompt);
            return;
          }
          
          this.isTyping = false;
          this.messages.push({
            type: 'error',
            content: 'Sorry, there was an error streaming the response.'
          });
        }
      } finally {
        this.streamController = null;
        this.isLoading = false;
      }
    },
    
    // Fallback method that uses the regular API endpoint
    async fallbackApiRequest(prompt) {
      try {
        console.log('Using fallback API endpoint...');
        
        const response = await axios.post('/ai/chat', {
          message: prompt,
          conversationHistory: this.conversationHistory
        });
        
        if (!response.data || !response.data.success) {
          throw new Error('Invalid response from server');
        }
        
        // Hide typing indicator once response is received
        this.isTyping = false;
        
        // Add response to UI
        this.messages.push({
          type: 'ai',
          content: response.data.response
        });
        
        // Add to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: response.data.response
        });
      } catch (error) {
        console.error('Fallback API error:', error);
        this.isTyping = false;
        this.messages.push({
          type: 'error',
          content: 'Sorry, the server is currently unavailable. Please check if the backend server is running and try again later.'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.chatContainer;
      container.scrollTop = container.scrollHeight;
    },
    
    formatMessage(content) {
      // Convert newlines to <br> tags
      return content.replace(/\n/g, '<br>');
    }
  }
};
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
}

.message.ai {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: #333;
}

.message.error {
  align-self: center;
  background-color: #ffebee;
  color: #c62828;
}

.chat-input {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-top: 1px solid #ddd;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Typing indicator styles */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.4s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style> 