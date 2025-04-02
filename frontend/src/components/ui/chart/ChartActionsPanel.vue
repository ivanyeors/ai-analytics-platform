<template>
  <div class="chart-actions-panel" :class="{ 'visible': visible, 'collapsed': collapsed, 'detailed-view': detailedView, 'expanded-view': expandedView }">
    <div class="panel-border"></div>
    <div class="panel-content">
      <!-- Main Panel View -->
      <div v-if="!detailedView && !expandedView">
        <div class="panel-header-container">
          <div class="panel-toggle" @click="toggleCollapse">
            <img 
              :src="arrowForward" 
              alt="Toggle panel" 
              class="panel-toggle-icon" 
              :class="{ 'flipped': !collapsed }"
            />
          </div>
          <div class="panel-header" v-if="!collapsed">
            <div class="panel-title">Chart Actions</div>
          </div>
        </div>
        <div class="panel-buttons">
          <div class="action-button" @click="showChartsView">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.33398 9H4.33398V20H8.33398V9Z" fill="#313438"/>
                <path d="M20.334 13H16.334V20H20.334V13Z" fill="#313438"/>
                <path d="M14.334 4H10.334V20H14.334V4Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">View Charts</div>
          </div>
          
          <div class="action-button" @click="$emit('create-dashboard')">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.334 5V7H15.334V5H19.334ZM9.33398 5V11H5.33398V5H9.33398ZM19.334 13V19H15.334V13H19.334ZM9.33398 17V19H5.33398V17H9.33398ZM21.334 3H13.334V9H21.334V3ZM11.334 3H3.33398V13H11.334V3ZM21.334 11H13.334V21H21.334V11ZM11.334 15H3.33398V21H11.334V15Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">Create Dashboard</div>
          </div>
          
          <div class="action-button" @click="$emit('explore-dataset')">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 13H7.33398V17H11.334V13Z" fill="#313438"/>
                <path d="M17.334 13H13.334V17H17.334V13Z" fill="#313438"/>
                <path d="M19.334 3H5.33398C4.23398 3 3.33398 3.9 3.33398 5V19C3.33398 20.1 4.23398 21 5.33398 21H19.334C20.434 21 21.334 20.1 21.334 19V5C21.334 3.9 20.434 3 19.334 3ZM19.334 19H5.33398V5H19.334V19Z" fill="#313438"/>
                <path d="M11.334 7H7.33398V11H11.334V7Z" fill="#313438"/>
                <path d="M17.334 7H13.334V11H17.334V7Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">Explore Dataset</div>
          </div>
        </div>
      </div>
      
      <!-- Detailed Charts View -->
      <div v-else-if="detailedView && !expandedView" class="detailed-charts-container">
        <!-- Header with back button and title -->
        <div class="detailed-view-header">
          <div class="header-left">
            <div class="back-button" @click="closeDetailedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#7E8794"/>
              </svg>
            </div>
            <div class="detailed-view-title">View Charts</div>
          </div>
          <div class="close-button" @click="closeDetailedView">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#313438"/>
            </svg>
          </div>
        </div>
        
        <!-- Chart collection panel -->
        <div class="chart-panel">
          <div class="chart-examples-container">
            <div v-if="generatedAnswer">
              <!-- Dynamic Chart Rendering -->
              <div class="chart-example bar-chart">
                <div class="chart-box">
                  <component 
                    :is="generatedAnswer.chartComponent" 
                    v-if="generatedAnswer.chartComponent" 
                    :chart-data="generatedAnswer.chartData"
                    :options="generatedAnswer.chartOptions"
                  />
                  <div v-else class="no-chart-message">
                    <p>No chart data available</p>
                  </div>
                </div>
              </div>
              
              <!-- Dataset Display -->
              <div class="chart-example data-table">
                <div class="chart-title">{{ generatedAnswer.title || 'Data Analysis Results' }}</div>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th v-for="(header, index) in generatedAnswer.headers" :key="index">{{ header }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in generatedAnswer.data" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex" :class="getCellClass(cell, cellIndex)">
                          {{ formatCellValue(cell) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else>
              <!-- Placeholder for when no answer is selected -->
              <div class="empty-chart-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#DADEE3"/>
                </svg>
                <p>No Generated Answer Selected</p>
                <span>Select an AI-generated answer to view the analytics visualization</span>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="chart-actions">
              <button class="action-btn secondary" @click="showExpandedView" data-v-19561bbe>
                <div class="btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6z" fill="#313438"/>
                    <path d="M3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6z" fill="#313438"/>
                    <path d="M9 21l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6z" fill="#313438"/>
                    <path d="M21 15l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z" fill="#313438"/>
                  </svg>
                </div>
                <span>Full Screen</span>
              </button>
              <button class="action-btn secondary" data-v-19561bbe>
                <div class="btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="#313438"/>
                  </svg>
                </div>
                <span>View Code</span>
              </button>
              <button class="action-btn secondary">
                <div class="btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#313438"/>
                  </svg>
                </div>
                <span>Dashboard</span>
              </button>
              <button class="action-btn secondary">
                <div class="btn-icon">
                  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 17.2773L21.5 12.2773L16.5 7.27734L15.09 8.68734L17.67 11.2773H8.5V13.2773H17.67L15.09 15.8673L16.5 17.2773Z" fill="#313438"/>
                    <path d="M18.5 19.2773H4.5V5.27734H18.5V7.27734H20.5V5.27734C20.5 4.17734 19.61 3.27734 18.5 3.27734H4.5C3.4 3.27734 2.5 4.17734 2.5 5.27734V19.2773C2.5 20.3773 3.4 21.2773 4.5 21.2773H18.5C19.61 21.2773 20.5 20.3773 20.5 19.2773V17.2773H18.5V19.2773Z" fill="#313438"/>
                  </svg>
                </div>
                <span>Export</span>
              </button>
              <button class="action-btn primary">
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Expanded View -->
      <div v-else-if="expandedView" class="expanded-view-container">
        <!-- Header with back and close buttons -->
        <div class="expanded-view-header">
          <div class="header-left">
            <div class="back-button" @click="closeExpandedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#7E8794"/>
              </svg>
            </div>
            <div class="expanded-view-title">{{ generatedAnswer?.title || 'AI Generated Answer' }}</div>
            <div class="header-badge" v-if="generatedAnswer?.category">
              <span>{{ generatedAnswer.category }}</span>
            </div>
          </div>
          <div class="header-actions">
            <div class="search-container">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9167 11.6667H12.2583L12.025 11.4417C12.8417 10.4917 13.3333 9.25833 13.3333 7.91667C13.3333 4.925 10.9083 2.5 7.91667 2.5C4.925 2.5 2.5 4.925 2.5 7.91667C2.5 10.9083 4.925 13.3333 7.91667 13.3333C9.25833 13.3333 10.4917 12.8417 11.4417 12.025L11.6667 12.2583V12.9167L15.8333 17.075L17.075 15.8333L12.9167 11.6667ZM7.91667 11.6667C5.84167 11.6667 4.16667 9.99167 4.16667 7.91667C4.16667 5.84167 5.84167 4.16667 7.91667 4.16667C9.99167 4.16667 11.6667 5.84167 11.6667 7.91667C11.6667 9.99167 9.99167 11.6667 7.91667 11.6667Z" fill="#7E8794"/>
                </svg>
              </div>
              <input type="text" placeholder="Search analytics data..." class="search-input" />
            </div>
            <div class="action-icons">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#5C88DA"/>
                </svg>
              </div>
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#5C88DA"/>
                </svg>
              </div>
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L6.5 11H17.5L12 2Z" fill="#41B883"/>
                  <path d="M17.5 22L12 13L6.5 22H17.5Z" fill="#41B883"/>
                </svg>
              </div>
            </div>
            <div class="close-button" @click="closeExpandedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#313438"/>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Main expanded content -->
        <div class="expanded-content">
          <div v-if="generatedAnswer" class="chart-container">
            <!-- Main visualization -->
            <div class="main-chart-area">
              <component 
                :is="generatedAnswer.chartComponent" 
                v-if="generatedAnswer.chartComponent" 
                :chart-data="generatedAnswer.chartData"
                :options="generatedAnswer.chartOptions"
                :style="{ height: '400px', width: '100%' }"
              />
              <div v-else class="no-chart-message">
                <p>No chart data available for this analysis</p>
              </div>
            </div>
            
            <div class="chart-title">{{ generatedAnswer.title || 'Analysis Results' }}</div>
            
            <!-- Chart insights -->
            <div class="chart-insights" v-if="generatedAnswer.insights && generatedAnswer.insights.length > 0">
              <div class="insight-item" v-for="(insight, index) in generatedAnswer.insights" :key="index">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-value">{{ insight.value }}</div>
                <div class="insight-trend" :class="insight.trend">{{ insight.description }}</div>
              </div>
            </div>
          </div>
          
          <!-- Data table section -->
          <div class="data-section" v-if="generatedAnswer">
            <div class="section-header">
              <div class="section-title">{{ generatedAnswer.datasetTitle || 'Source Dataset' }}</div>
            </div>
            <div class="data-table-container">
              <table class="expanded-data-table">
                <thead>
                  <tr>
                    <th v-for="(header, index) in generatedAnswer.headers" :key="index">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in generatedAnswer.data" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex" :class="getCellClass(cell, cellIndex)">
                      {{ formatCellValue(cell) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="empty-data-message">
            <p>No data available for this analysis</p>
          </div>
          
          <!-- Footer actions -->
          <div class="expanded-footer">
            <button class="action-btn secondary" data-v-19561bbe>
              <div class="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="#313438"/>
                </svg>
              </div>
              <span>View Code</span>
            </button>
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#313438"/>
                </svg>
              </div>
              <span>Compare</span>
            </button>
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#313438"/>
                </svg>
              </div>
              <span>Add to Dashboard</span>
            </button>
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 17.2773L21.5 12.2773L16.5 7.27734L15.09 8.68734L17.67 11.2773H8.5V13.2773H17.67L15.09 15.8673L16.5 17.2773Z" fill="#313438"/>
                  <path d="M18.5 19.2773H4.5V5.27734H18.5V7.27734H20.5V5.27734C20.5 4.17734 19.61 3.27734 18.5 3.27734H4.5C3.4 3.27734 2.5 4.17734 2.5 5.27734V19.2773C2.5 20.3773 3.4 21.2773 4.5 21.2773H18.5C19.61 21.2773 20.5 20.3773 20.5 19.2773V17.2773H18.5V19.2773Z" fill="#313438"/>
                </svg>
              </div>
              <span>Export Report</span>
            </button>
            <button class="action-btn primary">
              <span>Share Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

// Props 
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  generatedAnswer: {
    type: Object,
    default: null
  }
});

// State
const collapsed = ref(false);
const detailedView = ref(false);
const expandedView = ref(false);
const arrowForward = new URL('../assets/icons/arrow_forward.svg', import.meta.url).href;

// Emits
const emit = defineEmits(['create-dashboard', 'explore-dataset', 'collapse-change', 'show-code', 'full-screen']);

// Define the beforeunload handler
const saveStateBeforeUnload = () => {
  saveCollapsedState();
  saveDetailedViewState();
  saveExpandedViewState();
};

// Format cell values for display
const formatCellValue = (value) => {
  if (typeof value === 'number') {
    // Format numbers with commas and 2 decimal places if needed
    return value % 1 === 0 
      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
      : value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (typeof value === 'string' && value.startsWith('+')) {
    return value; // Already formatted positive change
  } else if (typeof value === 'string' && value.startsWith('-')) {
    return value; // Already formatted negative change
  }
  return value;
};

// Determine CSS class for table cells
const getCellClass = (value, index) => {
  if (typeof value === 'string') {
    if (value.startsWith('+')) return 'positive';
    if (value.startsWith('-')) return 'negative';
  }
  return '';
};

// Load saved state from localStorage on component mount
onMounted(() => {
  try {
    // Load collapsed state
    const savedCollapsed = localStorage.getItem('chartActionsPanelCollapsed');
    if (savedCollapsed !== null) {
      collapsed.value = JSON.parse(savedCollapsed);
      // Emit the initial state to parent
      emit('collapse-change', collapsed.value);
    }
    
    // Load detailed view state
    const savedDetailedView = localStorage.getItem('chartActionsPanelDetailedView');
    if (savedDetailedView !== null) {
      const shouldShowDetailed = JSON.parse(savedDetailedView);
      
      // Only restore detailed view if the panel is visible
      if (shouldShowDetailed && props.visible) {
        // Delay to ensure component is mounted
        setTimeout(() => {
          detailedView.value = true;
          showDetailedViewUI();
        }, 50);
      }
    }
    
    // Load expanded view state
    const savedExpandedView = localStorage.getItem('chartActionsPanelExpandedView');
    if (savedExpandedView !== null) {
      const shouldShowExpanded = JSON.parse(savedExpandedView);
      
      // Only restore expanded view if the panel is visible
      if (shouldShowExpanded && props.visible) {
        // Delay to ensure component is mounted
        setTimeout(() => {
          expandedView.value = true;
          showExpandedViewUI();
        }, 50);
      }
    }
    
    // Add beforeunload event listener to save state before page navigation
    window.addEventListener('beforeunload', saveStateBeforeUnload);
  } catch (error) {
    console.error('Error loading ChartActionsPanel state:', error);
  }
});

// Clean up event listeners when component is destroyed
onBeforeUnmount(() => {
  // Save state before unmounting
  saveCollapsedState();
  saveDetailedViewState();
  saveExpandedViewState();
  
  // Remove event listener
  window.removeEventListener('beforeunload', saveStateBeforeUnload);
});

// Save collapsed state to localStorage whenever it changes
const saveCollapsedState = () => {
  try {
    localStorage.setItem('chartActionsPanelCollapsed', JSON.stringify(collapsed.value));
  } catch (error) {
    console.error('Error saving ChartActionsPanel state:', error);
  }
};

// Save detailed view state to localStorage
const saveDetailedViewState = () => {
  try {
    localStorage.setItem('chartActionsPanelDetailedView', JSON.stringify(detailedView.value));
  } catch (error) {
    console.error('Error saving detailed view state:', error);
  }
};

// Save expanded view state to localStorage
const saveExpandedViewState = () => {
  try {
    localStorage.setItem('chartActionsPanelExpandedView', JSON.stringify(expandedView.value));
  } catch (error) {
    console.error('Error saving expanded view state:', error);
  }
};

// Helper function to show detailed view UI
const showDetailedViewUI = () => {
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.detailed-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

// Helper function to show expanded view UI
const showExpandedViewUI = () => {
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.expanded-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

// Methods
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  saveCollapsedState();
  emit('collapse-change', collapsed.value);
};

const showChartsView = () => {
  // First, make sure we're not collapsed
  collapsed.value = false;
  saveCollapsedState();
  
  // No longer emitting event for parent component
  // Instead, we handle the detailed view here
  
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Set detailed view immediately to avoid transition issues
  detailedView.value = true;
  saveDetailedViewState(); // Save detailed view state
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.detailed-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

const closeDetailedView = () => {
  // First remove the visible class to trigger proper transitions
  const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
  if (panelElement) {
    panelElement.classList.remove('visible');
    
    // Reset any inline styles that might interfere with transitions
    panelElement.style.transform = 'translateX(100%)';
  }
  
  // Delay setting detailedView to false to allow animation to complete
  setTimeout(() => {
    detailedView.value = false;
    saveDetailedViewState(); // Save detailed view state
    
    // Restore body overflow
    document.body.style.overflow = '';
    
    // Reset any inline styles on the panel
    const basicPanel = document.querySelector('.chart-actions-panel');
    if (basicPanel) {
      basicPanel.style.zIndex = '';
      basicPanel.style.transform = '';
    }
  }, 300); // Wait for transition to complete
};

const showExpandedView = () => {
  // Emit the full-screen event
  emit('full-screen', true);
  
  // First ensure we're not collapsed and exit detailed view
  collapsed.value = false;
  detailedView.value = false;
  saveCollapsedState();
  saveDetailedViewState();
  
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Set expanded view immediately to avoid transition issues
  expandedView.value = true;
  saveExpandedViewState(); // Save expanded view state
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.expanded-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

const closeExpandedView = () => {
  // Emit the full-screen event
  emit('full-screen', false);
  
  // First remove the visible class to trigger proper transitions
  const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
  if (panelElement) {
    panelElement.classList.remove('visible');
    
    // Reset any inline styles that might interfere with transitions
    panelElement.style.transform = 'translateX(100%)';
  }
  
  // Delay setting expandedView to false to allow animation to complete
  setTimeout(() => {
    expandedView.value = false;
    saveExpandedViewState(); // Save expanded view state
    
    // Return to detailed view
    detailedView.value = true;
    saveDetailedViewState();
    showDetailedViewUI();
    
    // Restore body overflow
    document.body.style.overflow = '';
    
    // Reset any inline styles on the panel
    const basicPanel = document.querySelector('.chart-actions-panel');
    if (basicPanel) {
      basicPanel.style.zIndex = '';
      basicPanel.style.transform = '';
    }
  }, 300); // Wait for transition to complete
};

// Watch for visibility changes
watch(() => props.visible, (newVisible, oldVisible) => {
  // If the panel becomes visible again, restore saved state
  if (newVisible && !oldVisible) {
    // When panel becomes visible, load the saved collapsed state
    try {
      const savedCollapsed = localStorage.getItem('chartActionsPanelCollapsed');
      if (savedCollapsed !== null) {
        collapsed.value = JSON.parse(savedCollapsed);
        emit('collapse-change', collapsed.value);
      }
      
      // Check if detailed view was active
      const savedDetailedView = localStorage.getItem('chartActionsPanelDetailedView');
      if (savedDetailedView !== null && JSON.parse(savedDetailedView) === true) {
        // Restore detailed view after a short delay
        setTimeout(() => {
          detailedView.value = true;
          showDetailedViewUI();
        }, 50);
      }
      
      // Check if expanded view was active
      const savedExpandedView = localStorage.getItem('chartActionsPanelExpandedView');
      if (savedExpandedView !== null && JSON.parse(savedExpandedView) === true) {
        // Restore expanded view after a short delay
        setTimeout(() => {
          expandedView.value = true;
          showExpandedViewUI();
        }, 50);
      }
    } catch (error) {
      console.error('Error restoring ChartActionsPanel state:', error);
    }
  } else if (!newVisible && oldVisible) {
    // When panel becomes hidden, remember if views were active,
    // but close them now to avoid UI inconsistencies
    if (detailedView.value) {
      // Save state but close UI
      saveDetailedViewState();
      // Close detailed view UI without changing state
      const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
      if (panelElement) {
        panelElement.classList.remove('visible');
        panelElement.style.transform = 'translateX(100%)';
      }
    }
    
    if (expandedView.value) {
      // Save state but close UI
      saveExpandedViewState();
      // Close expanded view UI without changing state
      const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
      if (panelElement) {
        panelElement.classList.remove('visible');
        panelElement.style.transform = 'translateX(100%)';
      }
    }
  }
});
</script>

<style scoped>
/* Import Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.chart-actions-panel {
  position: fixed;
  top: 56px; /* Match the sidebar's top position */
  right: -250px;
  width: 240px; /* Match the sidebar width exactly */
  height: calc(100vh - 56px); /* Match the sidebar height */
  display: flex;
  flex-direction: row;
  background-color: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1000; /* Increased z-index to ensure it appears above other elements */
  box-shadow: none;
  border-left: 1px solid rgba(232, 232, 232, 0.5);
}

.chart-actions-panel.visible {
  right: 0;
}

.chart-actions-panel.collapsed {
  width: 60px;
}

/* Styles for detailed view mode */
.chart-actions-panel.detailed-view {
  width: 600px;
  max-width: 100%;
  right: -600px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 9999; /* Very high z-index to ensure it's on top of everything */
  position: fixed;
  top: 56px;
  bottom: 0;
  left: auto;
  height: calc(100vh - 56px);
  border-left: 1px solid #dfdfdf;
  transform: translateX(0); /* Reset any transforms */
}

.chart-actions-panel.detailed-view.visible {
  right: 0 !important;
  border-left: 1px solid #dfdfdf;
  transform: none !important;
  opacity: 1;
  display: flex !important;
  visibility: visible !important;
}

.detailed-view .panel-content {
  padding: 0;
  overflow-y: auto; /* Allow scrolling within the panel content */
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-height: 100%;
  background-color: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(10px);
}

.panel-border {
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(232,232,232,1) 5%, rgba(85,85,85,0) 10%);
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(10px);
  height: 100%;
  overflow: hidden;
}

.collapsed .panel-content {
  padding: 16px 8px;
}

.panel-header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 17px;
  width: 100%;
}

.collapsed .panel-header-container {
  justify-content: center;
  margin-bottom: 24px;
}

.panel-toggle {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 10px;
}

.collapsed .panel-toggle {
  margin-right: 0;
}

.panel-toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  opacity: 0.8;
}

.panel-toggle-icon.flipped {
  transform: rotate(180deg);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
}

.panel-title {
  color: #323232;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 24px;
  margin: 0;
}

.panel-description {
  color: #777777;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 16px;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-action .material-icons {
  font-size: 20px;
  color: #313438;
}

.chart-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}

.add-chart-section {
  padding: 16px 24px;
  border-top: 1px solid #DADEE3;
}

.add-chart-section h3 {
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 16px 0;
}

.chart-type-selector {
  display: flex;
  gap: 16px;
}

.chart-type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.chart-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.chart-type-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-type-option span {
  color: #777777;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 16px;
}

.panel-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.action-button {
  width: 100%;
  padding: 12px 8px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: rgba(44, 228, 207, 0.1);
  transform: none;
  box-shadow: none;
}

.collapsed .action-button {
  padding: 12px 0;
  justify-content: center;
}

.button-icon {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.button-text {
  color: #777777;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

/* The panel has a left border matching the sidebar style */
.chart-actions-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(232,232,232,1) 5%, rgba(85,85,85,0) 70%);
  pointer-events: none;
}

/* Responsive styles */
@media (min-width: 1441px) {
  .panel-content {
    padding: 24px 16px;
  }
  
  .collapsed .panel-content {
    padding: 24px 8px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 700px;
  }
}

@media (max-width: 1200px) {
  .panel-content {
    padding: 16px 12px;
  }
  
  .collapsed .panel-content {
    padding: 16px 8px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 550px;
  }
}

@media (max-width: 991px) {
  .chart-actions-panel {
    top: 56px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 500px;
  }
}

@media (max-width: 768px) {
  .chart-actions-panel {
    display: flex;
    width: 240px;
    transform: translateX(100%);
    box-shadow: none;
    border-left: 1px solid rgba(232, 232, 232, 0.8);
    right: 0; /* Position at edge, will be moved by transform */
    background-color: rgba(255, 255, 255, 0.4);
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .chart-actions-panel.visible {
    transform: translateX(0);
  }
  
  .chart-actions-panel.collapsed {
    width: 60px;
  }
  
  .chart-actions-panel.detailed-view {
    position: fixed;
    top: 56px;
    bottom: 0;
    left: auto;
    right: 0;
    width: 100%;
    max-width: 100%;
    transform: translateX(100%);
    height: calc(100vh - 56px);
    box-sizing: border-box;
    z-index: 9999; /* Consistent with desktop z-index */
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .chart-actions-panel.detailed-view.visible {
    transform: translateX(0) !important;
    right: 0 !important;
    opacity: 1;
    display: flex !important;
    visibility: visible !important;
  }
  
  /* Add overlay background when panel is visible on mobile */
  .chart-actions-panel.detailed-view.visible::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
  
  .chart-type-selector {
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .chart-panel {
    height: calc(100% - 57px);
    width: 100%;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .chart-actions-panel {
    width: 80%; /* Takes up most of the screen on very small devices */
    max-width: 240px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 100%;
    right: 0;
    transform: translateX(100%);
    max-width: 100%; /* Ensure full width on small screens */
  }

  .detailed-view-header {
    padding: 12px 16px;
  }

  .chart-panel {
    padding: 16px;
  }
}

.panel-title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

/* Detailed view styles */
.detailed-charts-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative; /* Add position relative */
}

.detailed-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 57px; /* Fixed height for the header */
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-button {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.detailed-view-title {
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

.close-button {
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-panel {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 57px); /* Account for header height */
  position: relative; /* Add position relative */
}

.no-chart-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  background-color: #F7F8FA;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
  border-radius: 13px;
}

.no-chart-message p {
  font-size: 16px;
  margin-bottom: 8px;
  color: #323232;
}

.empty-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  background-color: #F7F8FA;
  border-radius: 8px;
  margin: 20px 0;
}

.empty-data-message p {
  font-size: 14px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
  margin: 16px 0 8px 0;
  padding: 0;
}

.empty-chart-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  background-color: #F7F8FA;
  border-radius: 13px;
  padding: 24px;
  box-sizing: border-box;
}

[data-v-19561bbe] {
  position: relative;
}

[data-v-19561bbe]:after {
  content: "🔒 Pro";
  position: absolute;
  top: -8px;
  right: -8px;
  background: #257BDF;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 10px;
  opacity: 0.9;
}

/* Animation for the panel appearing */
@keyframes slideInPanel {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Make sure the content doesn't shift when showing the panel */
:global(.app-container.with-detailed-panel) {
  overflow: hidden;
}

/* Add this to the end of the style section */
@supports (-webkit-overflow-scrolling: touch) {
  /* iOS-specific fixes */
  .chart-actions-panel.detailed-view {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

/* Fix for stacking context issues */
.chart-actions-panel {
  will-change: transform, opacity;
}

/* Fix for global positioning */
body {
  position: relative;
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

/* Prevent text selection during panel interactions */
.chart-actions-panel * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Chart Examples Container */
.chart-examples-container {
  display: flex;
  flex-direction: column;
  gap: 21px;
  width: 100%;
  padding: 16px 0;
}

.chart-example {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.chart-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F7F8FA;
  border-radius: 13px;
}

.pie-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

/* Data Table Styles */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
}

.data-table th {
  background: #D9D9D9;
  padding: 12px 24px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.data-table td {
  padding: 12px 24px;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.data-table .positive {
  color: #0CB670;
}

.data-table .negative {
  color: #FC5A5A;
}

/* Chart Action Buttons */
.chart-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  width: 100%;
}

.action-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  outline: none;
  border: none;
  height: 40px;
}

.action-btn.secondary {
  background: #FAFBFC;
  color: #323232;
  outline: 1px solid #DADEE3;
  outline-offset: -1px;
}

.action-btn.primary {
  background: #257BDF;
  color: white;
}

.btn-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

/* Make sure the detailed view has scrollable content */
.detailed-view .chart-panel {
  overflow-y: auto;
  padding: 24px;
}

/* Fix for mobile responsiveness of charts */
@media (max-width: 768px) {
  .chart-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .chart-example {
    max-width: 100%;
    overflow-x: auto;
  }
}

/* Styles for expanded view mode */
.chart-actions-panel.expanded-view {
  width: calc(100% - 240px);
  max-width: 100%;
  right: -100%;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 9999; /* Very high z-index to ensure it's on top of everything */
  position: fixed;
  top: 56px;
  bottom: 0;
  left: auto;
  height: calc(100vh - 56px);
  border-left: 1px solid #dfdfdf;
  transform: translateX(0); /* Reset any transforms */
  background-color: white;
}

.chart-actions-panel.expanded-view.visible {
  right: 0 !important;
  border-left: 1px solid #dfdfdf;
  transform: none !important;
  opacity: 1;
  display: flex !important;
  visibility: visible !important;
}

.expanded-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.expanded-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 57px; /* Fixed height for the header */
  box-sizing: border-box;
  background-color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E1F5F2;
  border-radius: 16px;
  padding: 4px 12px;
  height: 24px;
}

.header-badge span {
  font-size: 12px;
  font-weight: 500;
  color: #00A389;
  font-family: 'DM Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  width: 240px;
  height: 36px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  border: 1px solid #DADEE3;
  padding: 0 16px 0 36px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #323232;
  background-color: #F7F8FA;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #5C88DA;
  box-shadow: 0 0 0 2px rgba(92, 136, 218, 0.2);
}

.search-input::placeholder {
  color: #7E8794;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #F7F8FA;
}

.action-icon:hover {
  background-color: #E8EBF0;
}

.back-button, .close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #F7F8FA;
}

.back-button:hover, .close-button:hover {
  background-color: #E8EBF0;
}

.expanded-view-title {
  color: #323232;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 24px;
  word-wrap: break-word;
}

.expanded-content {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-chart-area {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #F7F8FA;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-insights {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.insight-item {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: #F7F8FA;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-title {
  font-size: 14px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.insight-value {
  font-size: 24px;
  font-weight: 600;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
}

.insight-trend {
  font-size: 12px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.insight-trend.positive {
  color: #0CB670;
}

.insight-trend.negative {
  color: #FC5A5A;
}

.data-section {
  width: 100%;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
}

.data-table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.expanded-data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
}

.expanded-data-table th {
  background: #F7F8FA;
  padding: 12px 24px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.expanded-data-table td {
  padding: 12px 24px;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
  background: white;
}

.expanded-data-table .positive {
  color: #0CB670;
}

.expanded-data-table .negative {
  color: #FC5A5A;
}

.expanded-data-table .neutral {
  color: #FFA500;
}

.expanded-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  width: 100%;
  border-top: 1px solid #DADEE3;
  margin-top: 16px;
}

/* Responsive styles for expanded view */
@media (max-width: 1200px) {
  .chart-actions-panel.expanded-view {
    width: calc(100% - 200px);
  }
  
  .chart-insights {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-container {
    width: 180px;
  }
}

@media (max-width: 992px) {
  .chart-actions-panel.expanded-view {
    width: calc(100% - 100px);
  }
  
  .header-badge {
    display: none;
  }
}

@media (max-width: 768px) {
  .chart-actions-panel.expanded-view {
    width: 100%;
    left: 0;
    right: 0;
  }
  
  .chart-container {
    gap: 24px;
  }
  
  .expanded-content {
    padding: 16px;
  }
  
  .expanded-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .expanded-view-header {
    padding: 12px 16px;
  }
  
  .search-container {
    width: 140px;
  }
  
  .action-icons {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .expanded-view-header {
    padding: 12px 16px;
    height: auto;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-container {
    width: 100%;
    max-width: 220px;
  }
  
  .expanded-content {
    padding: 12px;
  }
  
  .chart-title {
    font-size: 18px;
  }
  
  .insight-value {
    font-size: 20px;
  }
}
</style> 