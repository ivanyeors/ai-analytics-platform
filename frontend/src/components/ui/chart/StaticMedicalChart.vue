<template>
  <div class="static-chart-container">
    <svg width="100%" height="260" viewBox="0 0 520 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Chart background -->
      <rect width="520" height="260" rx="8" fill="#F7F8FA" />
      
      <!-- Chart grid lines -->
      <line x1="40" y1="230" x2="480" y2="230" stroke="#E1E5EB" stroke-width="1"/>
      <line x1="40" y1="192" x2="480" y2="192" stroke="#E1E5EB" stroke-width="1"/>
      <line x1="40" y1="154" x2="480" y2="154" stroke="#E1E5EB" stroke-width="1"/>
      <line x1="40" y1="116" x2="480" y2="116" stroke="#E1E5EB" stroke-width="1"/>
      <line x1="40" y1="78" x2="480" y2="78" stroke="#E1E5EB" stroke-width="1"/>
      <line x1="40" y1="40" x2="480" y2="40" stroke="#E1E5EB" stroke-width="1"/>
      
      <!-- Y axis -->
      <line x1="40" y1="30" x2="40" y2="230" stroke="#B9B9B9" stroke-width="1"/>
      
      <!-- X axis -->
      <line x1="40" y1="230" x2="480" y2="230" stroke="#B9B9B9" stroke-width="1"/>
      
      <!-- Medical Condition Bars -->
      <rect x="70" y="98" width="28" height="132" fill="#257BDF" rx="3"/>   <!-- Heart Disease: 42% -->
      <rect x="130" y="110" width="28" height="120" fill="#257BDF" rx="3"/>  <!-- Diabetes: 38% -->
      <rect x="190" y="120" width="28" height="110" fill="#257BDF" rx="3"/>  <!-- Cancer: 35% -->
      <rect x="250" y="142" width="28" height="88" fill="#257BDF" rx="3"/>  <!-- Stroke: 28% -->
      <rect x="310" y="158" width="28" height="72" fill="#257BDF" rx="3"/>   <!-- Alzheimer's: 23% -->
      <rect x="370" y="192" width="28" height="38" fill="#257BDF" rx="3"/>   <!-- Flu: 12% -->
      
      <!-- Data values -->
      <text x="84" y="90" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">42%</text>
      <text x="144" y="102" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">38%</text>
      <text x="204" y="112" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">35%</text>
      <text x="264" y="134" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">28%</text>
      <text x="324" y="150" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">23%</text>
      <text x="384" y="184" fill="#257BDF" font-size="11" font-weight="bold" text-anchor="middle">12%</text>
      
      <!-- X axis labels - using shorter names for better readability -->
      <text x="84" y="248" fill="#777777" font-size="10" text-anchor="middle">Heart</text>
      <text x="144" y="248" fill="#777777" font-size="10" text-anchor="middle">Diabetes</text>
      <text x="204" y="248" fill="#777777" font-size="10" text-anchor="middle">Cancer</text>
      <text x="264" y="248" fill="#777777" font-size="10" text-anchor="middle">Stroke</text>
      <text x="324" y="248" fill="#777777" font-size="10" text-anchor="middle">Alzheimer's</text>
      <text x="384" y="248" fill="#777777" font-size="10" text-anchor="middle">Flu</text>
      
      <!-- Y axis labels -->
      <text x="35" y="230" fill="#777777" font-size="10" text-anchor="end">0</text>
      <text x="35" y="192" fill="#777777" font-size="10" text-anchor="end">10</text>
      <text x="35" y="154" fill="#777777" font-size="10" text-anchor="end">20</text>
      <text x="35" y="116" fill="#777777" font-size="10" text-anchor="end">30</text>
      <text x="35" y="78" fill="#777777" font-size="10" text-anchor="end">40</text>
      <text x="35" y="40" fill="#777777" font-size="10" text-anchor="end">50</text>
    </svg>
  </div>
</template>

<script setup>
// This is a static component with no dynamic props or state
// All data is hardcoded in the SVG for reliability
</script>

<style scoped>
.static-chart-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  margin: 4px 0;
}

.static-chart-container:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  svg text {
    font-size: 8px;
  }
  
  .static-chart-container {
    margin: 2px 0;
  }
}
</style> 