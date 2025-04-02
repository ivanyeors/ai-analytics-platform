<template>
  <div class="chart-container" :class="{ 'fullscreen': isFullscreen }">
    <div class="chart-header">
      <h3 class="chart-title">{{ title || 'Chart Visualization' }}</h3>
      <div class="chart-controls">
        <button 
          v-if="showCodeBtn" 
          class="control-btn code-btn" 
          @click="toggleCode" 
          :class="{ 'active': showCode }"
        >
          <span class="icon">&lt;/&gt;</span>
          <span class="label">{{ showCode ? 'Hide Code' : 'Show Code' }}</span>
        </button>
        <button 
          class="control-btn fullscreen-btn" 
          @click="toggleFullscreen"
        >
          <span class="icon">{{ isFullscreen ? '↙' : '↗' }}</span>
          <span class="label">{{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}</span>
        </button>
      </div>
    </div>
    
    <div class="chart-content">
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <div>Generating chart...</div>
      </div>
      
      <div v-else-if="error" class="chart-error">
        <div class="error-icon">!</div>
        <div>{{ error }}</div>
      </div>
      
      <div v-else class="chart-wrapper">
        <component 
          :is="chartComponent" 
          v-if="chartData && chartData.data && chartData.data.length > 0" 
          :data="chartData.data" 
          :keys="chartData.series" 
          :index-key="chartData.indexKey || 'category'" 
          :value-key="chartData.valueKey || 'value'" 
          :label-key="chartData.labelKey || 'label'"
          :title="chartData.title"
          :height="chartHeight"
          :colors="chartColors"
          :donut="chartType === 'donut'"
          :curve-type="curveType"
          :stacked="isStacked"
        />
        
        <div v-else class="no-data">
          <div>No data available for chart</div>
        </div>
      </div>
      
      <div v-if="showCode" class="chart-code">
        <pre>{{ generatedCode }}</pre>
        <button class="copy-btn" @click="copyCode">Copy</button>
      </div>
    </div>
    
    <div class="chart-footer">
      <a v-if="chartData && chartData.data && chartData.data.length > 0" 
         class="download-btn" 
         @click.prevent="downloadChart"
         href="#">Download</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BarChart from './charts/BarChart.vue';
import LineChart from './charts/LineChart.vue';
import PieChart from './charts/PieChart.vue';
import AreaChart from './charts/AreaChart.vue';

const props = defineProps({
  chartData: {
    type: Object,
    default: () => ({})
  },
  chartType: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie', 'donut', 'area'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  showCodeBtn: {
    type: Boolean,
    default: true
  },
  curveType: {
    type: String,
    default: 'linear'
  },
  isStacked: {
    type: Boolean,
    default: false
  }
});

// State
const showCode = ref(false);
const isFullscreen = ref(false);
const chartHeight = ref(400);

// Chart component selection based on type
const chartComponent = computed(() => {
  switch (props.chartType) {
    case 'bar':
      return BarChart;
    case 'line':
      return LineChart;
    case 'pie':
    case 'donut':
      return PieChart;
    case 'area':
      return AreaChart;
    default:
      return BarChart;
  }
});

// Predefined color palette
const chartColors = [
  '#2CE4CF', // Teal
  '#257BDF', // Blue
  '#6A5ACD', // Purple
  '#FF6B6B', // Red
  '#FFD166', // Yellow
  '#06D6A0', // Green
  '#118AB2', // Dark Blue
  '#073B4C', // Navy
  '#EF476F', // Pink
  '#FFC43D'  // Orange
];

// Generate code representation of the chart
const generatedCode = computed(() => {
  if (!props.chartData || !props.chartData.data) return 'No data available';
  
  let code = '';
  let componentName = '';
  
  // Determine component and basic properties
  switch (props.chartType) {
    case 'bar':
      componentName = 'BarChart';
      code = '<!-- Bar Chart Example -->\n';
      code += '<BarChart :data="data" :keys="keys" />';
      break;
    case 'line':
      componentName = 'LineChart';
      code = '<!-- Line Chart Example -->\n';
      code += '<LineChart :data="data" :keys="keys" />';
      break;
    case 'pie':
    case 'donut':
      componentName = 'PieChart';
      code = '<!-- Pie Chart Example -->\n';
      if (props.chartType === 'donut') {
        code += '<PieChart :data="data" :donut="true" />';
      } else {
        code += '<PieChart :data="data" />';
      }
      break;
    case 'area':
      componentName = 'AreaChart';
      code = '<!-- Area Chart Example -->\n';
      if (props.isStacked) {
        code += '<AreaChart :data="data" :keys="keys" :stacked="true" />';
      } else {
        code += '<AreaChart :data="data" :keys="keys" />';
      }
      break;
    default:
      return 'Unsupported chart type';
  }
  
  // Add import information
  code += '\n\n<!-- Import the component -->\n';
  code += 'import { ' + componentName + ' } from \'@/components/ui/chart\';';
  
  // Add data example
  code += '\n\n<!-- Example Data -->\n';
  code += 'const data = ' + JSON.stringify(props.chartData.data?.slice(0, 3) || [], null, 2) + ';';
  
  if (props.chartType !== 'pie' && props.chartType !== 'donut') {
    code += '\nconst keys = ' + JSON.stringify(props.chartData.series || ['value']) + ';';
  }
  
  return code;
});

// UI Controls
const toggleCode = () => {
  showCode.value = !showCode.value;
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  // Adjust chart height when fullscreen is toggled
  if (isFullscreen.value) {
    chartHeight.value = window.innerHeight * 0.7; // 70% of viewport height
  } else {
    chartHeight.value = 400; // Default height
  }
};

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value)
    .then(() => {
      alert('Code copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy code:', err);
    });
};

const downloadChart = () => {
  // Convert SVG to a data URL and trigger download
  const svgElement = document.querySelector('.chart-wrapper svg');
  if (!svgElement) return;
  
  try {
    // Clone the SVG to avoid modifying the displayed one
    const clone = svgElement.cloneNode(true);
    
    // Apply inline styles to ensure proper rendering
    const svgStyles = getComputedStyle(svgElement);
    clone.setAttribute('style', `background-color: white; width: ${svgElement.width.baseVal.value}px; height: ${svgElement.height.baseVal.value}px;`);
    
    // Create a data URL
    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.title || 'chart'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading chart:', error);
  }
};

// Responsive behavior
onMounted(() => {
  const container = document.querySelector('.chart-container');
  if (container) {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === container && !isFullscreen.value) {
          // Only adjust height based on width for responsive behavior when not in fullscreen
          const width = entry.contentRect.width;
          // Set a reasonable aspect ratio
          chartHeight.value = Math.min(400, width * 0.6);
        }
      }
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  }
});

// Watch for changes in chart data to update height accordingly
watch(() => props.chartData, (newData) => {
  if (newData && !isFullscreen.value) {
    // Adjust height based on data points for better visualization
    const dataPoints = newData.data?.length || 0;
    if (dataPoints > 10) {
      chartHeight.value = Math.min(600, 400 + (dataPoints - 10) * 10);
    } else {
      chartHeight.value = 400;
    }
  }
}, { deep: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  border-radius: 0;
  padding: 20px;
  box-sizing: border-box;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e8e8e8;
}

.control-btn.active {
  background: #e0e0e0;
  color: #333;
}

.control-btn .icon {
  margin-right: 6px;
  font-size: 16px;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  overflow: auto;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  color: #666;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chart-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  color: #e74c3c;
  gap: 16px;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e74c3c;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-style: italic;
}

.chart-code {
  margin-top: 20px;
  position: relative;
  border-radius: 6px;
  background-color: #f8f8f8;
  overflow: hidden;
}

.chart-code pre {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  color: #333;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

.chart-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.download-btn {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #e8e8e8;
}
</style> 