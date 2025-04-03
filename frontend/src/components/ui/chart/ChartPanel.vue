<template>
  <div class="chart-panel" :class="{ 'expanded': expanded }">
    <div class="panel-header">
      <div class="panel-title-section">
        <h2 class="panel-title">{{ title }}</h2>
        <p class="panel-description" v-if="description">{{ description }}</p>
      </div>
      <div class="panel-actions">
        <button class="panel-action" @click="togglePanel" :title="expanded ? 'Collapse' : 'Expand'">
          <span class="material-icons">{{ expanded ? 'expand_less' : 'expand_more' }}</span>
        </button>
        <button class="panel-action" @click="$emit('close')" title="Close">
          <span class="material-icons">close</span>
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
            :data="chart.data"
            :title="chart.title"
            :options="chart.options || {}"
            :showCode="chart.showCode || false"
            :showClose="charts.length > 1"
            @close="removeChart(index)"
            @chart-rendered="onChartRendered(index)"
          />
        </div>
      </div>
      
      <div v-if="showAddChart" class="add-chart-section">
        <h3>Add a new chart</h3>
        <button class="add-chart-button" @click="addNewBarChart">
          <span class="button-icon">+</span>
          <span>Add Bar Chart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import ChartVisualizer from './ChartVisualizer.vue';

// Import only the icon that is used
import barChartIcon from '../../../assets/icons/bar-chart.svg';

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

// Toggle expanded state
function togglePanel() {
  expanded.value = !expanded.value;
}

// Remove a chart by index
function removeChart(index) {
  charts.value.splice(index, 1);
}

// Add a new chart (always bar chart)
function addNewBarChart() {
  // Emit event to parent to handle the chart creation
  emit('add-chart', { type: 'bar' });
}

// Handle chart rendered event
function onChartRendered(index) {
  emit('chart-rendered', { index, chart: charts.value[index] });
}
</script>

<style scoped>
.chart-panel {
  width: 100%;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
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

.add-chart-button {
  background: none;
  border: none;
  color: #676767;
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.add-chart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 123, 223, 0.2);
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