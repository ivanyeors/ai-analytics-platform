<template>
  <div class="pie-chart-container">
    <h3 v-if="title" class="chart-title">{{ title }}</h3>
    <div class="chart-canvas">
      <svg :width="width" :height="height" class="pie-chart">
        <!-- Base Layer -->
        <rect x="0" y="0" :width="width" :height="height" fill="none" />
        
        <!-- Pie Slices -->
        <g class="pie-slices" :transform="`translate(${center.x}, ${center.y})`">
          <path 
            v-for="(slice, i) in pieData" 
            :key="`slice-${i}`"
            :d="generateSlicePath(slice)"
            :fill="getColor(i)"
            :stroke="'white'"
            stroke-width="1"
            @mouseenter="showTooltip(slice, $event)"
            @mouseleave="hideTooltip"
          />
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
            <div class="tooltip-title">{{ tooltipData.label }}</div>
            <div class="tooltip-value">{{ formatTooltipValue(tooltipData.value) }} ({{ tooltipData.percentage }}%)</div>
          </div>
        </foreignObject>
      </svg>
    </div>
    
    <!-- Legend -->
    <div v-if="showLegend" class="chart-legend">
      <div 
        v-for="(item, i) in normalizedData" 
        :key="`legend-${i}`" 
        class="legend-item"
      >
        <span class="legend-color-box" :style="{ backgroundColor: getColor(i) }"></span>
        <span class="legend-label">{{ item.label }}: {{ formatValue(item.value) }} ({{ item.percentage }}%)</span>
      </div>
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
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  colors: {
    type: Array,
    default: () => [
      '#2CE4CF', '#257BDF', '#6A5ACD', '#FF6B6B', '#FFD166', 
      '#06D6A0', '#118AB2', '#073B4C', '#EF476F', '#FFC43D'
    ]
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
  donut: {
    type: Boolean,
    default: false
  },
  innerRadius: {
    type: Number,
    default: 0.6 // As a ratio of the outer radius (0-1)
  },
  tooltip: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: true
  }
});

// Internal state
const chartContainer = ref(null);
const chartWidth = ref(0);
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipData = ref({ label: '', value: 0, percentage: 0 });
const tooltipWidth = 200;
const tooltipHeight = 70;

// Calculate normalized data with percentages
const normalizedData = computed(() => {
  if (!props.data || props.data.length === 0) return [];
  
  // Filter out invalid or zero values
  const validData = props.data.filter(item => {
    const value = Number(item[props.valueKey]);
    return !isNaN(value) && value > 0;
  });
  
  if (validData.length === 0) return [];
  
  // Calculate total and percentages
  const total = validData.reduce((acc, item) => acc + Number(item[props.valueKey]), 0);
  
  return validData.map(item => {
    const value = Number(item[props.valueKey]);
    const percentage = Math.round((value / total) * 100);
    return {
      label: item[props.labelKey],
      value: value,
      percentage: percentage
    };
  });
});

// Calculate pie chart dimensions
const center = computed(() => ({
  x: (props.width || chartWidth.value) / 2,
  y: props.height / 2
}));

const radius = computed(() => {
  const minDimension = Math.min(
    (props.width || chartWidth.value), 
    props.height
  );
  // Leave space for labels
  return (minDimension / 2) * 0.8;
});

// Generate pie data with calculated angles
const pieData = computed(() => {
  if (normalizedData.value.length === 0) return [];
  
  let startAngle = 0;
  return normalizedData.value.map((item, index) => {
    const angle = (item.percentage / 100) * Math.PI * 2;
    const slice = {
      ...item,
      startAngle,
      endAngle: startAngle + angle,
      index
    };
    startAngle += angle;
    return slice;
  });
});

// Generate SVG path for a pie slice
const generateSlicePath = (slice) => {
  const innerR = props.donut ? radius.value * props.innerRadius : 0;
  const outerR = radius.value;
  
  const startX = Math.cos(slice.startAngle) * outerR;
  const startY = Math.sin(slice.startAngle) * outerR;
  
  const endX = Math.cos(slice.endAngle) * outerR;
  const endY = Math.sin(slice.endAngle) * outerR;
  
  const innerStartX = Math.cos(slice.startAngle) * innerR;
  const innerStartY = Math.sin(slice.startAngle) * innerR;
  
  const innerEndX = Math.cos(slice.endAngle) * innerR;
  const innerEndY = Math.sin(slice.endAngle) * innerR;
  
  const largeArcFlag = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
  
  if (props.donut) {
    // Donut slice (path with inner radius)
    return `
      M ${startX} ${startY}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerEndX} ${innerEndY}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  } else {
    // Regular pie slice (path to center)
    return `
      M ${startX} ${startY}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L 0 0
      Z
    `;
  }
};

// Get color for a slice based on index
const getColor = (index) => {
  return props.colors[index % props.colors.length];
};

// Value formatting
const formatValue = (value) => {
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
const showTooltip = (slice, event) => {
  if (!props.tooltip) return;
  
  const path = event.target;
  const svgRect = path.ownerSVGElement.getBoundingClientRect();
  
  // Calculate position halfway between center and outer edge of the slice
  const midAngle = (slice.startAngle + slice.endAngle) / 2;
  const midRadius = radius.value * (props.donut ? (1 + props.innerRadius) / 2 : 0.5);
  
  const x = center.value.x + Math.cos(midAngle) * midRadius;
  const y = center.value.y + Math.sin(midAngle) * midRadius;
  
  tooltipData.value = {
    label: slice.label,
    value: slice.value,
    percentage: slice.percentage
  };
  
  // Position tooltip near the slice
  tooltipPosition.value = { 
    x: Math.min(Math.max(5, x - tooltipWidth / 2), svgRect.width - tooltipWidth - 5),
    y: Math.min(Math.max(5, y - tooltipHeight - 10), svgRect.height - tooltipHeight - 5)
  };
  
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

// Update chart width when component mounts
onMounted(() => {
  if (props.width === 0) {
    // Set chart width based on container
    const container = document.querySelector('.pie-chart-container');
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
  const container = document.querySelector('.pie-chart-container');
  if (container) {
    chartWidth.value = container.clientWidth;
  }
};
</script>

<style scoped>
.pie-chart-container {
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

.pie-chart {
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

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding: 0 16px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 