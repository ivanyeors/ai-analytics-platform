<template>
  <div class="chart-panel" :class="{ 'expanded': expanded }">
    <div class="panel-header">
      <div class="panel-title-section">
        <h2 class="panel-title">{{ title }}</h2>
        <p class="panel-description" v-if="description">{{ description }}</p>
      </div>
      <div class="panel-actions">
        <button class="panel-action" @click="togglePanel" :title="expanded ? 'Collapse' : 'Expand'">
          <span class="icon">{{ expanded ? '▲' : '▼' }}</span>
        </button>
        <button class="panel-action" @click="$emit('close')" title="Close">
          <span class="icon">✕</span>
        </button>
      </div>
    </div>
    
    <div class="panel-content" v-show="expanded">
      <div class="chart-grid" :class="{ 'single-chart': charts.length === 1 }">
        <div 
          v-for="(chart, index) in charts" 
          :key="index"
          class="chart-grid-item"
          :class="{ 'width-full': chart.fullWidth }"
        >
          <ChartVisualizer
            :chartType="chart.type"
            :chartData="chart.chartData"
            :title="chart.title"
            :loading="chart.loading || false"
            :error="chart.error || ''"
            :showCodeBtn="true"
            :curveType="chart.curveType || 'linear'"
            :isStacked="chart.isStacked || false"
          />
        </div>
      </div>
      
      <div v-if="showAddChart" class="add-chart-section">
        <h3>Add a new chart</h3>
        <div class="chart-type-buttons">
          <button 
            v-for="type in chartTypes" 
            :key="type.value" 
            class="chart-type-button" 
            @click="addNewChart(type.value)"
          >
            <span class="button-icon" v-html="getChartIcon(type.value)"></span>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { ChartVisualizer } from '@/components/ui/chart';

const props = defineProps({
  title: {
    type: String,
    default: 'Chart Collection'
  },
  description: {
    type: String,
    default: ''
  },
  initialCharts: {
    type: Array,
    default: () => []
  },
  showAddChart: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'add-chart', 'chart-rendered']);

const expanded = ref(true);
const charts = ref(props.initialCharts);

// Available chart types
const chartTypes = [
  { label: 'Bar Chart', value: 'bar' },
  { label: 'Line Chart', value: 'line' },
  { label: 'Pie Chart', value: 'pie' },
  { label: 'Donut Chart', value: 'donut' },
  { label: 'Area Chart', value: 'area' }
];

// Get icon for chart type
function getChartIcon(type) {
  switch (type) {
    case 'bar':
      return '+';
    case 'line':
      return '+';
    case 'pie':
    case 'donut':
      return '+';
    case 'area':
      return '+';
    default:
      return '+';
  }
}

// Toggle expanded state
function togglePanel() {
  expanded.value = !expanded.value;
}

// Add a new chart by type
function addNewChart(type) {
  // Emit event to parent to handle the chart creation
  emit('add-chart', { type });
}
</script>

<style scoped>
.chart-panel {
  width: 100%;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, rgba(44, 228, 207, 0.1), rgba(37, 123, 223, 0.1));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 20px;
  font-weight: 500;
  color: #232323;
  margin: 0;
  margin-bottom: 4px;
}

.panel-description {
  margin: 0;
  font-size: 14px;
  color: #676767;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-action {
  background: none;
  border: none;
  color: #676767;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.panel-action:hover {
  color: #257BDF;
  background-color: rgba(37, 123, 223, 0.1);
}

.panel-action .icon {
  font-size: 16px;
}

.panel-content {
  padding: 16px;
  max-height: 1200px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-grid.single-chart {
  grid-template-columns: 1fr;
}

.chart-grid-item {
  min-width: 0; /* Fix for children overflowing grid cells */
}

.chart-grid-item.width-full {
  grid-column: 1 / -1;
}

.add-chart-section {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.add-chart-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: #232323;
  margin: 0 0 16px 0;
}

.chart-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-type-button {
  background: none;
  border: none;
  color: #676767;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.chart-type-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 123, 223, 0.2);
  color: #257BDF;
}

.button-icon {
  font-size: 18px;
  margin-right: 8px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-type-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .panel-actions {
    margin-top: 8px;
    align-self: flex-end;
  }
}
</style> 