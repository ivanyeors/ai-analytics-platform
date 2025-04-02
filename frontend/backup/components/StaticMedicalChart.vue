<template>
  <div class="static-chart-container">
    <div class="chart-area" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Plot from '@observablehq/plot';

const chartContainer = ref(null);

// Sample medical data
const medicalData = [
  { category: "Heart Disease", value: 42 },
  { category: "Diabetes", value: 38 },
  { category: "Hypertension", value: 65 },
  { category: "Depression", value: 28 },
  { category: "Obesity", value: 36 }
];

onMounted(() => {
  renderChart();
});

const renderChart = () => {
  if (!chartContainer.value) return;
  
  // Create a bar chart using Plot
  const chart = Plot.plot({
    marginLeft: 50,
    marginBottom: 40,
    marginRight: 20,
    marginTop: 10,
    height: 200,
    style: {
      background: "transparent",
      fontSize: 12,
      overflow: "visible",
      maxWidth: "100%"
    },
    marks: [
      Plot.barY(medicalData, {
        x: d => d.category,
        y: d => d.value,
        fill: "#2CE4CF",
        title: d => `${d.category}: ${d.value}%`
      })
    ],
    x: {
      tickRotate: 45,
      label: null,
      tickSize: 3
    },
    y: {
      grid: true,
      label: null,
      tickFormat: d => d + "%"
    }
  });
  
  // Clear existing chart if any
  chartContainer.value.innerHTML = '';
  
  // Append chart to container
  chartContainer.value.appendChild(chart);
};
</script>

<style scoped>
.static-chart-container {
  width: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-area {
  width: 100%;
  height: 100%;
}
</style> 