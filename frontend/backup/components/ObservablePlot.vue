<template>
  <div>
    <div v-if="loading" class="loading">Loading chart...</div>
    <div ref="chartContainer" class="chart-container"></div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
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
    }
  },
  
  setup(props) {
    const chartContainer = ref(null);
    const loading = ref(false);
    const error = ref(null);
    let chart = null;
    
    // Function to create the chart
    const createChart = () => {
      if (!chartContainer.value || !props.data || props.data.length === 0) return;
      
      loading.value = true;
      error.value = null;
      
      try {
        // Clear previous chart
        if (chartContainer.value.firstChild) {
          chartContainer.value.innerHTML = '';
        }
        
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
    watch(() => [props.data, props.options, props.type, props.width, props.height], () => {
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
      error
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

.error {
  padding: 10px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
  margin-top: 10px;
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