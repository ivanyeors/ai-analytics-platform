<template>
  <div class="sg-data-container">
    <h2>Singapore Data Visualization</h2>
    
    <div class="controls">
      <div class="control-group">
        <label for="dataset-select">Select Dataset:</label>
        <select id="dataset-select" v-model="selectedDatasetId" @change="resetData">
          <option value="">-- Select a dataset --</option>
          <optgroup label="Recommended Datasets">
            <option v-for="dataset in recommendedDatasets" :key="dataset.datasetId" :value="dataset.datasetId">
              {{ dataset.name }}
            </option>
          </optgroup>
          <optgroup label="All Datasets" v-if="datasets.length > recommendedDatasets.length">
            <option v-for="dataset in filteredDatasets" :key="dataset.datasetId" :value="dataset.datasetId">
              {{ dataset.name }}
            </option>
          </optgroup>
        </select>
      </div>
      
      <div class="control-group" v-if="datasetMetadata && datasetMetadata.columnMetadata">
        <label for="x-field">X-Axis Field:</label>
        <select id="x-field" v-model="xField" @change="updateChartOptions">
          <option v-for="col in columnOptions" :key="col" :value="col">{{ col }}</option>
        </select>
      </div>
      
      <div class="control-group" v-if="datasetMetadata && datasetMetadata.columnMetadata">
        <label for="y-field">Y-Axis Field:</label>
        <select id="y-field" v-model="yField" @change="updateChartOptions">
          <option v-for="col in columnOptions" :key="col" :value="col">{{ col }}</option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="chart-type">Chart Type:</label>
        <select id="chart-type" v-model="chartType" @change="updateChartOptions">
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="dot">Scatter</option>
          <option value="area">Area</option>
        </select>
      </div>
      
      <div class="control-group">
        <button @click="fetchDatasetData" :disabled="!selectedDatasetId || loadingData">
          {{ loadingData ? 'Loading...' : 'Load Data' }}
        </button>
      </div>
      
      <div class="control-group" v-if="datasetData.length > 0">
        <button @click="generateAIVisualization" :disabled="aiGenerating" class="ai-button">
          {{ aiGenerating ? 'AI Generating...' : 'AI Suggest Visualization' }}
        </button>
      </div>
      
      <div class="control-group">
        <button @click="showDebugPanel = !showDebugPanel" class="debug-button">
          {{ showDebugPanel ? 'Hide Debug Info' : 'Show Debug Info' }}
        </button>
      </div>
    </div>
    
    <!-- Debug Panel -->
    <div v-if="showDebugPanel" class="debug-panel">
      <h3>Debug Information</h3>
      <div class="debug-info">
        <pre>{{ debugInfo }}</pre>
      </div>
      <div class="debug-actions">
        <button @click="retryWithDirectAPI" class="retry-btn">Retry Using Direct API</button>
        <button @click="clearAndReset" class="clear-btn">Clear & Reset</button>
      </div>
      <div class="debug-section">
        <h4>Data Sample</h4>
        <pre v-if="datasetData.length">{{ JSON.stringify(datasetData[0], null, 2) }}</pre>
        <p v-else>No data loaded</p>
      </div>
      <div class="debug-section">
        <h4>Chart Configuration</h4>
        <ul>
          <li><strong>X Field:</strong> {{ xField }}</li>
          <li><strong>Y Field:</strong> {{ yField }}</li>
          <li><strong>Chart Type:</strong> {{ chartType }}</li>
          <li><strong>Data Length:</strong> {{ datasetData.length }}</li>
        </ul>
      </div>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="loadingData" class="loading-message">Loading dataset data...</div>
    
    <div v-if="!selectedDatasetId && !loadingData" class="instructions">
      Select a dataset from the dropdown to begin. Recommended datasets are pre-selected for optimal visualization.
    </div>
    
    <div v-if="aiSuggestion" class="ai-suggestion">
      <div class="ai-header">
        <h3>AI Suggestion</h3>
        <button @click="applyAISuggestion" class="apply-btn">Apply</button>
        <button @click="dismissAISuggestion" class="dismiss-btn">Dismiss</button>
      </div>
      <p>{{ aiSuggestion.explanation }}</p>
      <ul class="suggestion-details">
        <li><strong>Recommended Chart Type:</strong> {{ aiSuggestion.chartType }}</li>
        <li><strong>X-Axis:</strong> {{ aiSuggestion.xField }}</li>
        <li><strong>Y-Axis:</strong> {{ aiSuggestion.yField }}</li>
        <li v-if="aiSuggestion.additionalOptions"><strong>Additional Options:</strong> {{ aiSuggestion.additionalOptions }}</li>
      </ul>
    </div>
    
    <div v-if="datasetData.length && !loadingData" class="chart-wrapper">
      <ObservablePlot
        :data="datasetData"
        :type="chartType"
        :xKey="xField"
        :yKey="yField"
        :title="chartTitle"
        :options="chartOptions"
        :width="800"
        :height="500"
        :debugMode="true"
      />
    </div>
    
    <div v-if="datasetData.length" class="data-preview">
      <h3>Data Preview ({{ datasetData.length }} records)</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in datasetData.slice(0, 10)" :key="index">
              <td v-for="header in tableHeaders" :key="`${index}-${header}`">{{ row[header] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="note" v-if="datasetData.length > 10">Showing first 10 records of {{ datasetData.length }}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import ObservablePlot from './ObservablePlot.vue';
import dataGovSgService from '../utils/dataGovSgService';

export default defineComponent({
  name: 'SingaporeDataVis',
  
  components: {
    ObservablePlot
  },
  
  setup() {
    // State
    const datasets = ref([]);
    const recommendedDatasets = ref([]);
    const selectedDatasetId = ref('');
    const datasetMetadata = ref(null);
    const datasetData = ref([]);
    const loadingDatasets = ref(false);
    const loadingMetadata = ref(false);
    const loadingData = ref(false);
    const error = ref('');
    const xField = ref('');
    const yField = ref('');
    const chartType = ref('line');
    const chartOptions = ref({});
    const aiGenerating = ref(false);
    const aiSuggestion = ref(null);
    const debugInfo = ref('');
    const showDebugPanel = ref(false);
    const useDirectAPI = ref(false);
    
    // Computed properties
    const filteredDatasets = computed(() => {
      // Filter out recommended datasets from all datasets to avoid duplication
      const recommendedIds = recommendedDatasets.value.map(d => d.datasetId);
      return datasets.value.filter(d => !recommendedIds.includes(d.datasetId));
    });
    
    const columnOptions = computed(() => {
      if (!datasetMetadata.value || !datasetMetadata.value.columnMetadata) return [];
      return datasetMetadata.value.columnMetadata.order || [];
    });
    
    const tableHeaders = computed(() => {
      if (!datasetData.value.length) return [];
      return Object.keys(datasetData.value[0]);
    });
    
    const chartTitle = computed(() => {
      if (!datasetMetadata.value) return '';
      return datasetMetadata.value.name || 'Singapore Dataset Visualization';
    });
    
    // Methods
    const fetchDatasets = async () => {
      loadingDatasets.value = true;
      error.value = '';
      debugInfo.value = 'Fetching datasets...';
      
      try {
        // First get recommended datasets
        recommendedDatasets.value = await dataGovSgService.getRecommendedDatasets();
        debugInfo.value += `\nFetched ${recommendedDatasets.value.length} recommended datasets`;
        
        // Then get all datasets
        datasets.value = await dataGovSgService.fetchDatasets();
        debugInfo.value += `\nFetched ${datasets.value.length} total datasets`;
      } catch (err) {
        error.value = `Error fetching datasets: ${err.message}`;
        debugInfo.value += `\nError fetching datasets: ${err.message}`;
        console.error('Error fetching datasets:', err);
      } finally {
        loadingDatasets.value = false;
      }
    };
    
    const fetchDatasetMetadata = async (datasetId) => {
      if (!datasetId) return;
      
      loadingMetadata.value = true;
      error.value = '';
      debugInfo.value += `\nFetching metadata for dataset ${datasetId}...`;
      
      try {
        datasetMetadata.value = await dataGovSgService.fetchDatasetMetadata(datasetId);
        debugInfo.value += '\nMetadata fetched successfully';
        
        // Set default fields if available
        if (datasetMetadata.value && datasetMetadata.value.columnMetadata && 
            datasetMetadata.value.columnMetadata.order && 
            datasetMetadata.value.columnMetadata.order.length >= 2) {
          xField.value = datasetMetadata.value.columnMetadata.order[0];
          yField.value = datasetMetadata.value.columnMetadata.order[1];
          debugInfo.value += `\nDefault fields set: x=${xField.value}, y=${yField.value}`;
        } else {
          debugInfo.value += '\nNo column metadata available or insufficient columns';
        }
      } catch (err) {
        error.value = `Error fetching dataset metadata: ${err.message}`;
        debugInfo.value += `\nError fetching metadata: ${err.message}`;
        console.error('Error fetching dataset metadata:', err);
      } finally {
        loadingMetadata.value = false;
      }
    };
    
    const fetchDatasetData = async () => {
      if (!selectedDatasetId.value) return;
      
      loadingData.value = true;
      error.value = '';
      debugInfo.value = `Fetching data for dataset ${selectedDatasetId.value}...`;
      
      try {
        // First, fetch metadata if not already fetched
        if (!datasetMetadata.value) {
          await fetchDatasetMetadata(selectedDatasetId.value);
        }
        
        // Fetch the actual data
        const records = await dataGovSgService.fetchDatasetData(selectedDatasetId.value, {
          limit: 100 // Limiting to 100 records for better performance
        });
        
        debugInfo.value += `\nFetched ${records.length} records`;
        
        if (records.length > 0) {
          datasetData.value = records;
          
          // Log the first record for debugging
          debugInfo.value += `\nSample record: ${JSON.stringify(records[0])}`;
          
          // Set default fields if not already set
          if (!xField.value && !yField.value) {
            const keys = Object.keys(records[0]);
            
            // Better detection of numeric fields
            const numericKeys = keys.filter(key => typeof records[0][key] === 'number');
            debugInfo.value += `\nNumeric keys found: ${numericKeys.join(', ')}`;
            
            if (numericKeys.length > 0) {
              // Find a good default for X-axis (time-based or first non-numeric)
              const timeKeys = keys.filter(key => 
                /date|time|year|month|day/i.test(key.toLowerCase()));
              
              if (timeKeys.length > 0) {
                xField.value = timeKeys[0];
              } else {
                // First non-numeric or first field if all numeric
                xField.value = keys.find(key => typeof records[0][key] !== 'number') || keys[0];
              }
              
              // First numeric field for Y-axis
              yField.value = numericKeys[0];
              
              debugInfo.value += `\nAuto-selected fields: x=${xField.value}, y=${yField.value}`;
            } else {
              // Default to first two fields if no numeric fields
              xField.value = keys[0];
              yField.value = keys.length > 1 ? keys[1] : keys[0];
              debugInfo.value += `\nNo numeric fields found, using defaults: x=${xField.value}, y=${yField.value}`;
            }
          }
          
          updateChartOptions();
          debugInfo.value += `\nChart options updated: ${JSON.stringify(chartOptions.value)}`;
        } else {
          error.value = 'No records found for this dataset';
          debugInfo.value += '\nNo records found';
        }
        
        // Force refresh of the chart
        const tempData = [...datasetData.value];
        datasetData.value = [];
        setTimeout(() => {
          datasetData.value = tempData;
          debugInfo.value += '\nForced chart refresh';
        }, 50);
        
      } catch (err) {
        error.value = `Error fetching dataset data: ${err.message}`;
        debugInfo.value += `\nError fetching data: ${err.message}`;
        console.error('Error fetching dataset data:', err);
      } finally {
        loadingData.value = false;
      }
    };
    
    const retryWithDirectAPI = async () => {
      useDirectAPI.value = true;
      debugInfo.value += '\nRetrying with direct API...';
      await fetchDatasetData();
    };
    
    const clearAndReset = () => {
      datasetData.value = [];
      debugInfo.value = 'Data cleared and reset';
      error.value = '';
    };
    
    const resetData = () => {
      datasetData.value = [];
      datasetMetadata.value = null;
      error.value = '';
      xField.value = '';
      yField.value = '';
      dismissAISuggestion();
      debugInfo.value = 'Data reset';
      
      if (selectedDatasetId.value) {
        fetchDatasetMetadata(selectedDatasetId.value);
      }
    };
    
    const updateChartOptions = () => {
      chartOptions.value = {
        xLabel: xField.value,
        yLabel: yField.value,
        marks: []
      };
      debugInfo.value += `\nChart options updated - x: ${xField.value}, y: ${yField.value}`;
      
      // Log data for debugging
      if (datasetData.value.length > 0) {
        const xValues = datasetData.value.map(d => d[xField.value]);
        const yValues = datasetData.value.map(d => d[yField.value]);
        debugInfo.value += `\nX values sample: ${xValues.slice(0, 3).join(', ')}...`;
        debugInfo.value += `\nY values sample: ${yValues.slice(0, 3).join(', ')}...`;
      }
    };
    
    // Watch for changes that should trigger chart updates
    watch([xField, yField, chartType], () => {
      updateChartOptions();
    });
    
    // AI-assisted visualization functions
    const generateAIVisualization = async () => {
      if (!datasetData.value.length) return;
      
      aiGenerating.value = true;
      error.value = '';
      
      try {
        // In a real implementation, you'd call an AI service here
        // For this demo, we'll simulate an AI suggestion with a timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Analyze the data and make a recommendation
        const dataAnalysis = analyzeDataset(datasetData.value);
        
        // Generate the suggestion
        aiSuggestion.value = {
          chartType: dataAnalysis.recommendedChartType,
          xField: dataAnalysis.xField,
          yField: dataAnalysis.yField,
          explanation: dataAnalysis.explanation,
          additionalOptions: dataAnalysis.additionalDetails
        };
      } catch (err) {
        error.value = `Error generating AI visualization: ${err.message}`;
        console.error('Error generating AI visualization:', err);
      } finally {
        aiGenerating.value = false;
      }
    };
    
    const analyzeDataset = (data) => {
      // This is a simplified data analysis function that would normally be handled by an AI
      const headers = Object.keys(data[0]);
      
      // Find numeric and non-numeric columns
      const numericColumns = headers.filter(header => 
        typeof data[0][header] === 'number');
      
      const nonNumericColumns = headers.filter(header => 
        typeof data[0][header] !== 'number');
      
      // Determine if we have time-series data
      const timeColumns = nonNumericColumns.filter(col => 
        /date|time|year|month|day/i.test(col));
      
      let recommendation = {
        xField: '',
        yField: '',
        recommendedChartType: 'bar',
        explanation: '',
        additionalDetails: ''
      };
      
      // If we have time-series data, recommend a line chart
      if (timeColumns.length > 0 && numericColumns.length > 0) {
        recommendation.xField = timeColumns[0];
        recommendation.yField = numericColumns[0];
        recommendation.recommendedChartType = 'line';
        recommendation.explanation = `This dataset appears to contain time-series data (${timeColumns[0]}). A line chart would be ideal to show trends over time for ${numericColumns[0]}.`;
      } 
      // If we have categorical data and numeric data, recommend a bar chart
      else if (nonNumericColumns.length > 0 && numericColumns.length > 0) {
        recommendation.xField = nonNumericColumns[0];
        recommendation.yField = numericColumns[0];
        recommendation.recommendedChartType = 'bar';
        recommendation.explanation = `This dataset contains categorical data (${nonNumericColumns[0]}) and numeric values (${numericColumns[0]}). A bar chart would effectively compare ${numericColumns[0]} across different ${nonNumericColumns[0]} categories.`;
      }
      // If we have multiple numeric columns, recommend a scatter plot
      else if (numericColumns.length >= 2) {
        recommendation.xField = numericColumns[0];
        recommendation.yField = numericColumns[1];
        recommendation.recommendedChartType = 'dot';
        recommendation.explanation = `This dataset has multiple numeric columns. A scatter plot would help identify correlations between ${numericColumns[0]} and ${numericColumns[1]}.`;
        recommendation.additionalDetails = 'Consider analyzing the correlation coefficient to quantify the relationship.';
      }
      // Fallback recommendation
      else {
        recommendation.xField = headers[0];
        recommendation.yField = headers.length > 1 ? headers[1] : headers[0];
        recommendation.recommendedChartType = 'bar';
        recommendation.explanation = 'Based on the data structure, a basic bar chart is recommended as a starting point. You may want to experiment with different visualizations depending on your analysis goals.';
      }
      
      return recommendation;
    };
    
    const applyAISuggestion = () => {
      if (!aiSuggestion.value) return;
      
      xField.value = aiSuggestion.value.xField;
      yField.value = aiSuggestion.value.yField;
      chartType.value = aiSuggestion.value.chartType;
      
      updateChartOptions();
      dismissAISuggestion();
    };
    
    const dismissAISuggestion = () => {
      aiSuggestion.value = null;
    };
    
    // Initialize
    onMounted(() => {
      fetchDatasets();
    });
    
    return {
      datasets,
      recommendedDatasets,
      filteredDatasets,
      selectedDatasetId,
      datasetMetadata,
      datasetData,
      loadingDatasets,
      loadingMetadata,
      loadingData,
      error,
      xField,
      yField,
      chartType,
      chartOptions,
      columnOptions,
      tableHeaders,
      chartTitle,
      fetchDatasetData,
      resetData,
      updateChartOptions,
      debugInfo,
      showDebugPanel,
      retryWithDirectAPI,
      clearAndReset,
      // AI-related
      aiGenerating,
      aiSuggestion,
      generateAIVisualization,
      applyAISuggestion,
      dismissAISuggestion
    };
  }
});
</script>

<style scoped>
.sg-data-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

label {
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
}

select, button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.ai-button {
  background-color: #2196F3;
}

.ai-button:hover {
  background-color: #0b7dda;
}

.debug-button {
  background-color: #ff9800;
}

.debug-button:hover {
  background-color: #f57c00;
}

.debug-panel {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.debug-info {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.retry-btn {
  background-color: #2196F3;
}

.clear-btn {
  background-color: #f44336;
}

.debug-section {
  margin-top: 15px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.debug-section pre {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 8px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.loading-message, .instructions {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.chart-wrapper {
  margin-bottom: 24px;
}

.ai-suggestion {
  background-color: #e3f2fd;
  border-left: 4px solid #2196F3;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.ai-header h3 {
  margin: 0;
  flex-grow: 1;
}

.ai-header button {
  padding: 5px 10px;
  margin-left: 10px;
  font-size: 13px;
}

.apply-btn {
  background-color: #2196F3;
}

.apply-btn:hover {
  background-color: #0b7dda;
}

.dismiss-btn {
  background-color: #f44336;
}

.dismiss-btn:hover {
  background-color: #d32f2f;
}

.suggestion-details {
  list-style-type: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.suggestion-details li {
  margin-bottom: 5px;
}

.data-preview {
  margin-top: 24px;
}

.data-table-wrapper {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table th {
  background-color: #f8f8f8;
  position: sticky;
  top: 0;
}

.data-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.note {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.debug-button {
  background-color: #ff9800;
}

.debug-button:hover {
  background-color: #f57c00;
}

.debug-panel {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.debug-info {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.debug-section {
  margin-top: 15px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.debug-section pre {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 8px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 