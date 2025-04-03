import axios from 'axios';
import dataGovSgService from './dataGovSgService';

/**
 * Service to handle AI-driven data queries
 */
export default {
  /**
   * Parse a user query to extract dataset information and query parameters
   * @param {string} query - The user's query text
   * @returns {Object} Extracted dataset info and parameters
   */
  parseUserQuery(query) {
    // Look for keywords related to Singapore demographics
    const isDemographicsQuery = /demographics|population|residents|citizens|households|age|gender|education|income/i.test(query);
    
    // Look for time-related keywords
    const hasTimeComponent = /trend|over time|year|annual|monthly|historical/i.test(query);
    
    // Look for comparison keywords
    const isComparisonQuery = /compare|comparison|versus|vs|difference|between/i.test(query);
    
    // Look for visualization type hints
    const visualizationType = 
      /pie chart|pie/i.test(query) ? 'pie' :
      /bar chart|bar graph|bar/i.test(query) ? 'bar' :
      /line chart|line graph|trend|over time/i.test(query) ? 'line' :
      /scatter plot|scatter/i.test(query) ? 'dot' :
      'bar'; // Default to bar
    
    return {
      topic: isDemographicsQuery ? 'demographics' : 'general',
      timeComponent: hasTimeComponent,
      isComparison: isComparisonQuery,
      visualizationType,
      rawQuery: query
    };
  },
  
  /**
   * Get recommended dataset based on query analysis
   * @param {Object} queryAnalysis - The analyzed query
   * @returns {Promise<Object>} The recommended dataset
   */
  async getRecommendedDataset(queryAnalysis) {
    // Get all recommended datasets
    const allDatasets = await dataGovSgService.getRecommendedDatasets();
    
    // Filter based on query analysis
    if (queryAnalysis.topic === 'demographics') {
      return allDatasets.find(dataset => 
        dataset.name.toLowerCase().includes('resident') || 
        dataset.name.toLowerCase().includes('population') ||
        dataset.name.toLowerCase().includes('demographic')
      ) || allDatasets[0]; // Fallback to first dataset
    }
    
    // Default to first dataset if no match
    return allDatasets[0];
  },
  
  /**
   * Process a data query and return visualization data
   * @param {string} query - The user's query
   * @returns {Promise<Object>} Data visualization response
   */
  async processDataQuery(query) {
    try {
      // Parse the query to understand what the user is asking for
      const queryAnalysis = this.parseUserQuery(query);
      
      // Get appropriate dataset based on query
      const recommendedDataset = await this.getRecommendedDataset(queryAnalysis);
      
      // Fetch dataset metadata
      const metadata = await dataGovSgService.fetchDatasetMetadata(recommendedDataset.datasetId);
      
      // Fetch dataset data
      const data = await dataGovSgService.fetchDatasetData(recommendedDataset.datasetId, {
        limit: 100 // Limit to 100 records for performance
      });
      
      // Select appropriate fields based on query and data structure
      let xField, yField;
      
      if (metadata && metadata.columnMetadata && metadata.columnMetadata.order) {
        const columns = metadata.columnMetadata.order;
        
        // For time series data, look for date/year/time columns
        if (queryAnalysis.timeComponent) {
          xField = columns.find(col => 
            /year|date|time|month|quarter/i.test(col)
          ) || columns[0];
        } else {
          // For categorical data, use a category column
          xField = columns.find(col => 
            /category|type|group|class|level/i.test(col)
          ) || columns[0];
        }
        
        // For the y-axis, prefer numeric columns
        yField = columns.find(col => 
          !col.includes(xField) && 
          (data[0] && typeof data[0][col] === 'number')
        ) || columns.find(col => col !== xField) || columns[1];
      } else {
        // Fallback to first two columns if metadata not available
        const sampleKeys = data.length > 0 ? Object.keys(data[0]) : [];
        xField = sampleKeys[0] || 'x';
        yField = sampleKeys[1] || 'y';
      }
      
      return {
        dataset: recommendedDataset,
        metadata,
        data,
        visualization: {
          type: queryAnalysis.visualizationType,
          xField,
          yField,
          title: `${metadata?.name || 'Data'} Visualization`,
          description: `Visualization of ${metadata?.name || 'data'} based on your query: "${query}"`
        },
        rawQuery: query
      };
    } catch (error) {
      console.error('Error processing data query:', error);
      throw new Error(`Failed to process data query: ${error.message}`);
    }
  },
  
  /**
   * Generate a response for the AI including visualization
   * @param {string} query - The user's query
   * @returns {Promise<Object>} AI response with visualization data
   */
  async generateAIResponse(query) {
    try {
      const visualizationData = await this.processDataQuery(query);
      
      // Create a human-readable explanation of the data
      let explanation = `I found data about "${visualizationData.metadata?.name || 'Singapore data'}" that might help answer your question.`;
      
      if (visualizationData.data.length > 0) {
        explanation += ` The visualization shows the relationship between ${visualizationData.visualization.xField} and ${visualizationData.visualization.yField}.`;
      } else {
        explanation += ` However, I couldn't retrieve enough data to create a good visualization.`;
      }
      
      // Add a note about the data source
      explanation += ` This data comes from data.gov.sg.`;
      
      return {
        answer: explanation,
        visualization: visualizationData.visualization,
        datasetId: visualizationData.dataset.datasetId,
        data: visualizationData.data,
        chartOptions: {
          xKey: visualizationData.visualization.xField,
          yKey: visualizationData.visualization.yField,
          type: visualizationData.visualization.type
        }
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        answer: `I'm sorry, I couldn't find relevant data to answer your question. Error: ${error.message}`,
        error: true
      };
    }
  }
} 