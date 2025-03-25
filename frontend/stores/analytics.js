import { defineStore } from 'pinia';
import api from '../utils/api';

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    dataPoints: [],
    categories: [],
    loading: false,
    error: null,
    lastUpdate: null
  }),
  
  getters: {
    getDataPointsByCategory: (state) => {
      return (category) => state.dataPoints
        .filter(point => point.category === category);
    },
    
    getCategoryByName: (state) => {
      return (name) => state.categories
        .find(cat => cat.name === name);
    },
    
    getCategoryColors: (state) => {
      const colors = {};
      state.categories.forEach(cat => {
        colors[cat.name] = cat.color;
      });
      return colors;
    },
    
    formattedDataPoints: (state) => {
      return state.dataPoints.map(point => ({
        ...point,
        // Convert timestamp to Date object for plotting
        timestamp: new Date(Number(point.timestamp)),
      }));
    }
  },
  
  actions: {
    // Load data points from API
    async fetchDataPoints() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.dataPoints.getAll();
        this.dataPoints = response.data;
        this.lastUpdate = new Date();
      } catch (error) {
        this.error = error.message || 'Failed to fetch data points';
        console.error('Error fetching data points:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Load categories from API
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.categories.getAll();
        this.categories = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch categories';
        console.error('Error fetching categories:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Add a new data point
    async addDataPoint(category, value) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.dataPoints.add(category, value);
        // Refresh data
        await this.fetchDataPoints();
      } catch (error) {
        this.error = error.message || 'Failed to add data point';
        console.error('Error adding data point:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Generate sample data
    async generateSampleData(numPoints = 50) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.dataPoints.generateSample(numPoints);
        // Refresh data
        await this.fetchDataPoints();
        await this.fetchCategories();
      } catch (error) {
        this.error = error.message || 'Failed to generate sample data';
        console.error('Error generating sample data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Initialize - fetch all data
    async initialize() {
      await this.fetchCategories();
      await this.fetchDataPoints();
    }
  }
}); 