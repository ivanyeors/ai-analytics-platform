<template>
  <div class="chart-visualizer" :class="{ 'fullscreen': isFullscreen, 'compact-mode': compactMode }">
    <div class="chart-header" v-if="!compactMode">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <button class="action-button" @click="downloadChart" title="Download">
          <span class="material-icons">download</span>
        </button>
        <button class="action-button" @click="toggleFullscreen" title="Fullscreen">
          <span class="material-icons">{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</span>
        </button>
        <button v-if="showClose" class="action-button" @click="closeChart" title="Close">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
    
    <div class="chart-container" ref="chartContainer">
      <!-- Chart will be rendered here -->
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner"></div>
        <p>Generating chart...</p>
      </div>
    </div>
    
    <div v-if="showCode && !compactMode" class="chart-code">
      <div class="code-header">
        <h4>Chart Code</h4>
        <button class="code-toggle" @click="toggleCode">
          {{ codeExpanded ? 'Hide Code' : 'Show Code' }}
        </button>
      </div>
      <pre v-if="codeExpanded" class="code-block"><code>{{ chartCode }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as Plot from '@observablehq/plot';

const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: (value) => value === 'bar' // Only allow 'bar' chart type
  },
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Chart Visualization'
  },
  options: {
    type: Object,
    default: () => ({})
  },
  showCode: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  compactMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'chart-rendered']);

const chartContainer = ref(null);
const isFullscreen = ref(false);
const codeExpanded = ref(false);
const chartCode = ref('');
let chart = null;

// Watch for changes in data or options to re-render the chart
watch([() => props.data, () => props.options, () => props.chartType], renderChart, { deep: true });

onMounted(() => {
  renderChart();
  // Listen for ESC key to exit fullscreen
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (chart) {
    // Clean up if needed
  }
});

function handleKeyDown(e) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
  }
}

function renderChart() {
  if (!chartContainer.value || props.loading) return;
  
  // Clear previous chart
  if (chartContainer.value.firstChild) {
    chartContainer.value.innerHTML = '';
  }
  
  try {
    // Base configuration
    const baseConfig = {
      ...props.options,
      style: { 
        background: "transparent",
        fontSize: 12,
        width: "100%",
        height: "100%",
        ...props.options.style
      }
    };
    
    // Always create bar chart
    chart = createBarChart(baseConfig);
    
    // Append chart to container
    if (chart) {
      chartContainer.value.appendChild(chart);
      // Generate code representation for the chart
      generateChartCode();
      // Emit that the chart is rendered
      emit('chart-rendered', { 
        type: 'bar',
        title: props.title
      });
    }
  } catch (error) {
    console.error("Error rendering chart:", error);
    chartContainer.value.innerHTML = `<div class="chart-error">Error rendering chart: ${error.message}</div>`;
  }
}

function createBarChart(config) {
  const xKey = config.xKey || 'category';
  const yKey = config.yKey || 'value';
  
  // Determine if we're in compact mode (chat bubble)
  const isCompact = props.compactMode;
  
  // Adjust chart configuration for compact mode
  const compactConfig = {
    marginLeft: isCompact ? 50 : 80,
    marginBottom: isCompact ? 40 : 40, // Increased to ensure x-axis labels are visible
    marginRight: isCompact ? 20 : 30,
    marginTop: isCompact ? 10 : 30, // Reduced top margin since we removed title
    width: isCompact ? "100%" : undefined,
    height: isCompact ? 200 : undefined, // Set a fixed height for compact mode
    style: {
      ...config.style,
      overflow: "visible",
      maxWidth: "100%"
    }
  };
  
  return Plot.plot({
    marks: [
      Plot.barY(props.data, { 
        x: d => d[xKey], 
        y: d => d[yKey],
        fill: config.color || "#2CE4CF",
        title: d => `${d[xKey]}: ${d[yKey]}`,
        // Reduce bar width in compact mode if there are many data points
        dx: isCompact && props.data.length > 4 ? -5 : 0
      })
    ],
    ...compactConfig,
    ...config,
    // Remove the title completely
    title: null,
    // Ensure axis labels are readable in compact mode
    x: {
      tickRotate: isCompact && props.data.length > 3 ? 45 : 0,
      label: null, // Remove x-axis label
      tickSize: isCompact ? 3 : 6
    },
    y: {
      grid: true,
      label: null, // Remove y-axis label
      tickFormat: isCompact ? (d => d >= 1000 ? `${Math.round(d/1000)}k` : d) : null // Shorter numbers in compact mode
    }
  });
}

function generateChartCode() {
  // Generate a simplified version of the chart code
  let code = 'Plot.plot({\n';
  
  // Always generate bar chart code
  code += `  marks: [Plot.barY(data, { x: "${props.options.xKey || 'category'}", y: "${props.options.yKey || 'value'}" })],\n`;
  
  code += '  // Additional configuration options\n';
  code += '})';
  
  chartCode.value = code;
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  // Re-render after size change
  setTimeout(renderChart, 100);
}

function toggleCode() {
  codeExpanded.value = !codeExpanded.value;
}

function downloadChart() {
  if (!chart) return;
  
  try {
    // Create a canvas for the SVG
    const svgData = new XMLSerializer().serializeToString(chart);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set dimensions
    const bbox = chart.getBBox();
    canvas.width = bbox.width * 2; // Higher resolution
    canvas.height = bbox.height * 2;
    
    // Create an image to draw to canvas
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${props.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    // Convert SVG to data URL
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
}

function closeChart() {
  emit('close');
}
</script>

<style scoped>
.chart-visualizer {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 16px 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-visualizer.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  border-radius: 0;
  margin: 0;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(5px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title {
  font-size: 18px;
  font-weight: 500;
  color: #232323;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  color: #676767;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-button:hover {
  color: #257BDF;
  background-color: rgba(37, 123, 223, 0.1);
}

.chart-container {
  padding: 16px;
  min-height: 300px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fullscreen .chart-container {
  min-height: calc(100vh - 200px);
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #676767;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(44, 228, 207, 0.3);
  border-top-color: #2CE4CF;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chart-code {
  border-top: 1px solid #f0f0f0;
  padding: 0 16px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.code-header h4 {
  margin: 0;
  font-size: 14px;
  color: #676767;
}

.code-toggle {
  background: none;
  border: none;
  color: #257BDF;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.code-toggle:hover {
  background-color: rgba(37, 123, 223, 0.1);
}

.code-block {
  background-color: #f7f7f7;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0 0 16px 0;
  color: #333;
}

.chart-error {
  color: #f44336;
  text-align: center;
  padding: 16px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  margin: 16px;
}

/* Material icons setup */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 768px) {
  .chart-container {
    min-height: 250px;
  }
  
  .chart-header {
    padding: 12px 16px;
  }
  
  .chart-title {
    font-size: 16px;
  }
}

/* Add compact mode styles */
.chart-visualizer.compact-mode {
  max-width: 100%;
  max-height: 250px; /* Reduced max height */
  box-shadow: none;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;
}

.compact-mode .chart-container {
  height: 220px; /* Fixed height for compact mode */
  min-height: 180px;
  max-height: 220px;
  padding: 4px 2px; /* Reduced horizontal padding */
  overflow: visible; /* Changed to visible to allow axis labels to show */
}

/* Style adjustments to ensure chart rendering */
:deep(.plot-chart) {
  overflow: visible !important;
}

:deep(svg) {
  overflow: visible !important;
  width: 100% !important;
  height: 100% !important;
}
</style> 