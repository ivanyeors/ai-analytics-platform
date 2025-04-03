/**
 * Service for interacting with SpacetimeDB
 */
import axios from 'axios';

/**
 * SpacetimeDB Service
 * This service handles interactions with SpacetimeDB through the backend API
 */
// SpaceTimeDB API endpoint
const API_BASE_URL = '/api/spacetime';

// Mock data storage (fallback for development)
const mockTables = {
  singapore_demographics: {
    schema: [
      { name: 'year', type: 'numeric' },
      { name: 'age_group', type: 'text' },
      { name: 'gender', type: 'text' },
      { name: 'count', type: 'numeric' }
    ],
    data: [
      { year: 2020, age_group: '0-9', gender: 'Male', count: 215000 },
      { year: 2020, age_group: '0-9', gender: 'Female', count: 205000 },
      { year: 2020, age_group: '10-19', gender: 'Male', count: 245000 },
      { year: 2020, age_group: '10-19', gender: 'Female', count: 235000 },
      { year: 2020, age_group: '20-29', gender: 'Male', count: 325000 },
      { year: 2020, age_group: '20-29', gender: 'Female', count: 315000 },
    ]
  }
};

export default {
  /**
   * Checks if SpacetimeDB is available and configured
   * @returns {Promise<boolean>} Whether SpacetimeDB is available
   */
  async isAvailable() {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      return response.data.available;
    } catch (error) {
      console.error('Error checking SpacetimeDB availability:', error);
      return false;
    }
  },
  
  /**
   * Connect to SpacetimeDB
   * @returns {Promise<Object>} Connection status
   */
  async connect() {
    try {
      console.log('Connecting to SpacetimeDB...');
      const response = await axios.post(`${API_BASE_URL}/connect`);
      return response.data;
    } catch (error) {
      console.error('Error connecting to SpacetimeDB:', error);
      throw new Error(`Failed to connect to SpacetimeDB: ${error.message}`);
    }
  },
  
  /**
   * Query data from SpacetimeDB
   * @param {string} query - The query to run
   * @returns {Promise<Array>} Query results
   */
  async queryData(query) {
    try {
      console.log('Querying SpacetimeDB:', query);
      const response = await axios.post(`${API_BASE_URL}/query`, { query });
      return response.data.results;
    } catch (error) {
      console.error('Error querying SpacetimeDB:', error);
      throw new Error(`Failed to query SpacetimeDB: ${error.message}`);
    }
  },
  
  /**
   * Import data from external source into SpacetimeDB
   * @param {string} source - Source identifier (e.g., "data.gov.sg")
   * @param {string} datasetId - ID of the dataset to import
   * @returns {Promise<Object>} Import status
   */
  async importExternalData(source, datasetId) {
    try {
      console.log(`Importing data from ${source} (dataset: ${datasetId}) into SpacetimeDB...`);
      const response = await axios.post(`${API_BASE_URL}/import`, { source, datasetId });
      return response.data;
    } catch (error) {
      console.error('Error importing data to SpacetimeDB:', error);
      throw new Error(`Failed to import data to SpacetimeDB: ${error.message}`);
    }
  },
  
  /**
   * List available datasets in SpacetimeDB
   * @returns {Promise<Array>} List of available datasets
   */
  async listDatasets() {
    try {
      console.log('Listing SpacetimeDB datasets...');
      const response = await axios.get(`${API_BASE_URL}/datasets`);
      return response.data.datasets;
    } catch (error) {
      console.error('Error listing SpacetimeDB datasets:', error);
      throw new Error(`Failed to list SpacetimeDB datasets: ${error.message}`);
    }
  },
  
  /**
   * Get dataset schema
   * @param {string} datasetName - Name of the dataset
   * @returns {Promise<Object>} Dataset schema
   */
  async getDatasetSchema(datasetName) {
    try {
      console.log(`Getting schema for SpacetimeDB dataset: ${datasetName}`);
      const response = await axios.get(`${API_BASE_URL}/schemas/${datasetName}`);
      return response.data.schema;
    } catch (error) {
      console.error('Error getting SpacetimeDB schema:', error);
      throw new Error(`Failed to get SpacetimeDB schema: ${error.message}`);
    }
  },

  /**
   * Get all available tables in the database
   * @returns {Promise<Array>} List of table names
   */
  async getTables() {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`);
      return response.data.tables;
    } catch (error) {
      console.error('Error getting SpacetimeDB tables:', error);
      // Fallback to mock data
      return Object.keys(mockTables);
    }
  },

  /**
   * Get the schema for a specific table
   * @param {string} tableName - The name of the table
   * @returns {Promise<Array>} Table schema
   */
  async getTableSchema(tableName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables/${tableName}/schema`);
      return response.data.schema;
    } catch (error) {
      console.error('Error getting SpacetimeDB table schema:', error);
      // Fallback to mock data
      return mockTables[tableName]?.schema || [];
    }
  },

  /**
   * Query data from a table
   * @param {string} tableName - The name of the table
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Query results
   */
  async queryTable(tableName, options = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/tables/${tableName}/query`, options);
      return response.data.results;
    } catch (error) {
      console.error('Error querying SpacetimeDB table:', error);
      // Fallback to mock data
      const tableData = mockTables[tableName]?.data || [];
      
      // Apply basic filtering if specified in options
      if (options.filters) {
        return tableData.filter(row => {
          return Object.entries(options.filters).every(([key, value]) => row[key] === value);
        });
      }
      
      return tableData;
    }
  },

  /**
   * Import data from data.gov.sg into SpacetimeDB
   * @param {string} datasetId - The data.gov.sg dataset ID
   * @param {string} tableName - The name to give the table in SpacetimeDB
   * @returns {Promise<Object>} Import result
   */
  async importFromDataGovSg(datasetId, tableName) {
    try {
      const response = await axios.post(`${API_BASE_URL}/import/datagovsg`, {
        datasetId,
        tableName
      });
      
      return response.data;
    } catch (error) {
      console.error('Error importing from data.gov.sg:', error);
      throw new Error(`Failed to import dataset: ${error.message}`);
    }
  }
}; 