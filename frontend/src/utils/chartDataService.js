/**
 * Chart Data Service
 * Provides methods to fetch and generate chart data
 * Simplified to only support bar charts for the demo
 */

// Sample data sets - keeping only data relevant for bar charts
const sampleData = {
  // Sample medical data for bar charts
  medicalStats: [
    { category: 'Heart Disease', value: 42 },
    { category: 'Diabetes', value: 38 },
    { category: 'Cancer', value: 35 },
    { category: 'Stroke', value: 28 },
    { category: 'Alzheimer\'s', value: 23 },
    { category: 'Flu', value: 12 }
  ]
};

// Common chart options - simplified for bar charts only
const chartOptions = {
  bar: {
    xKey: 'category',
    yKey: 'value',
    color: '#257BDF',
    title: null
  }
};

/**
 * Generate random bar chart data
 * @param {number} points - Number of data points to generate
 * @returns {Array} - Array of data objects
 */
function generateRandomData(points = 6) {
  // Limit number of points to ensure good display in chat bubbles
  const actualPoints = Math.min(points, 6);
  
  // Medical condition names
  const medicalConditions = [
    'Heart Disease', 'Diabetes', 'Cancer', 'Stroke', 
    'Alzheimer\'s', 'Flu', 'Asthma', 'Hypertension'
  ];
  
  return Array.from({ length: actualPoints }, (_, i) => ({
    category: medicalConditions[i],
    value: Math.floor(Math.random() * 50) + 10
  }));
}

/**
 * Get sample data for a bar chart
 * @returns {Object} - Data and options for the bar chart
 */
function getSampleData() {
  // Always return the medical stats data
  const data = [...sampleData.medicalStats];
  const title = 'Prevalence of Medical Conditions (%)';
  const color = '#257BDF';
  
  // Create options object with appropriate configuration
  const options = {
    ...chartOptions.bar,
    title: title,
    color: color
  };
  
  return { data, options };
}

/**
 * Extract chart data from AI text response
 * @param {string} text - AI response text
 * @returns {Object} - Extracted chart data and configuration
 */
function extractChartDataFromText(text) {
  console.log("Extracting chart data from text:", text);
  
  // Default empty result
  const result = {
    type: 'bar',
    data: [],
    title: 'Generated Chart',
    explanation: '',
    options: {
      ...chartOptions.bar,
      color: '#257BDF'
    }
  };
  
  try {
    // Check if there's JSON in the response (some AI models might include JSON)
    const jsonMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*"data"[\s\S]*})/i);
    if (jsonMatch) {
      try {
        // Try to parse any JSON found in the response
        const jsonData = JSON.parse(jsonMatch[1] || jsonMatch[2]);
        if (jsonData.data && Array.isArray(jsonData.data)) {
          return {
            type: jsonData.chartType || 'bar',
            data: jsonData.data,
            title: jsonData.title || 'Generated Chart',
            explanation: jsonData.explanation || text.replace(jsonMatch[0], '').trim(),
            options: {
              ...chartOptions.bar,
              ...jsonData.options,
              color: jsonData.options?.color || '#257BDF'
            }
          };
        }
      } catch (e) {
        console.warn("Failed to parse JSON in AI response:", e);
      }
    }
    
    // Pattern matching for percentages or numbers with labels
    const numberPattern = /(\d+(?:\.\d+)?)\s*(?:%|percent|percentage)?\s+(?:of|for|in)?\s+([A-Za-z][A-Za-z\s]+?)(?:,|\.|$)/g;
    const matches = [...text.matchAll(numberPattern)];
    
    // If we found at least 2 matches for potential chart data
    if (matches.length >= 2) {
      // Get title from the text - first sentence usually contains context
      const titleMatch = text.match(/(?:^|(?<=[.!?])\s+)[^.!?]*(?:chart|graph|visualization|distribution|comparison|breakdown|analysis|statistics)[^.!?]*[.!?]/i);
      if (titleMatch) {
        result.title = titleMatch[0].trim().replace(/[.!?]$/, '');
      }
      
      // Extract explanation - everything not used for the chart
      result.explanation = text;
      
      // Extract data points from matches
      result.data = matches.map(match => {
        return {
          category: match[2].trim(),
          value: parseFloat(match[1])
        };
      });
      
      // Limit to 8 data points to ensure the chart is readable
      if (result.data.length > 8) {
        result.data = result.data.slice(0, 8);
      }
      
      return result;
    }
    
    // If no structured data found, fall back to sample data
    console.log("No structured data found in AI response, using sample data");
    const { data, options } = getSampleData();
    return {
      type: 'bar',
      data: data,
      title: 'Generated Chart (Sample Data)',
      explanation: text,
      options: options
    };
    
  } catch (error) {
    console.error("Error extracting chart data from text:", error);
    // Return sample data as fallback
    const { data, options } = getSampleData();
    return {
      type: 'bar',
      data: data,
      title: 'Fallback Chart',
      explanation: text,
      options: options
    };
  }
}

/**
 * Process natural language query and generate bar chart data
 * Always returns bar chart regardless of query content
 * @param {string} query - User's natural language query
 * @returns {Object} - Generated bar chart data and configuration
 */
function processChartQuery(query) {
  // Always return medical data regardless of query
  const data = [...sampleData.medicalStats];
  const title = null;
  const color = '#257BDF';
  
  // Return bar chart configuration with responsive options
  return {
    type: 'bar',
    data: data,
    title: title,
    options: {
      ...chartOptions.bar,
      title: null,
      color: color,
      // Add additional configuration that enhances display in chat bubbles
      responsive: true
    }
  };
}

// Export the methods
export default {
  getSampleData,
  processChartQuery,
  generateRandomData,
  extractChartDataFromText
};

// Utility function for validating chart data
export const validateChartData = (chartData) => {
  if (!chartData) return false;
  if (!Array.isArray(chartData.data)) return false;
  if (chartData.data.length === 0) return false;
  
  // Make sure data has all required properties for a bar chart
  return chartData.data.every(item => 'category' in item && 'value' in item);
};

// Debug helper function
export const debugChartMessages = (messages) => {
  console.group('Debug Chart Messages');
  
  if (!messages || messages.length === 0) {
    console.log('No messages to debug');
    console.groupEnd();
    return;
  }
  
  messages.forEach((message, i) => {
    if (message.chart) {
      console.log(`Message ${i} has chart:`, message.chart.type);
      console.log(`  - Data points:`, message.chart.data.length);
      console.log(`  - Title:`, message.chart.title);
    }
    
    if (message.multipleCharts) {
      console.log(`Message ${i} has multiple charts:`, message.multipleCharts.charts.length);
      message.multipleCharts.charts.forEach((chart, ci) => {
        console.log(`  - Chart ${ci} type:`, chart.type);
        console.log(`  - Data points:`, chart.data.length);
      });
    }
  });
  
  console.groupEnd();
}; 