<template>
  <div class="data-gov-page">
    <h1>Singapore Data Explorer</h1>
    <p class="description">
      Explore and visualize datasets from data.gov.sg. Select a dataset from the dropdown to begin.
    </p>
    
    <div class="main-content">
      <SingaporeDataVis />
    </div>
    
    <div class="about-section">
      <h2>About This Tool</h2>
      <p>
        This tool allows you to explore publicly available datasets from the Singapore Government's open data portal 
        (data.gov.sg). You can select different datasets, choose which fields to display on the X and Y axes, 
        and switch between different visualization types.
      </p>
      <p>
        Data is fetched directly from the data.gov.sg API and visualized using ObservablePlot.
      </p>
      <p>
        <a href="https://guide.data.gov.sg/developer-guide/api-overview" target="_blank">Learn more about data.gov.sg APIs</a>
      </p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import SingaporeDataVis from '../components/SingaporeDataVis.vue';

export default defineComponent({
  name: 'DataGovSgPage',
  
  components: {
    SingaporeDataVis
  }
});
</script>

<style scoped>
.data-gov-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 16px;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.5;
}

.main-content {
  margin-bottom: 40px;
}

.about-section {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.about-section h2 {
  margin-top: 0;
  color: #333;
}

.about-section p {
  margin-bottom: 12px;
  line-height: 1.6;
}

.about-section a {
  color: #4CAF50;
  text-decoration: none;
}

.about-section a:hover {
  text-decoration: underline;
}
</style> 