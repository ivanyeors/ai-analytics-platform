<template>
  <div class="analytics-dashboard">
    <div class="dashboard-header">
      <h1>Analytics Dashboard</h1>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn">
          <span class="material-icons">refresh</span> 
          Refresh
        </button>
        <button @click="generateData" class="generate-btn">
          <span class="material-icons">add_circle</span>
          Generate Sample Data
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      Loading data...
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="dashboard-content" v-if="!loading">
      <div class="chart-section">
        <h2>Data Visualization</h2>
        <div class="chart-controls">
          <div class="chart-type-selector">
            <label for="chart-type">Chart Type:</label>
            <select id="chart-type" v-model="chartType">
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="dot">Scatter Plot</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
          
          <div class="filter-controls">
            <label for="category-filter">Category:</label>
            <select id="category-filter" v-model="selectedCategory">
              <option value="all">All Categories</option>
              <option v-for="category in categories" :key="category.name" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="chart-container">
          <observable-plot
            :data="filteredData"
            :type="chartType"
            :title="chartTitle"
            :options="chartOptions"
          />
        </div>
      </div>
      
      <div class="code-editor-section">
        <code-editor
          v-model:code="chartCode"
          :data="filteredData"
          @execute="executeChartCode"
        />
        
        <div v-if="customChart" class="custom-chart-container">
          <h3>Custom Chart</h3>
          <div ref="customChartContainer"></div>
        </div>
      </div>
      
      <div class="data-table">
        <h2>Data Table</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in pagedData" :key="point.id">
              <td>{{ point.id }}</td>
              <td>{{ formatTimestamp(point.timestamp) }}</td>
              <td>
                <span class="category-badge" :style="{ backgroundColor: getCategoryColor(point.category) }">
                  {{ point.category }}
                </span>
              </td>
              <td>{{ point.value.toFixed(2) }}</td>
              <td>
                <button @click="deleteDataPoint(point.id)" class="delete-btn">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">
            <span class="material-icons">chevron_left</span>
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useAnalyticsStore } from '../stores/analytics';
import ObservablePlot from '../components/ObservablePlot.vue';
import CodeEditor from '../components/CodeEditor.vue';
import * as Plot from '@observablehq/plot';

export default defineComponent({
  name: 'AnalyticsDashboard',
  
  components: {
    ObservablePlot,
    CodeEditor
  },
  
  setup() {
    const analyticsStore = useAnalyticsStore();
    const loading = computed(() => analyticsStore.loading);
    const error = computed(() => analyticsStore.error);
    
    // Chart configuration
    const chartType = ref('line');
    const selectedCategory = ref('all');
    const chartCode = ref('// Edit this code to modify the chart\nPlot.plot({\n  marks: [\n    Plot.line(data, {x: "timestamp", y: "value", stroke: "category"})\n  ],\n  grid: true\n})');
    const customChartContainer = ref(null);
    const customChart = ref(null);
    
    // Pagination for data table
    const itemsPerPage = 10;
    const currentPage = ref(1);
    
    // Computed properties
    const dataPoints = computed(() => analyticsStore.formattedDataPoints);
    const categories = computed(() => analyticsStore.categories);
    
    const filteredData = computed(() => {
      if (selectedCategory.value === 'all') {
        return dataPoints.value;
      }
      return dataPoints.value.filter(point => point.category === selectedCategory.value);
    });
    
    const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));
    
    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredData.value.slice(start, end);
    });
    
    const chartTitle = computed(() => {
      return selectedCategory.value === 'all' 
        ? 'All Categories' 
        : `Category: ${selectedCategory.value}`;
    });
    
    const chartOptions = computed(() => {
      return {
        xLabel: 'Time',
        yLabel: 'Value'
      };
    });
    
    // Methods
    const refreshData = async () => {
      await analyticsStore.fetchDataPoints();
      await analyticsStore.fetchCategories();
    };
    
    const generateData = async () => {
      await analyticsStore.generateSampleData(50);
    };
    
    const deleteDataPoint = async (id) => {
      // This would typically call an API to delete the data point
      console.log(`Delete data point ${id}`);
      // Then refresh the data
      await refreshData();
    };
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };
    
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
    
    const getCategoryColor = (categoryName) => {
      const category = categories.value.find(c => c.name === categoryName);
      return category ? category.color : '#aaaaaa';
    };
    
    const executeChartCode = ({ executor }) => {
      if (!customChartContainer.value) return;
      
      try {
        // Clear previous chart
        if (customChartContainer.value.firstChild) {
          customChartContainer.value.innerHTML = '';
        }
        
        // Execute the code and get the chart
        const chart = executor(Plot, filteredData.value);
        
        // Append the chart to the container
        customChartContainer.value.appendChild(chart);
        customChart.value = chart;
      } catch (error) {
        console.error('Error executing chart code:', error);
      }
    };
    
    // Initialize data on mount
    onMounted(async () => {
      await analyticsStore.initialize();
    });
    
    // Watch for changes in filtered data and update custom chart if needed
    watch([filteredData, chartType], () => {
      if (customChart.value && customChartContainer.value) {
        executeChartCode({ 
          executor: new Function('Plot', 'data', `return ${chartCode.value}`)
        });
      }
    });
    
    return {
      loading,
      error,
      chartType,
      selectedCategory,
      chartCode,
      customChartContainer,
      customChart,
      currentPage,
      totalPages,
      dataPoints,
      categories,
      filteredData,
      pagedData,
      chartTitle,
      chartOptions,
      refreshData,
      generateData,
      deleteDataPoint,
      prevPage,
      nextPage,
      formatTimestamp,
      getCategoryColor,
      executeChartCode
    };
  }
});
</script>

<style scoped>
.analytics-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.chart-section, .code-editor-section, .data-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-container {
  height: 400px;
}

.custom-chart-container {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f9f9f9;
  font-weight: 600;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #e5e5e5;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn, .generate-btn {
  background-color: #2196f3;
  color: white;
}

.refresh-btn:hover, .generate-btn:hover {
  background-color: #1976d2;
}

.delete-btn {
  background-color: transparent;
  color: #f44336;
  padding: 4px;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.error-message {
  padding: 12px;
  margin: 12px 0;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr 1fr;
  }
  
  .data-table {
    grid-column: 1 / -1;
  }
}
</style> 