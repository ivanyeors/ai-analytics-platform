<template>
  <div class="ethnicity-chart">
    <div v-if="loading" class="loading">Loading chart data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="chart-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'EthnicityChart',
  props: {
    demographicsData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    const chart = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const processChartData = () => {
      try {
        if (!props.demographicsData || props.demographicsData.length === 0) {
          return {
            labels: [],
            datasets: []
          }
        }

        // Extract the data for different ethnic groups
        const labels = props.demographicsData.map(record => record.NumberText || 'Unknown')
        
        const chineseData = props.demographicsData.map(record => 
          parseInt(record['[Chinese] (Total) TotalNumeric'] || 0))
        
        const malayData = props.demographicsData.map(record => 
          parseInt(record['[Malays] (Total) TotalNumeric'] || 0))
        
        const indianData = props.demographicsData.map(record => 
          parseInt(record['[Indians] (Total) TotalNumeric'] || 0))
        
        const othersData = props.demographicsData.map(record => 
          parseInt(record['[Others] (Total) TotalNumeric'] || 0))

        return {
          labels,
          datasets: [
            {
              label: 'Chinese',
              data: chineseData,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Malay',
              data: malayData,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Indian',
              data: indianData,
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            },
            {
              label: 'Others',
              data: othersData,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        }
      } catch (err) {
        console.error('Error processing chart data:', err)
        error.value = 'Error processing chart data'
        return null
      }
    }

    const renderChart = () => {
      if (!chartCanvas.value) return

      const chartData = processChartData()
      if (!chartData) return

      // Destroy previous chart if exists
      if (chart.value) {
        chart.value.destroy()
      }

      // Create the chart
      chart.value = new Chart(chartCanvas.value, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Population by Ethnic Group'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Population'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Categories'
              }
            }
          }
        }
      })
    }

    // Watch for changes in the data prop
    watch(() => props.demographicsData, () => {
      loading.value = false
      renderChart()
    }, { deep: true })

    // Initialize the chart when the component is mounted
    onMounted(() => {
      if (props.demographicsData && props.demographicsData.length > 0) {
        loading.value = false
        renderChart()
      }
    })

    return {
      chartCanvas,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.ethnicity-chart {
  height: 100%;
  min-height: 400px;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.error {
  color: #dc3545;
}
</style> 