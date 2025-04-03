<template>
  <div>
    <div v-if="loading" class="loading">Loading chart...</div>
    <div ref="chartContainer" class="chart-container"></div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!props.data || props.data.length === 0" class="no-data">No data available for chart</div>
    <div v-if="debugMode" class="debug-info">
      <h4>Chart Debug Info</h4>
      <div>
        <strong>Data count:</strong> {{ props.data ? props.data.length : 0 }}
      </div>
      <div>
        <strong>X key:</strong> {{ props.xKey }} | 
        <strong>Y key:</strong> {{ props.yKey }}
      </div>
      <div>
        <strong>Chart type:</strong> {{ props.type }}
      </div>
      <div v-if="props.data && props.data.length">
        <details>
          <summary>Sample data point</summary>
          <pre>{{ JSON.stringify(props.data[0], null, 2) }}</pre>
        </details>
      </div>
      <div v-if="dataValidity.hasIssues" class="data-issues">
        <strong>Data issues detected:</strong>
        <ul>
          <li v-for="(issue, index) in dataValidity.issues" :key="index">{{ issue }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onUnmounted, computed } from 'vue';
import * as Plot from '@observablehq/plot';

export default defineComponent({
  name: 'ObservablePlot',
  
  props: {
    data: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'line',
      validator: (value) => ['line', 'bar', 'dot', 'area'].includes(value)
    },
    xKey: {
      type: String,
      default: 'timestamp'
    },
    yKey: {
      type: String,
      default: 'value'
    },
    colorKey: {
      type: String,
      default: 'category'
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 400
    },
    thresholds: {
      type: Array,
      default: () => []
    },
    debugMode: {
      type: Boolean,
      default: true // Enable debug mode by default for troubleshooting
    }
  },
  
  setup(props) {
    const chartContainer = ref(null);
    const loading = ref(false);
    const error = ref(null);
    let chart = null;
    
    // Computed property to validate data
    const dataValidity = computed(() => {
      const issues = [];
      let hasIssues = false;
      
      // Check if we have data
      if (!props.data || props.data.length === 0) {
        issues.push('No data available');
        hasIssues = true;
        return { hasIssues, issues };
      }
      
      // Check if the keys exist in the data
      const firstItem = props.data[0];
      if (!Object.prototype.hasOwnProperty.call(firstItem, props.xKey)) {
        issues.push(`X-axis key "${props.xKey}" not found in data`);
        hasIssues = true;
      }
      
      if (!Object.prototype.hasOwnProperty.call(firstItem, props.yKey)) {
        issues.push(`Y-axis key "${props.yKey}" not found in data`);
        hasIssues = true;
      }
      
      // Check for data type validity (for basic chart types)
      if (Object.prototype.hasOwnProperty.call(firstItem, props.xKey)) {
        const xValues = props.data.map(d => d[props.xKey]);
        const allXNull = xValues.every(v => v === null || v === undefined);
        if (allXNull) {
          issues.push(`All X values are null or undefined`);
          hasIssues = true;
        }
      }
      
      if (Object.prototype.hasOwnProperty.call(firstItem, props.yKey)) {
        const yValues = props.data.map(d => d[props.yKey]);
        const allYNull = yValues.every(v => v === null || v === undefined);
        if (allYNull) {
          issues.push(`All Y values are null or undefined`);
          hasIssues = true;
        }
        
        // For numeric charts, Y should be numeric
        if (['bar', 'line', 'area'].includes(props.type)) {
          const nonNumericY = yValues.some(v => v !== null && v !== undefined && typeof v !== 'number');
          if (nonNumericY) {
            issues.push(`Non-numeric Y values found for ${props.type} chart`);
            hasIssues = true;
          }
        }
      }
      
      return { hasIssues, issues };
    });
    
    // Function to create the chart
    const createChart = () => {
      if (!chartContainer.value) return;
      if (!props.data || props.data.length === 0) {
        error.value = "No data available for chart";
        return;
      }
      
      // Only proceed if we have valid data
      if (dataValidity.value.hasIssues) {
        error.value = dataValidity.value.issues.join('; ');
        return;
      }
      
      loading.value = true;
      error.value = null;
      
      try {
        // Clear previous chart
        if (chartContainer.value.firstChild) {
          chartContainer.value.innerHTML = '';
        }
        
        console.log('Creating chart with data:', {
          type: props.type,
          xKey: props.xKey,
          yKey: props.yKey,
          dataLength: props.data.length,
          sampleData: props.data.slice(0, 3)
        });
        
        // Prepare mark based on chart type
        let mark;
        const markOptions = {
          x: props.xKey,
          y: props.yKey,
          stroke: props.colorKey
        };
        
        // Apply specific options for different chart types
        switch (props.type) {
          case 'line':
            mark = Plot.line(props.data, markOptions);
            break;
          case 'bar':
            mark = Plot.barY(props.data, { ...markOptions, fill: props.colorKey });
            break;
          case 'dot':
            mark = Plot.dot(props.data, { ...markOptions, fill: props.colorKey });
            break;
          case 'area':
            mark = Plot.area(props.data, { ...markOptions, fill: props.colorKey });
            break;
          default:
            mark = Plot.line(props.data, markOptions);
        }
        
        // Add threshold lines if specified
        const thresholdMarks = props.thresholds.map(threshold => 
          Plot.ruleY([threshold.value], { 
            stroke: threshold.color || "red",
            strokeWidth: threshold.width || 1,
            strokeDasharray: threshold.dashed ? "5,5" : null
          })
        );
        
        // Create the chart with default and custom options
        const defaultOptions = {
          title: props.title,
          width: props.width,
          height: props.height,
          marks: [mark, ...thresholdMarks],
          x: {
            label: props.options.xLabel || props.xKey,
            tickFormat: props.xKey === 'timestamp' ? "%H:%M:%S" : null
          },
          y: {
            label: props.options.yLabel || props.yKey
          },
          color: {
            legend: true
          },
          grid: true,
          nice: true,
          ...props.options
        };
        
        // Create the chart
        chart = Plot.plot(defaultOptions);
        
        // Add the chart to the DOM
        chartContainer.value.appendChild(chart);
        console.log('Chart created successfully');
      } catch (e) {
        error.value = `Error rendering chart: ${e.message}`;
        console.error('Error rendering Observable Plot chart:', e);
      } finally {
        loading.value = false;
      }
    };
    
    // Create the chart when the component is mounted
    onMounted(() => {
      createChart();
    });
    
    // Update the chart when data or options change
    watch(() => [props.data, props.options, props.type, props.xKey, props.yKey, props.width, props.height], () => {
      createChart();
    }, { deep: true });
    
    // Clean up on unmount
    onUnmounted(() => {
      if (chart) {
        chart = null;
      }
    });
    
    return {
      chartContainer,
      loading,
      error,
      dataValidity,
      props
    };
  }
});
</script>

<style scoped>
.chart-container {
  min-height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error, .no-data {
  padding: 10px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
  margin-top: 10px;
}

.no-data {
  color: #f57c00;
  background-color: #fff3e0;
}

.debug-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  font-size: 14px;
}

.debug-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.debug-info details {
  margin-top: 10px;
}

.debug-info pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 3px;
  overflow-x: auto;
  max-height: 200px;
  font-family: monospace;
  font-size: 12px;
}

.data-issues {
  margin-top: 10px;
  padding: 8px;
  background-color: #fff8e1;
  border-left: 3px solid #ffc107;
  border-radius: 3px;
}

.data-issues ul {
  margin: 5px 0 0 0;
  padding-left: 20px;
}

/* Style for Plot tooltips */
:global(.plot-tooltip) {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-family: sans-serif;
  font-size: 14px;
}
</style> 