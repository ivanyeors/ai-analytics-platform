<template>
  <div class="bar-chart-container">
    <h3 v-if="title" class="chart-title">{{ title }}</h3>
    <div class="chart-canvas">
      <svg :width="width" :height="height" class="bar-chart">
        <!-- Base Layer - Background and Grid -->
        <rect x="0" y="0" :width="width" :height="height" fill="none" />
        
        <!-- Grid Layer -->
        <g class="grid-layer">
          <line 
            v-for="(tick, i) in yAxisTicks" 
            :key="`grid-${i}`"
            :x1="padding.left" 
            :y1="yScale(tick)" 
            :x2="width - padding.right" 
            :y2="yScale(tick)"
            stroke="#e5e5e5" 
            stroke-width="1"
          />
        </g>
        
        <!-- X Axis -->
        <g class="x-axis" :transform="`translate(0,${height - padding.bottom})`">
          <line 
            :x1="padding.left" 
            :y1="0" 
            :x2="width - padding.right" 
            :y2="0" 
            stroke="#ccc"
          />
          <g 
            v-for="(item, i) in data" 
            :key="`x-${i}`" 
            :transform="`translate(${xScale(getIndexValue(item))},0)`"
          >
            <line x1="0" y1="0" x2="0" y2="5" stroke="#ccc" />
            <text 
              y="20" 
              font-size="12" 
              text-anchor="middle" 
              fill="#666"
              :transform="`rotate(${xLabelsRotation})`"
            >
              {{ truncateLabel(getIndexValue(item)) }}
            </text>
          </g>
        </g>
        
        <!-- Y Axis -->
        <g class="y-axis" :transform="`translate(${padding.left},0)`">
          <line 
            x1="0" 
            :y1="padding.top" 
            x2="0" 
            :y2="height - padding.bottom" 
            stroke="#ccc"
          />
          <g 
            v-for="(tick, i) in yAxisTicks" 
            :key="`y-${i}`" 
            :transform="`translate(0,${yScale(tick)})`"
          >
            <line x1="-5" y1="0" x2="0" y2="0" stroke="#ccc" />
            <text 
              x="-10" 
              y="5" 
              font-size="12" 
              text-anchor="end" 
              fill="#666"
            >
              {{ formatYValue(tick) }}
            </text>
          </g>
        </g>
        
        <!-- Data Bars -->
        <g class="bars-layer">
          <g v-for="key in keys" :key="key">
            <rect 
              v-for="(item, i) in data" 
              :key="`bar-${i}`"
              :x="xScale(getIndexValue(item)) - barWidth / 2"
              :y="yScale(item[key] || 0)"
              :width="barWidth"
              :height="height - padding.bottom - yScale(item[key] || 0)"
              :fill="getColor(key, i)"
              rx="2" 
              @mouseenter="showTooltip(item, key, $event)"
              @mouseleave="hideTooltip"
            />
          </g>
        </g>
        
        <!-- Tooltip -->
        <foreignObject 
          v-if="tooltipVisible" 
          :x="tooltipPosition.x" 
          :y="tooltipPosition.y"
          :width="tooltipWidth" 
          :height="tooltipHeight"
          class="tooltip-container"
        >
          <div xmlns="http://www.w3.org/1999/xhtml" class="tooltip">
            <div class="tooltip-title">{{ tooltipData.category }}</div>
            <div class="tooltip-value">{{ tooltipData.label }}: {{ formatTooltipValue(tooltipData.value) }}</div>
          </div>
        </foreignObject>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  keys: {
    type: Array,
    default: () => ['value']
  },
  index: {
    type: String,
    default: 'category'
  },
  colors: {
    type: Array,
    default: () => ['#2CE4CF', '#257BDF', '#6A5ACD']
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 300
  },
  width: {
    type: Number,
    default: 0 // Will be set dynamically
  },
  tooltip: {
    type: Boolean,
    default: true
  }
});

// Internal state
const chartContainer = ref(null);
const chartWidth = ref(0);
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipData = ref({ category: '', label: '', value: 0 });
const tooltipWidth = 150;
const tooltipHeight = 70;

// Padding configuration
const padding = {
  top: 20,
  right: 20,
  bottom: 60, // Extra space for x-axis labels
  left: 60    // Extra space for y-axis labels
};

// Calculate available chart dimensions
const innerWidth = computed(() => (props.width || chartWidth.value) - padding.left - padding.right);
const innerHeight = computed(() => props.height - padding.top - padding.bottom);

// Compute optimal bar width
const barWidth = computed(() => Math.min(innerWidth.value / props.data.length * 0.8, 50));

// Determine if x-axis labels should be rotated based on data length
const xLabelsRotation = computed(() => {
  if (props.data.length > 8) return 45;
  return 0;
});

// Helper function to get the index value (category)
const getIndexValue = (item) => {
  return item[props.index];
};

// Scale functions
const xScale = (value) => {
  const step = innerWidth.value / (props.data.length - 1 || 1);
  const index = props.data.findIndex(d => getIndexValue(d) === value);
  return padding.left + index * step;
};

// Find min and max values from data
const dataExtent = computed(() => {
  const values = props.data.flatMap(item => props.keys.map(key => item[key] || 0));
  const min = Math.min(0, ...values); // Always include 0
  const max = Math.max(...values);
  return { min, max };
});

// Generate y-axis ticks
const yAxisTicks = computed(() => {
  const { min, max } = dataExtent.value;
  const tickCount = 5;
  const step = (max - min) / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, i) => min + i * step);
});

// Y-axis scale function
const yScale = (value) => {
  const { min, max } = dataExtent.value;
  const ratio = (value - min) / (max - min);
  return height - padding.bottom - ratio * innerHeight.value;
};

// Get color for a bar based on key and index
const getColor = (key, index) => {
  const keyIndex = props.keys.indexOf(key);
  if (keyIndex >= 0 && keyIndex < props.colors.length) {
    return props.colors[keyIndex];
  }
  return props.colors[index % props.colors.length];
};

// Value formatting
const formatYValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(value % 1 === 0 ? 0 : 1);
};

const formatTooltipValue = (value) => {
  return value.toLocaleString();
};

// Tooltip handlers
const showTooltip = (item, key, event) => {
  if (!props.tooltip) return;
  
  const rect = event.target;
  const svgRect = rect.ownerSVGElement.getBoundingClientRect();
  
  const x = parseInt(rect.getAttribute('x')) + parseInt(rect.getAttribute('width')) / 2;
  const y = parseInt(rect.getAttribute('y'));
  
  tooltipData.value = {
    category: getIndexValue(item),
    label: key,
    value: item[key] || 0
  };
  
  // Position tooltip above the bar
  tooltipPosition.value = { 
    x: Math.min(x - tooltipWidth / 2, svgRect.width - tooltipWidth - 5),
    y: Math.max(5, y - tooltipHeight - 10)
  };
  
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

// Helper to truncate long labels
const truncateLabel = (label) => {
  if (typeof label !== 'string') return label;
  return label.length > 12 ? `${label.substring(0, 10)}...` : label;
};

// Update chart width when component mounts
onMounted(() => {
  if (props.width === 0) {
    // Set chart width based on container
    const container = document.querySelector('.bar-chart-container');
    if (container) {
      chartWidth.value = container.clientWidth;
    }
    
    // Update width on window resize
    window.addEventListener('resize', updateWidth);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

const updateWidth = () => {
  const container = document.querySelector('.bar-chart-container');
  if (container) {
    chartWidth.value = container.clientWidth;
  }
};
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #333;
  text-align: center;
}

.chart-canvas {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.bar-chart {
  max-width: 100%;
  max-height: 100%;
  overflow: visible;
}

.tooltip-container {
  overflow: visible;
  pointer-events: none;
}

.tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0.9;
  width: max-content;
  max-width: 200px;
}

.tooltip-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-value {
  opacity: 0.9;
}
</style> 