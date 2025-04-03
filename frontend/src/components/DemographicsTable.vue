<template>
  <div class="demographics-table">
    <div v-if="loading" class="loading">Loading table data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="table-filter">
        <input 
          type="text" 
          v-model="filterText" 
          placeholder="Filter by category..."
          class="filter-input"
        />
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total</th>
              <th>Male</th>
              <th>Female</th>
              <th>Chinese</th>
              <th>Malay</th>
              <th>Indian</th>
              <th>Others</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in filteredData" :key="index">
              <td>{{ record.NumberText || 'Unknown' }}</td>
              <td>{{ formatNumber(record['[Total] (Total) TotalNumeric']) }}</td>
              <td>{{ formatNumber(record['[Total] (Total) MalesNumeric']) }}</td>
              <td>{{ formatNumber(record['[Total] (Total) FemalesNumeric']) }}</td>
              <td>{{ formatNumber(record['[Chinese] (Total) TotalNumeric']) }}</td>
              <td>{{ formatNumber(record['[Malays] (Total) TotalNumeric']) }}</td>
              <td>{{ formatNumber(record['[Indians] (Total) TotalNumeric']) }}</td>
              <td>{{ formatNumber(record['[Others] (Total) TotalNumeric']) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'DemographicsTable',
  props: {
    demographicsData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const loading = ref(true)
    const error = ref(null)
    const filterText = ref('')

    // Format number with commas
    const formatNumber = (value) => {
      if (!value) return '0'
      return parseInt(value).toLocaleString()
    }

    // Filtered data based on user input
    const filteredData = computed(() => {
      if (!props.demographicsData) return []
      
      if (!filterText.value) {
        return props.demographicsData
      }
      
      const filter = filterText.value.toLowerCase()
      return props.demographicsData.filter(record => {
        const category = (record.NumberText || '').toLowerCase()
        return category.includes(filter)
      })
    })

    // Watch for changes in the data prop
    watch(() => props.demographicsData, () => {
      if (props.demographicsData && props.demographicsData.length > 0) {
        loading.value = false
      }
    }, { immediate: true })

    return {
      loading,
      error,
      filterText,
      filteredData,
      formatNumber
    }
  }
}
</script>

<style scoped>
.demographics-table {
  height: 100%;
}

.table-filter {
  margin-bottom: 15px;
}

.filter-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.04);
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