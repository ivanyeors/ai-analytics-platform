import axios from 'axios';

// Configure axios for CORS
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Timeout after 30 seconds
  timeout: 30000
});

/**
 * Service for interacting with the data.gov.sg API
 */
export default {
  /**
   * Fetch all available datasets
   * @returns {Promise<Array>} Array of available datasets
   */
  async fetchDatasets() {
    try {
      // Try production API first
      try {
        const response = await apiClient.get('https://api-production.data.gov.sg/v2/public/api/datasets');
        if (response.data && response.data.data && response.data.data.datasets) {
          return response.data.data.datasets;
        }
      } catch (productionError) {
        console.warn('Error fetching from production API, trying alternative endpoint', productionError);
        
        // If production API fails, try alternative endpoint
        const response = await apiClient.get('https://data.gov.sg/api/action/package_list');
        if (response.data && response.data.success && response.data.result) {
          // Convert to compatible format
          return response.data.result.map(id => ({
            datasetId: id,
            name: id.replace(/_/g, ' ').split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw new Error(`Failed to fetch datasets: ${error.message}`);
    }
  },

  /**
   * Fetch metadata for a specific dataset
   * @param {string} datasetId - The ID of the dataset
   * @returns {Promise<Object>} Dataset metadata
   */
  async fetchDatasetMetadata(datasetId) {
    try {
      try {
        // Try production API first
        const response = await apiClient.get(`https://api-production.data.gov.sg/v2/public/api/datasets/${datasetId}/metadata`);
        if (response.data && response.data.data) {
          return response.data.data;
        }
      } catch (productionError) {
        console.warn('Error fetching metadata from production API, trying alternative endpoint', productionError);
        
        // If production API fails, try alternative endpoint
        const response = await apiClient.get(`https://data.gov.sg/api/action/package_show?id=${datasetId}`);
        if (response.data && response.data.success && response.data.result) {
          // Convert to compatible format
          const result = response.data.result;
          return {
            datasetId: result.id,
            name: result.title,
            description: result.notes,
            // Map resources to column metadata if available
            columnMetadata: result.resources && result.resources.length > 0 ? {
              order: Object.keys(result.resources[0].schema || {})
            } : null
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching metadata for dataset ${datasetId}:`, error);
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  },

  /**
   * Fetch data from a specific dataset
   * @param {string} datasetId - The ID of the dataset
   * @param {Object} options - Optional parameters for the query
   * @param {number} options.limit - Maximum number of records to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {string} options.q - Search query
   * @param {Object} options.filters - Filters to apply
   * @returns {Promise<Array>} Array of dataset records
   */
  async fetchDatasetData(datasetId, options = {}) {
    try {
      const params = {
        resource_id: datasetId,
        limit: options.limit || 100,
        ...options
      };

      // Try with datastore_search endpoint
      try {
        const response = await apiClient.get('https://data.gov.sg/api/action/datastore_search', { params });
        
        if (response.data && response.data.success && response.data.result && response.data.result.records) {
          console.log('Raw data from API:', response.data.result.records.slice(0, 3));
          
          // Process data - convert string numbers to actual numbers for better visualization
          return response.data.result.records.map(record => {
            const processedRecord = { ...record };
            Object.keys(processedRecord).forEach(key => {
              if (!isNaN(processedRecord[key]) && processedRecord[key] !== '') {
                processedRecord[key] = Number(processedRecord[key]);
              }
            });
            return processedRecord;
          });
        }
      } catch (err) {
        console.warn('Error with datastore_search, trying SQL endpoint', err);
        
        // If datastore_search fails, try the SQL endpoint
        const sqlQuery = `SELECT * FROM "${datasetId}" LIMIT ${params.limit}`;
        const response = await apiClient.get('https://data.gov.sg/api/action/datastore_search_sql', {
          params: { sql: sqlQuery }
        });
        
        if (response.data && response.data.success && response.data.result && response.data.result.records) {
          return response.data.result.records.map(record => {
            const processedRecord = { ...record };
            Object.keys(processedRecord).forEach(key => {
              if (!isNaN(processedRecord[key]) && processedRecord[key] !== '') {
                processedRecord[key] = Number(processedRecord[key]);
              }
            });
            return processedRecord;
          });
        }
      }
      
      // If all attempts fail, return empty array
      console.error('All data fetching methods failed for dataset', datasetId);
      return [];
    } catch (error) {
      console.error(`Error fetching data from dataset ${datasetId}:`, error);
      throw new Error(`Failed to fetch dataset data: ${error.message}`);
    }
  },

  /**
   * Initialize download for a dataset with filtering
   * @param {string} datasetId - The ID of the dataset
   * @param {Object} options - Options for filtering
   * @param {Array<string>} options.columnNames - Columns to include
   * @param {Array<Object>} options.filters - Filters to apply
   * @returns {Promise<Object>} Download initiation response
   */
  async initiateDownload(datasetId, options = {}) {
    try {
      const response = await apiClient.get(
        `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/initiate-download`,
        { data: options }
      );
      return response.data;
    } catch (error) {
      console.error(`Error initiating download for dataset ${datasetId}:`, error);
      throw new Error(`Failed to initiate download: ${error.message}`);
    }
  },

  /**
   * Poll for download status and get download URL
   * @param {string} datasetId - The ID of the dataset
   * @param {Object} options - Same options as used for initiation
   * @returns {Promise<Object>} Download status and URL
   */
  async pollDownload(datasetId, options = {}) {
    try {
      const response = await apiClient.get(
        `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`,
        { data: options }
      );
      return response.data;
    } catch (error) {
      console.error(`Error polling download for dataset ${datasetId}:`, error);
      throw new Error(`Failed to poll download: ${error.message}`);
    }
  },

  /**
   * Fetch all collections
   * @returns {Promise<Array>} Array of collections
   */
  async fetchCollections() {
    try {
      const response = await apiClient.get('https://api-production.data.gov.sg/v2/public/api/collections');
      if (response.data && response.data.data && response.data.data.collections) {
        return response.data.data.collections;
      }
      return [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }
  },

  /**
   * Fetch metadata for a specific collection
   * @param {string} collectionId - The ID of the collection
   * @returns {Promise<Object>} Collection metadata
   */
  async fetchCollectionMetadata(collectionId) {
    try {
      const response = await apiClient.get(`https://api-production.data.gov.sg/v2/public/api/collections/${collectionId}/metadata`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching metadata for collection ${collectionId}:`, error);
      throw new Error(`Failed to fetch collection metadata: ${error.message}`);
    }
  },
  
  /**
   * Fetch a few sample datasets that are known to work
   * @returns {Promise<Array>} Array of recommended datasets
   */
  async getRecommendedDatasets() {
    // These are datasets that are known to work well with the visualization
    const recommendations = [
      {
        datasetId: 'f9dbfc75-a2dc-42af-9f50-425e4107ae84',
        name: 'Singapore Residents by Age Group and Sex',
        description: 'Annual dataset of Singapore residents by age group and gender'
      },
      {
        datasetId: 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc',
        name: 'Public Transport Utilisation - Average Daily Public Transport Ridership',
        description: 'Public transport ridership statistics'
      },
      {
        datasetId: '83c21090-bd19-4b54-ab6b-d999c251edcf',
        name: 'Key Household Income Trends',
        description: 'Statistics on household income in Singapore'
      }
    ];
    
    return recommendations;
  }
}; 