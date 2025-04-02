<template>
  <!-- 
    Enhanced sidebar implementation:
    - Simplified sidebar without collapse functionality
    - Glassmorphism effect with subtle border
    - Text labels for all views
    - Smooth transitions
  -->
  <div class="home-page" :class="{ 
    'chat-mode': activeChatSession !== null, 
    'has-sessions': chatSessions.length > 0,
    'sidebar-collapsed': sidebarCollapsed,
    'actions-panel-visible': showChartActionsPanel,
    'actions-panel-collapsed': isActionsPanelCollapsed
  }">
    <!-- Background elements -->
    <div class="background-group">
      <div class="background-image"></div>
      <div class="background-overlay"></div>
    </div>
    <div class="ellipse-gradient" :class="{ 'thinking-animation': isThinking }"></div>
    
    <!-- Sidebar (visible once any chat sessions exist) -->
    <div class="sidebar" 
         v-if="chatSessions.length > 0"
         :class="{ 'collapsed': sidebarCollapsed }">
      <!-- Chat History Header -->
      <div class="sidebar-header">
        <div class="sidebar-title">Chat History</div>
        <div class="sidebar-arrow-icon" @click="toggleArrow">
          <img :src="arrowBack" alt="Arrow" :class="{ 'rotated': arrowRotated }" />
        </div>
      </div>
      
      <!-- Chat sessions in card style -->
      <div class="chat-sessions-container">
        <div 
          v-for="(session, index) in chatSessions" 
          :key="index"
          class="chat-session-card"
          :class="{ 'active': activeChatSession === index }"
          @click="switchToSession(index)"
          :data-number="index + 1"
        >
          <div class="chat-session-content">
            {{ session.title || `Chat Session ${index + 1}` }}
          </div>
        </div>
      </div>
      
      <!-- New chat button (returns to home/action cards) -->
      <div class="nav-icon new-chat" @click="createNewChatSession" title="Start a new chat">
        <img :src="addIcon" alt="New Chat" class="nav-icon-img" />
        <span class="icon-label">New Chat</span>
      </div>
    </div>
    
    <!-- Header -->
    <div class="header">
      <!-- Logo (now creates a new chat session) -->
      <div class="evyd-logo" @click="returnToHome" :class="{ 'clickable': chatSessions.length > 0 }" title="Start a new chat">
        <img src="../assets/evyd-logo.svg" alt="EVYD Logo" />
      </div>
      <!-- Header line -->
      <div class="header-line"></div>
    </div>
    
    <!-- Welcome message - only show in home mode, not in chat mode -->
    <h1 class="welcome-message" v-if="activeChatSession === null">
      {{ `Welcome ${userName}, How can we help today?` }}
    </h1>
    
    <!-- Action cards - visible in home mode and new chat sessions -->
    <div class="action-cards" v-if="showActionCards">
      <div 
        v-for="(action, index) in actions" 
        :key="index"
        class="action-card"
        @click="handleActionClick(action.type)"
        @mouseenter="hoveredCard = index"
        @mouseleave="hoveredCard = null"
        :class="{ 'hovered': hoveredCard === index }"
      >
        <div class="chart-preview">
          <img :src="action.chartPreview" :alt="action.title" class="chart-image" />
        </div>
        <div class="card-content">
          <h3>{{ action.title }}</h3>
          <p>{{ action.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- ChatBox component - show active session or a new empty one for home -->
    <ChatBox 
      :key="`chat-session-${activeChatSession !== null ? activeChatSession : 'new'}-${chatSessions.length}`"
      :filters="filters"
      :chat-mode="activeChatSession !== null"
      :messages="activeChatSession !== null ? chatSessions[activeChatSession].messages : []"
      :sessionId="activeChatSession"
      :hide-initial-message="showActionCards"
      :chatHistoryVisible="showChatHistory"
      :chartActionsVisible="showChartActionsPanel"
      :chartActionsCollapsed="isActionsPanelCollapsed"
      @chat-started="startChatSession"
      @message-sent="updateChatSession"
      @thinking-state="handleThinkingState"
      @chart-displayed="handleChartDisplayed"
      @provider-changed="handleProviderChange"
    />
    
    <!-- Chart Panel for chart collection display -->
    <ChartPanel
      v-if="showChartPanel"
      :title="chartPanelData.title"
      :description="chartPanelData.description"
      :initialCharts="chartPanelData.charts"
      :showAddChart="chartPanelData.showAddChart"
      @close="closeChartPanel"
      @add-chart="handleAddChart"
    />
    
    <!-- Chart Actions Panel - shows buttons after chart is displayed -->
    <ChartActionsPanel 
      :visible="showChartActionsPanel" 
      @view-charts="handleViewCharts"
      @create-dashboard="handleCreateDashboard"
      @explore-dataset="handleExploreDataset"
      @collapse-change="handleChartPanelCollapse"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ChatBox from '../components/ChatBox.vue';
import ChartPanel from '../components/ui/chart/ChartPanel.vue';
import ChartVisualizer from '../components/ui/chart/ChartVisualizer.vue';
import ChartActionsPanel from '../components/ui/chart/ChartActionsPanel.vue';
import chartDataService from '../utils/chartDataService';
import axios from 'axios';

// Import icons
import addIcon from '../assets/icons/add.svg';
import arrowBack from '../assets/icons/arrow_back.svg';
import arrowForward from '../assets/icons/arrow_forward.svg';

const router = useRouter();

// User data
const userName = ref('Ivan');

// Chat sessions
const chatSessions = ref([]);
const activeChatSession = ref(null);

// Base64 encoded placeholder images (replace these with actual superset chart images)
import dashboardPreview from '../assets/Dashboard-img.jpeg';
import chartsPreview from '../assets/Charts-img.jpeg';
import datasetPreview from '../assets/Dataset-img.jpeg';

// Action cards data with chart previews
const actions = [
  { 
    title: 'Create Dashboard', 
    type: 'dashboard',
    description: 'Build interactive dashboards with multiple visualization types',
    chartPreview: dashboardPreview
  },
  { 
    title: 'Create Charts', 
    type: 'charts',
    description: 'Design custom charts with our powerful analytics engine',
    chartPreview: chartsPreview
  },
  { 
    title: 'Explore Dataset', 
    type: 'dataset',
    description: 'Analyze and transform your data with advanced filtering',
    chartPreview: datasetPreview
  }
];

// Filter options (used in ChatBox component) - all off by default
const filters = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'charts', name: 'Charts' },
  { id: 'dataset', name: 'Dataset' }
];

// Reactive state
const hoveredCard = ref(null);
const arrowRotated = ref(false);
const sidebarCollapsed = ref(false);
const selectedProvider = ref('openai'); // Default AI provider

// Chart visualization state
const showChartPanel = ref(false);
const chartPanelData = ref({
  title: 'Chart Collection',
  description: '',
  charts: [],
  showAddChart: false
});

// Chart actions panel state
const showChartActionsPanel = ref(false);
const hasChartInMessages = ref(false);
const isActionsPanelCollapsed = ref(false);

// Computed properties
// Add isThinking computed property in script section
const isThinking = computed(() => {
  return activeChatSession.value !== null && chatSessions.value[activeChatSession.value]?.isThinking === true;
});

// Determine if chat history sidebar should be shown
const showChatHistory = computed(() => {
  return chatSessions.value.length > 0;
});

// Computed property to determine when to show action cards
const showActionCards = computed(() => {
  // Don't show action cards if a chart panel is visible
  if (showChartPanel.value) return false;
  
  // Case 1: Show action cards on home view
  if (activeChatSession.value === null) {
    return true;
  }
  
  // Case 2: Show action cards in a new session with only the welcome message
  const session = chatSessions.value[activeChatSession.value];
  const messages = session?.messages || [];
  
  // Show cards if there's only the system welcome message
  // Hide them as soon as there's a user message
  if (messages.length === 1 && !messages[0].isUser) {
    return true;
  }
  
  // Hide in all other cases
  return false;
});

// Methods
const handleActionClick = (type) => {
  console.log(`Action clicked: ${type}`);
  
  if (type === 'charts') {
    // Create a new chat session if one doesn't exist yet
    if (activeChatSession.value === null) {
      const newSession = {
        id: chatSessions.value.length,
        title: "Chart Generation",
        messages: [
          { text: 'Hello! How can I help you with your data analysis today?', isUser: false, time: new Date() }
        ],
        filters: []
      };
      
      chatSessions.value.push(newSession);
      activeChatSession.value = newSession.id;
    }
    
    // Add an example/suggestion message to the chat
    updateChatSession(activeChatSession.value, { 
      text: "What kind of chart would you like to create? You can ask me things like:\n\n• \"Generate a bar chart showing monthly sales for 2023\"\n• \"Create a line chart of temperature trends\"\n• \"Show me a pie chart of market share by region\"\n• \"Visualize website traffic by source\"", 
      isUser: false, 
      time: new Date() 
    });
    
    // Pre-fill a sample query in the chat input
    setTimeout(() => {
      const chatBoxElement = document.querySelector('.chat-input');
      if (chatBoxElement) {
        chatBoxElement.value = "Generate a bar chart showing monthly sales data";
        chatBoxElement.focus();
      }
    }, 300);
  } else if (type === 'dashboard') {
    // Navigate to dashboard or show dashboard content
    if (activeChatSession.value !== null) {
      updateChatSession(activeChatSession.value, { 
        text: "Dashboard functionality is coming soon. You can currently work with charts and datasets.", 
        isUser: false, 
        time: new Date() 
      });
    }
  } else if (type === 'dataset') {
    // Show dataset exploration options
    if (activeChatSession.value !== null) {
      updateChatSession(activeChatSession.value, { 
        text: "What kind of dataset would you like to explore? I can help you analyze sales data, customer metrics, or time series data.", 
        isUser: false, 
        time: new Date() 
      });
    }
  }
};

// Start a new chat session when user sends first message
const startChatSession = (initialMessage) => {
  console.log("Starting new chat session with message:", initialMessage);
  
  // Create new session
  const sessionTitle = initialMessage.length > 25 
    ? initialMessage.substring(0, 25) + '...' 
    : initialMessage;
    
  const newSession = {
    id: chatSessions.value.length,
    title: sessionTitle,
    messages: [
      { text: 'Hello! How can I help you with your data analysis today?', isUser: false, time: new Date() },
      { text: initialMessage, isUser: true, time: new Date() }
    ],
    filters: [],
    isThinking: true,
    provider: selectedProvider.value // Include selected provider in the session
  };

  chatSessions.value.push(newSession);
  activeChatSession.value = chatSessions.value.length - 1;
  
  // Process the message with AI or chart handling
  const sessionId = chatSessions.value.length - 1;
  
  if (isChartRelatedQuery(initialMessage)) {
    // Handle chart-related queries with existing logic
    setTimeout(() => {
      handleChartQuery(initialMessage);
      chatSessions.value[activeChatSession.value].isThinking = false;
    }, 1000);
  } else {
    // Send to AI backend
    axios.post('/ai/chat', {
      message: initialMessage,
      sessionId: sessionId.toString(),
      provider: selectedProvider.value // Include provider
    })
    .then(response => {
      updateChatSession(activeChatSession.value, { 
        text: response.data.response, 
        isUser: false, 
        time: new Date() 
      });
    })
    .catch(error => {
      console.error('AI Service Error:', error);
      updateChatSession(activeChatSession.value, { 
        text: 'Sorry, I encountered an error processing your request.', 
        isUser: false, 
        time: new Date() 
      });
    })
    .finally(() => {
      if (activeChatSession.value !== null) {
        chatSessions.value[activeChatSession.value].isThinking = false;
      }
    });
  }
};

// Update a chat session with new messages
const updateChatSession = (sessionId, message) => {
  console.log("Updating chat session:", sessionId, message);
  
  if (sessionId === null && sessionId !== 0) {
    console.error("No session ID provided");
    return;
  }
  
  if (!chatSessions.value[sessionId]) {
    console.error("Chat session not found:", sessionId);
    return;
  }
  
  // Add the message to the session
  chatSessions.value[sessionId].messages.push(message);
  
  // Set isThinking flag based on message type
  if (message.isThinking !== undefined) {
    chatSessions.value[sessionId].isThinking = message.isThinking;
  }
  
  // If message is from user, process with AI
  if (message.isUser) {
    // Set thinking state while waiting for AI response
    chatSessions.value[sessionId].isThinking = true;
    
    // Check if it's chart-related (still use existing chart handling)
    if (isChartRelatedQuery(message.text)) {
      // Use existing chart handling logic
      setTimeout(() => {
        handleChartQuery(message.text);
        chatSessions.value[sessionId].isThinking = false;
      }, 1000);
    } else {
      // Send message to AI service with provider information
      axios.post('/ai/chat', {
        message: message.text,
        sessionId: sessionId.toString(),
        provider: chatSessions.value[sessionId].provider || selectedProvider.value // Include provider
      })
      .then(response => {
        // Add AI response to chat session
        chatSessions.value[sessionId].messages.push({
          text: response.data.response,
          isUser: false,
          time: new Date()
        });
      })
      .catch(error => {
        console.error('AI Service Error:', error);
        chatSessions.value[sessionId].messages.push({
          text: 'Sorry, I encountered an error processing your request.',
          isUser: false,
          time: new Date()
        });
      })
      .finally(() => {
        chatSessions.value[sessionId].isThinking = false;
      });
    }
  }
  
  // Check if message contains a chart (leave existing chart-related code)
  if (!message.isUser && (message.chart || message.multipleCharts)) {
    hasChartInMessages.value = true;
    // Show actions panel after a short delay
    setTimeout(() => {
      showChartActionsPanel.value = true;
      // Update layout classes for the chat box
      if (isActionsPanelCollapsed.value) {
        addChatBoxClass('chat-box-with-collapsed-charts');
        removeChatBoxClass('chat-box-with-charts');
      } else {
        addChatBoxClass('chat-box-with-charts');
        removeChatBoxClass('chat-box-with-collapsed-charts');
      }
    }, 800);
  }
};

// Switch to a specific chat session
const switchToSession = (sessionId) => {
  activeChatSession.value = sessionId;
  
  // Close any open chart panels when switching sessions
  showChartPanel.value = false;
  
  // Reset the actions panel visibility
  showChartActionsPanel.value = false;
  hasChartInMessages.value = false;
  
  // Remove the chart classes from the chat box
  removeChatBoxClass('chat-box-with-charts');
  removeChatBoxClass('chat-box-with-collapsed-charts');
  
  // Check if the new session has any chart messages
  if (chatSessions.value[sessionId].messages.some(msg => msg.chart || msg.multipleCharts)) {
    hasChartInMessages.value = true;
    setTimeout(() => {
      showChartActionsPanel.value = true;
      // Update layout classes
      if (isActionsPanelCollapsed.value) {
        addChatBoxClass('chat-box-with-collapsed-charts');
        removeChatBoxClass('chat-box-with-charts');
      } else {
        addChatBoxClass('chat-box-with-charts');
        removeChatBoxClass('chat-box-with-collapsed-charts');
      }
    }, 500);
  }
};

// Return to home view (doesn't close sessions)
const returnToHome = () => {
  // When clicking the logo, create a new chat session
  const newSession = {
    id: chatSessions.value.length,
    messages: [{ text: 'Hello! How can I help you with your data analysis today?', isUser: false, time: new Date() }],
    filters: []
  };
  
  chatSessions.value.push(newSession);
  activeChatSession.value = newSession.id;
  
  // Close any open chart panels
  showChartPanel.value = false;
};

// Create a new empty chat session and switch to it
const createNewChatSession = () => {
  // Create a new chat session with just the welcome message
  const newSession = {
    id: chatSessions.value.length,
    messages: [{ text: 'Hello! How can I help you with your data analysis today?', isUser: false, time: new Date() }],
    filters: [],
    provider: selectedProvider.value // Include selected provider in the session
  };
  
  chatSessions.value.push(newSession);
  activeChatSession.value = newSession.id;
  
  // Close any open chart panels
  showChartPanel.value = false;
};

// Add the handleThinkingState method to manage thinking animation
const handleThinkingState = (isThinking) => {
  // Update thinking state in the active session
  if (activeChatSession.value !== null && activeChatSession.value >= 0) {
    chatSessions.value[activeChatSession.value].isThinking = isThinking;
  }
  
  // Trigger the thinking animation on the background ellipse
  const ellipseElement = document.querySelector('.ellipse-gradient');
  if (ellipseElement) {
    if (isThinking) {
      ellipseElement.classList.add('thinking-animation');
    } else {
      // Use a slight delay before removing the animation class for a smoother transition
      setTimeout(() => {
        ellipseElement.classList.remove('thinking-animation');
      }, 300);
    }
  }
};

// Toggle arrow rotation
const toggleArrow = () => {
  arrowRotated.value = !arrowRotated.value;
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// Define the isChartRelatedQuery function to maintain consistency
const isChartRelatedQuery = (query) => {
  if (!query) return false;
  
  const chartKeywords = [
    'chart', 'graph', 'plot', 'visualization', 'viz', 'dashboard',
    'show me', 'display', 'create a', 'generate', 'demo', 'example',
    'bar', 'line', 'pie', 'scatter', 'area', 'histogram', 'map',
    'sales', 'trend', 'compare', 'analysis', 'metric', 'performance',
    'visual', 'report'
  ];
  
  // Use more robust detection
  query = query.toLowerCase();
  // Check for direct keyword matches
  const hasDirectMatch = chartKeywords.some(keyword => query.includes(keyword));
  // Check for phrases like "show the sales data" or "create visualization"
  const hasVisualizationContext = (
    (query.includes('show') && query.includes('data')) ||
    (query.includes('create') && query.includes('visual')) ||
    (query.includes('generate') && query.includes('report')) ||
    (query.includes('make') && query.includes('chart'))
  );
  
  return hasDirectMatch || hasVisualizationContext;
};

// Handle chart-related queries
const handleChartQuery = (query) => {
  console.log("Processing chart query in HomePage:", query);
  
  if (!activeChatSession.value && activeChatSession.value !== 0) {
    console.error("No active chat session");
    return;
  }
  
  const sessionId = activeChatSession.value;
  // Get the AI provider from the current session or use the default
  const provider = chatSessions.value[sessionId].provider || selectedProvider.value;
  
  // Check if we should call the chart API instead of using demo data
  const shouldUseApi = true; // Change this to toggle between API and demo chart
  
  if (shouldUseApi) {
    // Set the session to thinking state
    chatSessions.value[sessionId].isThinking = true;
    
    // Call the backend chart generation API with provider
    axios.post('/api/ai/chart', {
      query: query,
      sessionId: sessionId.toString(),
      provider: provider // Include selected provider
    })
    .then(response => {
      if (response.data.success && response.data.chartData) {
        const chartData = response.data.chartData;
        
        // Add the chart response to messages
        updateChatSession(sessionId, {
          text: chartData.explanation || `Here's a chart based on your query: "${query}"`,
          isUser: false,
          time: new Date(),
          chart: {
            type: chartData.chartType || 'bar',
            data: chartData.data || [],
            title: chartData.title || 'Chart Visualization',
            options: chartData.options || {}
          }
        });
      } else {
        throw new Error('Invalid chart data received from server');
      }
    })
    .catch(error => {
      console.error("Error generating chart:", error);
      
      // Fall back to static demo chart if API fails
      updateChatSession(sessionId, { 
        text: "I encountered an error generating the chart. Here's a sample chart instead:",
        isUser: false,
        time: new Date(),
        chart: {
          type: 'bar',
          data: []
        }
      });
    })
    .finally(() => {
      chatSessions.value[sessionId].isThinking = false;
    });
  } else {
    // Check if this is a special demo query about charts
    const isDemo = (query.toLowerCase().includes('chart') || 
                   query.toLowerCase().includes('graph') || 
                   query.toLowerCase().includes('plot') || 
                   query.toLowerCase().includes('show me') || 
                   query.toLowerCase().includes('demo') || 
                   query.toLowerCase().includes('example'));
    
    if (isDemo) {
      console.log("Detected chart demo/example query");
        
      // Send a simple bar chart that will trigger our static chart component
      updateChatSession(sessionId, { 
        text: "Here's a chart showing the prevalence of medical conditions:",
        isUser: false,
        time: new Date(),
        chart: {
          type: 'bar',
          // Simple data object - this won't actually be used by the static chart
          // but is needed to maintain compatibility with the existing structure
          data: []
        }
      });
      
      // Add a follow-up explanation message
      setTimeout(() => {
        updateChatSession(sessionId, { 
          text: "This chart shows the percentage of patients diagnosed with different medical conditions in our sample population. Heart disease is the most prevalent at 42%, followed closely by diabetes at 38%.",
          isUser: false,
          time: new Date()
        });
      }, 1000);
    } else {
      // Process normal chart-related queries (non-demo)
      // For simplicity, always return a bar chart that will trigger our static component
      updateChatSession(sessionId, { 
        text: `Here's a chart showing medical condition prevalence:`,
        isUser: false,
        time: new Date(),
        chart: {
          type: 'bar',
          data: []
        }
      });
      
      // Follow up with analysis in a separate message
      setTimeout(() => {
        updateChatSession(sessionId, { 
          text: `Analysis: The data shows variation in prevalence across different medical conditions, with heart disease and diabetes being the most common in our sample population. Is there a specific condition you'd like more information about?`, 
          isUser: false, 
          time: new Date() 
        });
      }, 800);
    }
  }
};

// Helper function to generate insights based on chart type and data - simplified to only handle bar charts
const getChartInsight = (chartResult) => {
  return "The data shows variation across categories, with some notable peaks and valleys. The highest value appears to be in the middle of the range.";
};

// Close chart panel
const closeChartPanel = () => {
  showChartPanel.value = false;
  
  // After closing the chart panel, show the chart actions panel again
  setTimeout(() => {
    if (hasChartInMessages.value && activeChatSession.value !== null) {
      showChartActionsPanel.value = true;
    }
  }, 300);
};

// Handle adding a new chart (when user clicks on chart type in panel)
const handleAddChart = ({ type }) => {
  // Get sample data for this chart type
  const { data, options } = chartDataService.getSampleData(type);
  
  // Add new chart to chart panel
  chartPanelData.value.charts.push({
    type,
    title: options.title,
    data,
    options,
    showCode: false
  });
};

// Chart action handlers
const handleViewCharts = () => {
  console.log('View charts clicked');
  if (activeChatSession.value !== null) {
    // Find all chart messages in the current session
    const charts = chatSessions.value[activeChatSession.value].messages
      .filter(msg => msg.chart)
      .map(msg => ({
        type: msg.chart.type,
        title: msg.chart.title,
        data: msg.chart.data,
        options: msg.chart.options,
        showCode: false
      }));
    
    if (charts.length > 0) {
      // Set up chart panel data
      chartPanelData.value = {
        title: 'Chart Collection',
        description: 'All charts generated in this conversation',
        charts: charts,
        showAddChart: true
      };
      
      // Show chart panel and hide actions panel
      showChartPanel.value = true;
      showChartActionsPanel.value = false;
    }
  }
};

const handleCreateDashboard = () => {
  console.log('Create dashboard clicked');
  if (activeChatSession.value !== null) {
    updateChatSession(activeChatSession.value, { 
      text: "Dashboard creation is coming soon. You can currently work with individual charts.", 
      isUser: false, 
      time: new Date() 
    });
    
    // Hide actions panel after action
    showChartActionsPanel.value = false;
  }
};

const handleExploreDataset = () => {
  console.log('Explore dataset clicked');
  if (activeChatSession.value !== null) {
    updateChatSession(activeChatSession.value, { 
      text: "What aspects of the dataset would you like to explore? I can help you analyze patterns, find correlations, or summarize key metrics.", 
      isUser: false, 
      time: new Date() 
    });
    
    // Hide actions panel after action
    showChartActionsPanel.value = false;
  }
};

// Method to handle chart display events from the ChatBox
const handleChartDisplayed = (chartInfo) => {
  console.log("Chart displayed event received:", chartInfo);
  
  // Check if we received specific chart info or just a boolean
  if (typeof chartInfo === 'object') {
    const { hasSingleChart, hasMultipleCharts, chartCount } = chartInfo;
    
    console.log(`Chart detection: single=${hasSingleChart}, multiple=${hasMultipleCharts}, count=${chartCount}`);
    
    // Update state based on detailed chart info
    hasChartInMessages.value = hasSingleChart || hasMultipleCharts;
    
    if (chartCount > 0) {
      // Show actions panel with appropriate delay based on chart count
      const delay = Math.min(chartCount * 200, 800);
      setTimeout(() => {
        showChartActionsPanel.value = true;
        
        // Update layout classes
        if (isActionsPanelCollapsed.value) {
          addChatBoxClass('chat-box-with-collapsed-charts');
          removeChatBoxClass('chat-box-with-charts');
        } else {
          addChatBoxClass('chat-box-with-charts');
          removeChatBoxClass('chat-box-with-collapsed-charts');
        }
      }, delay);
    }
  } else {
    // Fallback to simple boolean logic if we just get a boolean
    console.log("Chart displayed event (boolean):", chartInfo);
    hasChartInMessages.value = !!chartInfo;
    
    if (chartInfo) {
      // Show actions panel after a short delay
      setTimeout(() => {
        showChartActionsPanel.value = true;
        
        // Update layout classes
        if (isActionsPanelCollapsed.value) {
          addChatBoxClass('chat-box-with-collapsed-charts');
          removeChatBoxClass('chat-box-with-charts');
        } else {
          addChatBoxClass('chat-box-with-charts');
          removeChatBoxClass('chat-box-with-collapsed-charts');
        }
      }, 500);
    } else {
      showChartActionsPanel.value = false;
      removeChatBoxClass('chat-box-with-charts');
      removeChatBoxClass('chat-box-with-collapsed-charts');
    }
  }
};

// Handle collapse state change from actions panel
const handleChartPanelCollapse = (collapsed) => {
  isActionsPanelCollapsed.value = collapsed;
  
  // Update chat box classes based on current state
  if (showChartActionsPanel.value) {
    if (collapsed) {
      addChatBoxClass('chat-box-with-collapsed-charts');
      removeChatBoxClass('chat-box-with-charts');
    } else {
      addChatBoxClass('chat-box-with-charts');
      removeChatBoxClass('chat-box-with-collapsed-charts');
    }
  }
};

// Helper methods to add/remove classes from chat box
const addChatBoxClass = (className) => {
  const chatBox = document.querySelector('.chat-box');
  if (chatBox && !chatBox.classList.contains(className)) {
    chatBox.classList.add(className);
  }
};

const removeChatBoxClass = (className) => {
  const chatBox = document.querySelector('.chat-box');
  if (chatBox && chatBox.classList.contains(className)) {
    chatBox.classList.remove(className);
  }
};

// Watch for active session state changes
watch(activeChatSession, (newSessionId) => {
  // Check if current session has any chart messages
  if (newSessionId !== null) {
    const hasCharts = chatSessions.value[newSessionId].messages.some(msg => msg.chart);
    hasChartInMessages.value = hasCharts;
    
    // Update chart actions panel visibility
    showChartActionsPanel.value = hasCharts;
    
    // Update layout classes for the chat box
    if (hasCharts) {
      if (isActionsPanelCollapsed.value) {
        addChatBoxClass('chat-box-with-collapsed-charts');
        removeChatBoxClass('chat-box-with-charts');
      } else {
        addChatBoxClass('chat-box-with-charts');
        removeChatBoxClass('chat-box-with-collapsed-charts');
      }
    } else {
      removeChatBoxClass('chat-box-with-charts');
      removeChatBoxClass('chat-box-with-collapsed-charts');
    }
  } else {
    hasChartInMessages.value = false;
    showChartActionsPanel.value = false;
    removeChatBoxClass('chat-box-with-charts');
    removeChatBoxClass('chat-box-with-collapsed-charts');
  }
});

// Watch for changes to the chat sessions' messages that might affect chart visibility
watch(() => chatSessions.value, (newSessions, oldSessions) => {
  if (activeChatSession.value !== null) {
    const activeSession = chatSessions.value[activeChatSession.value];
    if (activeSession && activeSession.messages) {
      const hasCharts = activeSession.messages.some(msg => msg.chart);
      
      // Update our state to match if charts exist in the session
      if (hasCharts !== hasChartInMessages.value) {
        hasChartInMessages.value = hasCharts;
        showChartActionsPanel.value = hasCharts;
        
        // Update layout classes for the chat box
        if (hasCharts) {
          if (isActionsPanelCollapsed.value) {
            addChatBoxClass('chat-box-with-collapsed-charts');
            removeChatBoxClass('chat-box-with-charts');
          } else {
            addChatBoxClass('chat-box-with-charts');
            removeChatBoxClass('chat-box-with-collapsed-charts');
          }
        } else {
          removeChatBoxClass('chat-box-with-charts');
          removeChatBoxClass('chat-box-with-collapsed-charts');
        }
      }
    }
  }
}, { deep: true });

// Handle AI provider change event from ChatBox
const handleProviderChange = (provider) => {
  console.log('AI provider changed:', provider);
  selectedProvider.value = provider;
  
  // Store the selection in localStorage for persistence
  localStorage.setItem('preferredAIProvider', provider);
  
  // Update the provider in all existing sessions for future requests
  chatSessions.value.forEach(session => {
    session.provider = provider;
  });
};

onMounted(() => {
  // Load the preferred AI provider from localStorage if available
  const savedProvider = localStorage.getItem('preferredAIProvider');
  if (savedProvider) {
    selectedProvider.value = savedProvider;
  }
  
  // Load existing chat sessions or create an initial one
  // Check if we have any saved sessions
  // ... rest of existing onMounted code ...
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

.home-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
  background-color: #FFFFFF;
  transition: all 0.3s ease;
  font-family: 'DM Sans', sans-serif;
}

/* Home page in chat mode has sidebar padding */
.home-page.chat-mode {
  padding-left: 240px; /* Fixed sidebar width */
  padding-top: 0; 
  transition: padding-left 0.3s ease;
}

/* Home page with sidebar needs padding even on home screen */
.home-page.has-sessions {
  padding-left: 240px; /* Fixed sidebar width */
  padding-top: 0;
  transition: padding-left 0.3s ease;
}

/* Adjust padding when sidebar is collapsed */
.home-page.has-sessions.sidebar-collapsed {
  padding-left: 60px;
}

.home-page.chat-mode.sidebar-collapsed {
  padding-left: 60px;
}

/* Background elements */
.background-group {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0.1;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #F7F7F7;
}

.ellipse-gradient {
  position: fixed;
  bottom: -50%; /* Position it so half is below the viewport (cropped) */
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2CE4CF, #0076B4);
  filter: blur(150px);
  opacity: 0.7;
  z-index: 1;
  transition: all 0.5s ease;
}

/* Advanced thinking animation for the gradient */
.ellipse-gradient.thinking-animation {
  animation: thinking-pulse 10s infinite alternate ease-in-out, 
             thinking-morph 12s infinite alternate ease-in-out,
             thinking-rotate 18s linear infinite;
  background: linear-gradient(135deg, 
    #2CE4CF, 
    #43c0ff, 
    #257BDF, 
    #43c0ff, 
    #2CE4CF, 
    #6A5ACD, 
    #9370DB
  );
  background-size: 700% 700%;
  filter: blur(100px);
  opacity: 0.9;
  width: 800px;
  height: 800px;
  z-index: 1;
}

@keyframes thinking-pulse {
  0% {
    transform: translateX(-50%) scale(1);
  }
  40% {
    transform: translateX(-45%) scale(1.3);
  }
  60% {
    transform: translateX(-55%) scale(1.25);
  }
  100% {
    transform: translateX(-50%) scale(1.1);
  }
}

@keyframes thinking-morph {
  0% {
    border-radius: 50%;
  }
  20% {
    border-radius: 70% 30% 65% 35% / 35% 65% 35% 65%;
  }
  40% {
    border-radius: 35% 65% 30% 70% / 65% 35% 65% 35%;
  }
  60% {
    border-radius: 75% 25% 40% 60% / 30% 70% 70% 30%;
  }
  80% {
    border-radius: 30% 70% 65% 35% / 60% 40% 35% 65%;
  }
  100% {
    border-radius: 50% 50% 35% 65% / 40% 60% 70% 30%;
  }
}

@keyframes thinking-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 30;
  height: 56px;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: transparent; /* Removed white background */
  backdrop-filter: blur(5px);
}

/* Logo */
.evyd-logo {
  position: relative;
  margin-top: 14px;
  height: 24px;
  display: flex;
  align-items: center;
  margin-left: 20px; /* Simple padding from edge instead of accounting for sidebar */
  transition: margin-left 0.3s ease;
  padding-left: 0;
}

.evyd-logo img {
  height: 100%;
  width: auto;
}

.evyd-logo.clickable {
  cursor: pointer;
}

/* Header line */
.header-line {
  position: relative;
  width: 100%;
  height: 1px;
  margin-top: auto;
  background: linear-gradient(60deg, rgba(232,232,232,1) 15%, rgba(199, 199, 199, 0.5) 100%);
}

/* Welcome message */
.welcome-message {
  margin-top: 81px; /* 56px header + 25px original margin */
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 32px;
  color: #232323;
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.2em;
  z-index: 2;
  width: 100% !important; /* Override the width calculation for this element */
  margin-left: 0 !important; /* Override the margin for this element */
}

/* Action cards */
.action-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 1400px;
  z-index: 5; /* Adjust z-index to ensure proper layering */
  padding: 0 30px;
  
  /* Center vertically in the viewport */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0; /* Remove top/bottom margins since we're using absolute positioning */
}

.action-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 400px;
  height: 320px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  flex: 0 0 auto;
}

.action-card.hovered {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
}

.chart-preview {
  height: 220px;
  width: 100%;
  background-color: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chart-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  max-width: 100%;
  display: block;
}

.action-card:hover .chart-image {
  transform: scale(1.05);
}

.card-content {
  padding: 15px;
  background-color: #FFFFFF;
}

.card-content h3 {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 18px;
  color: #232323;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.card-content p {
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #676767;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

@media (max-width: 1400px) {
  .action-cards {
    max-width: 1200px;
    gap: 30px;
  }
  
  .action-card {
    width: 380px;
    height: 310px;
  }
  
  .chart-preview {
    height: 210px;
  }
}

@media (max-width: 1200px) {
  .action-cards {
    max-width: 900px;
    gap: 25px;
  }
  
  .action-card {
    width: 360px;
    height: 300px;
  }
  
  .chart-preview {
    height: 200px;
  }
  
  .ellipse-gradient {
    right: 20%;
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 768px) {
  .home-page.chat-mode,
  .home-page.has-sessions,
  .home-page.sidebar-collapsed.chat-mode,
  .home-page.sidebar-collapsed.has-sessions {
    padding-left: 0;
  }
  
  /* Reset sidebar offset positioning on mobile */
  .home-page.has-sessions:not(.sidebar-collapsed) .chat-container.chat-mode,
  .home-page.has-sessions.sidebar-collapsed .chat-container.chat-mode {
    left: 50%;
  }
  
  .evyd-logo {
    margin-left: 20px !important;
  }
  
  .welcome-message {
    font-size: 28px;
    margin-top: 100px;
    padding: 0 20px;
  }
  
  .action-cards {
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    gap: 30px;
  }
  
  .action-card {
    width: 100%;
    max-width: 500px;
    height: 330px;
  }
  
  .chart-preview {
    height: 230px;
  }
  
  .ellipse-gradient {
    right: 10%;
    width: 300px;
    height: 300px;
  }
  
  /* Mobile chat container styles to match ChatBox.vue */
  .home-page .chat-container.chat-mode {
    width: calc(100% - 40px);
    max-width: 600px;
    height: calc(100vh - 130px);
    top: 110px;
  }
  
  /* Hide sidebar on mobile */
  .sidebar {
    display: none;
  }
  
  /* Reset welcome message margin on mobile */
  .home-page.sidebar-collapsed .welcome-message {
    width: 100% !important;
    margin-left: 0 !important;
  }
}

@media (max-width: 480px) {
  .header {
    height: 48px;
  }
  
  .header-line {
    margin-top: 40px; /* Adjusted for smaller header */
  }
  
  .evyd-logo {
    margin-top: 12px;
    height: 20px;
  }
  
  .welcome-message {
    font-size: 24px;
    margin-top: 70px; /* Adjusted for smaller header */
  }
  
  .action-card {
    height: 300px;
    max-width: 100%;
  }
  
  .chart-preview {
    height: 200px;
  }
  
  .card-content h3 {
    font-size: 16px;
  }
  
  .card-content p {
    font-size: 13px;
  }
  
  .ellipse-gradient {
    top: 30%;
    right: 0;
    width: 250px;
    height: 250px;
  }
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 56px; /* Updated to match new header height */
  height: calc(100vh - 56px); /* Updated to match new header height */
  width: 240px;
  background-color: rgba(249, 249, 249, 0.6);
  backdrop-filter: blur(10px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-shadow: none;
  transition: all 0.3s ease;
  font-family: 'DM Sans', sans-serif;
  border-right: none;
}

/* Add sidebar right border with the same gradient style as header-line */
.sidebar::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(232,232,232,1) 5%, rgba(85,85,85,0) 70%);
  pointer-events: none;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 17px;
  width: 100%;
}

.sidebar-title {
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
}

/* Arrow icon styling */
.sidebar-arrow-icon {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.sidebar-arrow-icon:hover {
  transform: scale(1.1);
}

.sidebar-arrow-icon img {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  transform: rotate(-180deg); /* Initial rotation for expanded view */
}

.sidebar-arrow-icon img.rotated {
  transform: rotate(0deg); /* Rotated state for "collapsed" view */
}

.sidebar-arrow-icon:hover img {
  opacity: 0.8;
}

.chat-sessions-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 190px); /* Adjusted for smaller header height */
}

.chat-session-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-session-card:hover {
  background-color: rgba(44, 228, 207, 0.1);
}

.chat-session-card.active {
  background: radial-gradient(ellipse 91.15% 38.76% at 50.00% 114.68%, #BDEEE8 0%, white 100%);
  box-shadow: 0px 0px 4.4px rgba(11.24, 134.94, 128.75, 0.25) inset;
}

.chat-session-content {
  color: #777777;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

/* New chat button */
.new-chat {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  margin-top: auto;
  background-color: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-chat:hover {
  background-color: rgba(44, 228, 207, 0.1);
}

.icon-label {
  font-size: 14px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.nav-icon-img {
  width: 18px;
  height: 18px;
}

/* Welcome message modifications */
.welcome-message.chat-mode {
  font-size: 24px;
  margin-top: 26px; /* Adjusted to create better spacing with sidebar */
  margin-bottom: 10px;
  color: #257BDF;
}

/* Fix chat container positioning in all states */
.home-page .chat-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
}

.home-page.has-sessions .chat-container:not(.chat-mode) {
  left: 50%;
  transform: translateX(-50%);
}

/* Maximize chat container size in chat mode and center it */
.home-page .chat-container.chat-mode {
  position: fixed;
  max-width: 1200px; /* Base max width */
  width: calc(100% - 48px); /* 24px padding on each side */
  height: calc(100vh - 150px);
  top: 120px;
  bottom: auto;
  left: 50%; /* Center it */
  transform: translateX(-50%); /* True centering */
  transition: all 0.3s ease;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  border: none;
  z-index: 25; /* Ensure it's above other content but below sidebar */
  margin: 0 auto; /* Center the container */
}

/* Adjust for expanded sidebar */
.home-page.has-sessions:not(.sidebar-collapsed) .chat-container.chat-mode {
  left: calc(50% + 120px); /* 50% + half of sidebar width (240px÷2) */
}

/* Adjust for collapsed sidebar */
.home-page.has-sessions.sidebar-collapsed .chat-container.chat-mode {
  left: calc(50% + 30px); /* 50% + half of collapsed sidebar width (60px÷2) */
}

/* Adjust welcome message in collapsed state */
.home-page.sidebar-collapsed .welcome-message {
  width: calc(100% - 60px) !important;
  margin-left: 60px !important;
}

/* Welcome message in chat mode still centered */
.home-page.sidebar-collapsed .welcome-message.chat-mode {
  margin-left: 0 !important;
  width: 100% !important;
}

/* Add responsive breakpoints for HomePage that match ChatBox.vue */
@media (min-width: 1441px) {
  .home-page .chat-container.chat-mode {
    max-width: 1400px;
    width: calc(100% - 64px); /* 32px padding on each side */
  }
}

@media (min-width: 1200px) and (max-width: 1440px) {
  .home-page .chat-container.chat-mode {
    max-width: 1000px;
    width: calc(100% - 48px); /* 24px padding on each side */
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .home-page .chat-container.chat-mode {
    max-width: 900px;
    width: calc(100% - 40px); /* 20px padding on each side */
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .home-page .chat-container.chat-mode {
    max-width: 700px;
    width: calc(100% - 32px); /* 16px padding on each side */
    height: calc(100vh - 140px);
  }
}

@media (max-width: 767px) {
  /* Mobile chat container styles */
  .home-page .chat-container.chat-mode {
    width: calc(100% - 24px); /* 12px padding on each side */
    max-width: 100%; /* Take up full width on mobile */
    height: calc(100vh - 130px);
    top: 110px;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .home-page .chat-container.chat-mode {
    width: calc(100% - 16px); /* 8px padding on each side */
    height: calc(100vh - 120px);
    top: 100px;
  }
}

/* Sidebar collapsed styles */
.sidebar.collapsed {
  width: 60px;
  padding: 16px 8px;
  overflow: hidden;
}

.sidebar.collapsed .sidebar-title {
  display: none;
}

.sidebar.collapsed .chat-session-content {
  display: none;
}

.sidebar.collapsed .chat-session-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
}

.sidebar.collapsed .chat-session-card::after {
  content: attr(data-number);
  color: #777777;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}

.sidebar.collapsed .new-chat .icon-label {
  display: none;
}

.sidebar.collapsed .new-chat {
  justify-content: center;
  padding: 12px 0;
}

/* Single chart container */
.single-chart-container {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 900px;
  z-index: 25;
}

/* Home page has sidebar and chart panels adjustments */
.home-page.has-sessions:not(.sidebar-collapsed) .single-chart-container {
  left: calc(50% + 120px);
}

.home-page.has-sessions.sidebar-collapsed .single-chart-container {
  left: calc(50% + 30px);
}

/* Responsive chart container adjustments */
@media (max-width: 768px) {
  .single-chart-container {
    width: calc(100% - 32px);
    top: 100px;
  }
  
  .home-page.has-sessions:not(.sidebar-collapsed) .single-chart-container,
  .home-page.has-sessions.sidebar-collapsed .single-chart-container {
    left: 50%;
  }
}

@media (max-width: 480px) {
  .single-chart-container {
    width: calc(100% - 24px);
    top: 80px;
  }
}

/* Adjust for actions panel */
.home-page.actions-panel-visible:not(.actions-panel-collapsed) .chat-container.chat-mode {
  width: calc(100% - 248px); /* Reduce width to make room for panel (220px panel + 28px margin) */
  transition: all 0.3s ease;
}

.home-page.actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode {
  width: calc(100% - 88px); /* Reduce width for collapsed panel (60px + 28px margin) */
  transition: all 0.3s ease;
}

/* Adjust when both sidebar and actions panel are visible */
.home-page.has-sessions:not(.sidebar-collapsed).actions-panel-visible:not(.actions-panel-collapsed) .chat-container.chat-mode {
  left: calc(50% + 120px); /* 50% + half of sidebar width (240px÷2) */
  width: calc(100% - 488px); /* Reduce width for both sidebar and panel */
}

.home-page.has-sessions.sidebar-collapsed.actions-panel-visible:not(.actions-panel-collapsed) .chat-container.chat-mode {
  left: calc(50% + 30px); /* 50% + half of collapsed sidebar width (60px÷2) */
  width: calc(100% - 308px); /* Reduce width for collapsed sidebar and panel */
}

/* Adjust for collapsed actions panel */
.home-page.has-sessions:not(.sidebar-collapsed).actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode {
  left: calc(50% + 120px); /* 50% + half of sidebar width (240px÷2) */
  width: calc(100% - 328px); /* Reduce width for sidebar and collapsed panel */
}

.home-page.has-sessions.sidebar-collapsed.actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode {
  left: calc(50% + 30px); /* 50% + half of collapsed sidebar width (60px÷2) */
  width: calc(100% - 148px); /* Reduce width for collapsed sidebar and collapsed panel */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  /* Reset all special positioning on mobile */
  .home-page.actions-panel-visible .chat-container.chat-mode,
  .home-page.actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode,
  .home-page.has-sessions:not(.sidebar-collapsed).actions-panel-visible .chat-container.chat-mode,
  .home-page.has-sessions.sidebar-collapsed.actions-panel-visible .chat-container.chat-mode,
  .home-page.has-sessions:not(.sidebar-collapsed).actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode,
  .home-page.has-sessions.sidebar-collapsed.actions-panel-visible.actions-panel-collapsed .chat-container.chat-mode {
    left: 50%;
    width: calc(100% - 24px);
    transform: translateX(-50%);
  }
}

.chat-box-with-charts {
  width: calc(100% - 240px) !important; /* Full width minus chart panel width */
  transition: width 0.3s ease !important;
}

.chat-box-with-collapsed-charts {
  width: calc(100% - 45px) !important; /* Full width minus collapsed chart panel width */
}

@media (max-width: 767px) {
  .chat-box-with-charts {
    width: calc(100% - 180px) !important;
  }
  
  .chat-box-with-collapsed-charts {
    width: calc(100% - 45px) !important;
  }
}
</style> 