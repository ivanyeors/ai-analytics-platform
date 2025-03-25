<template>
  <div class="chart-actions-panel" :class="{ 'visible': visible, 'collapsed': collapsed, 'detailed-view': detailedView, 'expanded-view': expandedView }">
    <div class="panel-border"></div>
    <div class="panel-content">
      <!-- Main Panel View -->
      <div v-if="!detailedView && !expandedView">
        <div class="panel-header-container">
          <div class="panel-toggle" @click="toggleCollapse">
            <img 
              :src="arrowForward" 
              alt="Toggle panel" 
              class="panel-toggle-icon" 
              :class="{ 'flipped': !collapsed }"
            />
          </div>
          <div class="panel-header" v-if="!collapsed">
            <div class="panel-title">Chart Actions</div>
          </div>
        </div>
        <div class="panel-buttons">
          <div class="action-button" @click="showChartsView">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.33398 9H4.33398V20H8.33398V9Z" fill="#313438"/>
                <path d="M20.334 13H16.334V20H20.334V13Z" fill="#313438"/>
                <path d="M14.334 4H10.334V20H14.334V4Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">View Charts</div>
          </div>
          
          <div class="action-button" @click="$emit('create-dashboard')">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.334 5V7H15.334V5H19.334ZM9.33398 5V11H5.33398V5H9.33398ZM19.334 13V19H15.334V13H19.334ZM9.33398 17V19H5.33398V17H9.33398ZM21.334 3H13.334V9H21.334V3ZM11.334 3H3.33398V13H11.334V3ZM21.334 11H13.334V21H21.334V11ZM11.334 15H3.33398V21H11.334V15Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">Create Dashboard</div>
          </div>
          
          <div class="action-button" @click="$emit('explore-dataset')">
            <div class="button-icon">
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.334 13H7.33398V17H11.334V13Z" fill="#313438"/>
                <path d="M17.334 13H13.334V17H17.334V13Z" fill="#313438"/>
                <path d="M19.334 3H5.33398C4.23398 3 3.33398 3.9 3.33398 5V19C3.33398 20.1 4.23398 21 5.33398 21H19.334C20.434 21 21.334 20.1 21.334 19V5C21.334 3.9 20.434 3 19.334 3ZM19.334 19H5.33398V5H19.334V19Z" fill="#313438"/>
                <path d="M11.334 7H7.33398V11H11.334V7Z" fill="#313438"/>
                <path d="M17.334 7H13.334V11H17.334V7Z" fill="#313438"/>
              </svg>
            </div>
            <div class="button-text" v-if="!collapsed">Explore Dataset</div>
          </div>
        </div>
      </div>
      
      <!-- Detailed Charts View -->
      <div v-else-if="detailedView && !expandedView" class="detailed-charts-container">
        <!-- Header with back button and title -->
        <div class="detailed-view-header">
          <div class="header-left">
            <div class="back-button" @click="closeDetailedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#7E8794"/>
              </svg>
            </div>
            <div class="detailed-view-title">View Charts</div>
          </div>
          <div class="close-button" @click="closeDetailedView">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#313438"/>
            </svg>
          </div>
        </div>
        
        <!-- Chart collection panel -->
        <div class="chart-panel">
          <div class="chart-examples-container">
            <!-- Bar Chart Example -->
            <div class="chart-example bar-chart">
              <div class="chart-box">
                <svg width="100%" height="331.51" viewBox="0 0 520 332" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Chart background -->
                  <rect width="520" height="331.51" rx="13" fill="#F7F8FA" />
                  
                  <!-- Chart grid lines -->
                  <line x1="40" y1="300" x2="480" y2="300" stroke="#E1E5EB" stroke-width="1"/>
                  <line x1="40" y1="250" x2="480" y2="250" stroke="#E1E5EB" stroke-width="1"/>
                  <line x1="40" y1="200" x2="480" y2="200" stroke="#E1E5EB" stroke-width="1"/>
                  <line x1="40" y1="150" x2="480" y2="150" stroke="#E1E5EB" stroke-width="1"/>
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#E1E5EB" stroke-width="1"/>
                  <line x1="40" y1="50" x2="480" y2="50" stroke="#E1E5EB" stroke-width="1"/>
                  
                  <!-- Y axis -->
                  <line x1="40" y1="30" x2="40" y2="300" stroke="#B9B9B9" stroke-width="1"/>
                  
                  <!-- X axis -->
                  <line x1="40" y1="300" x2="480" y2="300" stroke="#B9B9B9" stroke-width="1"/>
                  
                  <!-- Bars -->
                  <rect x="70" y="120" width="30" height="180" fill="#257BDF" rx="3"/>
                  <rect x="130" y="80" width="30" height="220" fill="#257BDF" rx="3"/>
                  <rect x="190" y="180" width="30" height="120" fill="#257BDF" rx="3"/>
                  <rect x="250" y="100" width="30" height="200" fill="#257BDF" rx="3"/>
                  <rect x="310" y="150" width="30" height="150" fill="#257BDF" rx="3"/>
                  <rect x="370" y="50" width="30" height="250" fill="#257BDF" rx="3"/>
                  <rect x="430" y="170" width="30" height="130" fill="#257BDF" rx="3"/>
                  
                  <!-- X axis labels -->
                  <text x="85" y="320" fill="#777777" font-size="12" text-anchor="middle">Q1</text>
                  <text x="145" y="320" fill="#777777" font-size="12" text-anchor="middle">Q2</text>
                  <text x="205" y="320" fill="#777777" font-size="12" text-anchor="middle">Q3</text>
                  <text x="265" y="320" fill="#777777" font-size="12" text-anchor="middle">Q4</text>
                  <text x="325" y="320" fill="#777777" font-size="12" text-anchor="middle">Q1</text>
                  <text x="385" y="320" fill="#777777" font-size="12" text-anchor="middle">Q2</text>
                  <text x="445" y="320" fill="#777777" font-size="12" text-anchor="middle">Q3</text>
                  
                  <!-- Y axis labels -->
                  <text x="35" y="300" fill="#777777" font-size="12" text-anchor="end">0</text>
                  <text x="35" y="250" fill="#777777" font-size="12" text-anchor="end">20</text>
                  <text x="35" y="200" fill="#777777" font-size="12" text-anchor="end">40</text>
                  <text x="35" y="150" fill="#777777" font-size="12" text-anchor="end">60</text>
                  <text x="35" y="100" fill="#777777" font-size="12" text-anchor="end">80</text>
                  <text x="35" y="50" fill="#777777" font-size="12" text-anchor="end">100</text>
                </svg>
              </div>
            </div>
            
            <!-- Data Table Example -->
            <div class="chart-example data-table">
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Value</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Product A</td>
                      <td>$12,450</td>
                      <td class="positive">+12.3%</td>
                    </tr>
                    <tr>
                      <td>Product B</td>
                      <td>$8,350</td>
                      <td class="positive">+5.7%</td>
                    </tr>
                    <tr>
                      <td>Product C</td>
                      <td>$6,789</td>
                      <td class="negative">-2.3%</td>
                    </tr>
                    <tr>
                      <td>Product D</td>
                      <td>$4,125</td>
                      <td class="positive">+8.1%</td>
                    </tr>
                    <tr>
                      <td>Product E</td>
                      <td>$3,845</td>
                      <td class="negative">-1.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="chart-actions">
              <button class="action-btn secondary" @click="showExpandedView">
                <div class="btn-icon">
                  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.334 13H7.33398V17H11.334V13Z" fill="#313438"/>
                    <path d="M17.334 13H13.334V17H17.334V13Z" fill="#313438"/>
                    <path d="M19.334 3H5.33398C4.23398 3 3.33398 3.9 3.33398 5V19C3.33398 20.1 4.23398 21 5.33398 21H19.334C20.434 21 21.334 20.1 21.334 19V5C21.334 3.9 20.434 3 19.334 3ZM19.334 19H5.33398V5H19.334V19Z" fill="#313438"/>
                    <path d="M11.334 7H7.33398V11H11.334V7Z" fill="#313438"/>
                    <path d="M17.334 7H13.334V11H17.334V7Z" fill="#313438"/>
                  </svg>
                </div>
                <span>View</span>
              </button>
              <button class="action-btn secondary">
                <div class="btn-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#313438"/>
                  </svg>
                </div>
                <span>Dashboard</span>
              </button>
              <button class="action-btn secondary">
                <div class="btn-icon">
                  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 17.2773L21.5 12.2773L16.5 7.27734L15.09 8.68734L17.67 11.2773H8.5V13.2773H17.67L15.09 15.8673L16.5 17.2773Z" fill="#313438"/>
                    <path d="M18.5 19.2773H4.5V5.27734H18.5V7.27734H20.5V5.27734C20.5 4.17734 19.61 3.27734 18.5 3.27734H4.5C3.4 3.27734 2.5 4.17734 2.5 5.27734V19.2773C2.5 20.3773 3.4 21.2773 4.5 21.2773H18.5C19.61 21.2773 20.5 20.3773 20.5 19.2773V17.2773H18.5V19.2773Z" fill="#313438"/>
                  </svg>
                </div>
                <span>Export</span>
              </button>
              <button class="action-btn primary">
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Expanded View -->
      <div v-else-if="expandedView" class="expanded-view-container">
        <!-- Header with back and close buttons -->
        <div class="expanded-view-header">
          <div class="header-left">
            <div class="back-button" @click="closeExpandedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#7E8794"/>
              </svg>
            </div>
            <div class="expanded-view-title">AI Healthcare Analytics</div>
            <div class="header-badge">
              <span>medical</span>
            </div>
          </div>
          <div class="header-actions">
            <div class="search-container">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9167 11.6667H12.2583L12.025 11.4417C12.8417 10.4917 13.3333 9.25833 13.3333 7.91667C13.3333 4.925 10.9083 2.5 7.91667 2.5C4.925 2.5 2.5 4.925 2.5 7.91667C2.5 10.9083 4.925 13.3333 7.91667 13.3333C9.25833 13.3333 10.4917 12.8417 11.4417 12.025L11.6667 12.2583V12.9167L15.8333 17.075L17.075 15.8333L12.9167 11.6667ZM7.91667 11.6667C5.84167 11.6667 4.16667 9.99167 4.16667 7.91667C4.16667 5.84167 5.84167 4.16667 7.91667 4.16667C9.99167 4.16667 11.6667 5.84167 11.6667 7.91667C11.6667 9.99167 9.99167 11.6667 7.91667 11.6667Z" fill="#7E8794"/>
                </svg>
              </div>
              <input type="text" placeholder="Search analytics data..." class="search-input" />
            </div>
            <div class="action-icons">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#5C88DA"/>
                </svg>
              </div>
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#5C88DA"/>
                </svg>
              </div>
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L6.5 11H17.5L12 2Z" fill="#41B883"/>
                  <path d="M17.5 22L12 13L6.5 22H17.5Z" fill="#41B883"/>
                </svg>
              </div>
            </div>
            <div class="close-button" @click="closeExpandedView">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#313438"/>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Main expanded content -->
        <div class="expanded-content">
          <div class="chart-container">
            <!-- Main visualization -->
            <div class="main-chart-area">
              <svg width="100%" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Chart background -->
                <rect width="800" height="400" rx="13" fill="#F7F8FA" />
                
                <!-- Chart grid lines -->
                <line x1="50" y1="350" x2="750" y2="350" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="300" x2="750" y2="300" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="250" x2="750" y2="250" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="200" x2="750" y2="200" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="150" x2="750" y2="150" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="100" x2="750" y2="100" stroke="#E1E5EB" stroke-width="1"/>
                <line x1="50" y1="50" x2="750" y2="50" stroke="#E1E5EB" stroke-width="1"/>
                
                <!-- Y axis -->
                <line x1="50" y1="50" x2="50" y2="350" stroke="#B9B9B9" stroke-width="1"/>
                
                <!-- X axis -->
                <line x1="50" y1="350" x2="750" y2="350" stroke="#B9B9B9" stroke-width="1"/>
                
                <!-- Bars -->
                <rect x="100" y="150" width="40" height="200" fill="#257BDF" rx="3"/>
                <rect x="170" y="100" width="40" height="250" fill="#257BDF" rx="3"/>
                <rect x="240" y="200" width="40" height="150" fill="#257BDF" rx="3"/>
                <rect x="310" y="120" width="40" height="230" fill="#257BDF" rx="3"/>
                <rect x="380" y="170" width="40" height="180" fill="#257BDF" rx="3"/>
                <rect x="450" y="80" width="40" height="270" fill="#257BDF" rx="3"/>
                <rect x="520" y="190" width="40" height="160" fill="#257BDF" rx="3"/>
                <rect x="590" y="130" width="40" height="220" fill="#257BDF" rx="3"/>
                <rect x="660" y="160" width="40" height="190" fill="#257BDF" rx="3"/>
                
                <!-- X axis labels -->
                <text x="120" y="370" fill="#777777" font-size="12" text-anchor="middle">Jan</text>
                <text x="190" y="370" fill="#777777" font-size="12" text-anchor="middle">Feb</text>
                <text x="260" y="370" fill="#777777" font-size="12" text-anchor="middle">Mar</text>
                <text x="330" y="370" fill="#777777" font-size="12" text-anchor="middle">Apr</text>
                <text x="400" y="370" fill="#777777" font-size="12" text-anchor="middle">May</text>
                <text x="470" y="370" fill="#777777" font-size="12" text-anchor="middle">Jun</text>
                <text x="540" y="370" fill="#777777" font-size="12" text-anchor="middle">Jul</text>
                <text x="610" y="370" fill="#777777" font-size="12" text-anchor="middle">Aug</text>
                <text x="680" y="370" fill="#777777" font-size="12" text-anchor="middle">Sep</text>
                
                <!-- Y axis labels -->
                <text x="45" y="350" fill="#777777" font-size="12" text-anchor="end">0</text>
                <text x="45" y="300" fill="#777777" font-size="12" text-anchor="end">20</text>
                <text x="45" y="250" fill="#777777" font-size="12" text-anchor="end">40</text>
                <text x="45" y="200" fill="#777777" font-size="12" text-anchor="end">60</text>
                <text x="45" y="150" fill="#777777" font-size="12" text-anchor="end">80</text>
                <text x="45" y="100" fill="#777777" font-size="12" text-anchor="end">100</text>
                <text x="45" y="50" fill="#777777" font-size="12" text-anchor="end">120</text>
              </svg>
            </div>
            
            <div class="chart-title">Healthcare AI Performance Metrics</div>
            
            <!-- Chart insights -->
            <div class="chart-insights">
              <div class="insight-item">
                <div class="insight-title">Diagnostic Accuracy</div>
                <div class="insight-value">92.7%</div>
                <div class="insight-trend positive">+4.8% from baseline</div>
              </div>
              <div class="insight-item">
                <div class="insight-title">Processing Time</div>
                <div class="insight-value">1.3s</div>
                <div class="insight-trend positive">-24.5% improvement</div>
              </div>
              <div class="insight-item">
                <div class="insight-title">Patient Cases</div>
                <div class="insight-value">1,482</div>
                <div class="insight-trend">Analyzed this month</div>
              </div>
            </div>
          </div>
          
          <!-- Data table section -->
          <div class="data-section">
            <div class="section-header">
              <div class="section-title">Diagnostic Results by Department</div>
            </div>
            <div class="data-table-container">
              <table class="expanded-data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Tests Analyzed</th>
                    <th>Accuracy</th>
                    <th>Avg. Time (s)</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Radiology</td>
                    <td>583</td>
                    <td class="positive">94.7%</td>
                    <td>1.2</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Cardiology</td>
                    <td>421</td>
                    <td class="positive">91.2%</td>
                    <td>1.4</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Pathology</td>
                    <td>236</td>
                    <td class="neutral">87.5%</td>
                    <td>1.8</td>
                    <td>Medium</td>
                  </tr>
                  <tr>
                    <td>Neurology</td>
                    <td>158</td>
                    <td class="positive">93.1%</td>
                    <td>1.3</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td>Oncology</td>
                    <td>84</td>
                    <td class="neutral">89.6%</td>
                    <td>1.6</td>
                    <td>Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Footer actions -->
          <div class="expanded-footer">
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="#313438"/>
                </svg>
              </div>
              <span>Compare</span>
            </button>
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#313438"/>
                </svg>
              </div>
              <span>Schedule Analysis</span>
            </button>
            <button class="action-btn secondary">
              <div class="btn-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 17.2773L21.5 12.2773L16.5 7.27734L15.09 8.68734L17.67 11.2773H8.5V13.2773H17.67L15.09 15.8673L16.5 17.2773Z" fill="#313438"/>
                  <path d="M18.5 19.2773H4.5V5.27734H18.5V7.27734H20.5V5.27734C20.5 4.17734 19.61 3.27734 18.5 3.27734H4.5C3.4 3.27734 2.5 4.17734 2.5 5.27734V19.2773C2.5 20.3773 3.4 21.2773 4.5 21.2773H18.5C19.61 21.2773 20.5 20.3773 20.5 19.2773V17.2773H18.5V19.2773Z" fill="#313438"/>
                </svg>
              </div>
              <span>Export Report</span>
            </button>
            <button class="action-btn primary">
              <span>Share With Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

// Props 
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// State
const collapsed = ref(false);
const detailedView = ref(false);
const expandedView = ref(false);
const arrowForward = new URL('../assets/icons/arrow_forward.svg', import.meta.url).href;

// Chart types for the chart selector
const chartTypes = [
  { name: 'Bar Chart', icon: '/assets/icons/bar-chart.svg' },
  { name: 'Line Chart', icon: '/assets/icons/line-chart.svg' },
  { name: 'Pie Chart', icon: '/assets/icons/pie-chart.svg' },
  { name: 'Scatter Plot', icon: '/assets/icons/scatter-chart.svg' },
  { name: 'Area Chart', icon: '/assets/icons/area-chart.svg' }
];

// Emits
const emit = defineEmits(['create-dashboard', 'explore-dataset', 'collapse-change']);

// Define the beforeunload handler
const saveStateBeforeUnload = () => {
  saveCollapsedState();
  saveDetailedViewState();
  saveExpandedViewState();
};

// Load saved state from localStorage on component mount
onMounted(() => {
  try {
    // Load collapsed state
    const savedCollapsed = localStorage.getItem('chartActionsPanelCollapsed');
    if (savedCollapsed !== null) {
      collapsed.value = JSON.parse(savedCollapsed);
      // Emit the initial state to parent
      emit('collapse-change', collapsed.value);
    }
    
    // Load detailed view state
    const savedDetailedView = localStorage.getItem('chartActionsPanelDetailedView');
    if (savedDetailedView !== null) {
      const shouldShowDetailed = JSON.parse(savedDetailedView);
      
      // Only restore detailed view if the panel is visible
      if (shouldShowDetailed && props.visible) {
        // Delay to ensure component is mounted
        setTimeout(() => {
          detailedView.value = true;
          showDetailedViewUI();
        }, 50);
      }
    }
    
    // Load expanded view state
    const savedExpandedView = localStorage.getItem('chartActionsPanelExpandedView');
    if (savedExpandedView !== null) {
      const shouldShowExpanded = JSON.parse(savedExpandedView);
      
      // Only restore expanded view if the panel is visible
      if (shouldShowExpanded && props.visible) {
        // Delay to ensure component is mounted
        setTimeout(() => {
          expandedView.value = true;
          showExpandedViewUI();
        }, 50);
      }
    }
    
    // Add beforeunload event listener to save state before page navigation
    window.addEventListener('beforeunload', saveStateBeforeUnload);
  } catch (error) {
    console.error('Error loading ChartActionsPanel state:', error);
  }
});

// Clean up event listeners when component is destroyed
onBeforeUnmount(() => {
  // Save state before unmounting
  saveCollapsedState();
  saveDetailedViewState();
  saveExpandedViewState();
  
  // Remove event listener
  window.removeEventListener('beforeunload', saveStateBeforeUnload);
});

// Save collapsed state to localStorage whenever it changes
const saveCollapsedState = () => {
  try {
    localStorage.setItem('chartActionsPanelCollapsed', JSON.stringify(collapsed.value));
  } catch (error) {
    console.error('Error saving ChartActionsPanel state:', error);
  }
};

// Save detailed view state to localStorage
const saveDetailedViewState = () => {
  try {
    localStorage.setItem('chartActionsPanelDetailedView', JSON.stringify(detailedView.value));
  } catch (error) {
    console.error('Error saving detailed view state:', error);
  }
};

// Save expanded view state to localStorage
const saveExpandedViewState = () => {
  try {
    localStorage.setItem('chartActionsPanelExpandedView', JSON.stringify(expandedView.value));
  } catch (error) {
    console.error('Error saving expanded view state:', error);
  }
};

// Helper function to show detailed view UI
const showDetailedViewUI = () => {
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.detailed-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

// Helper function to show expanded view UI
const showExpandedViewUI = () => {
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.expanded-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

// Methods
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  saveCollapsedState();
  emit('collapse-change', collapsed.value);
};

const showChartsView = () => {
  // First, make sure we're not collapsed
  collapsed.value = false;
  saveCollapsedState();
  
  // No longer emitting event for parent component
  // Instead, we handle the detailed view here
  
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Set detailed view immediately to avoid transition issues
  detailedView.value = true;
  saveDetailedViewState(); // Save detailed view state
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.detailed-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

const closeDetailedView = () => {
  // First remove the visible class to trigger proper transitions
  const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
  if (panelElement) {
    panelElement.classList.remove('visible');
    
    // Reset any inline styles that might interfere with transitions
    panelElement.style.transform = 'translateX(100%)';
  }
  
  // Delay setting detailedView to false to allow animation to complete
  setTimeout(() => {
    detailedView.value = false;
    saveDetailedViewState(); // Save detailed view state
    
    // Restore body overflow
    document.body.style.overflow = '';
    
    // Reset any inline styles on the panel
    const basicPanel = document.querySelector('.chart-actions-panel');
    if (basicPanel) {
      basicPanel.style.zIndex = '';
      basicPanel.style.transform = '';
    }
  }, 300); // Wait for transition to complete
};

const showExpandedView = () => {
  // First ensure we're not collapsed and exit detailed view
  collapsed.value = false;
  detailedView.value = false;
  saveCollapsedState();
  saveDetailedViewState();
  
  // Apply class to body for overflow control
  document.body.style.overflow = 'hidden';
  
  // Set expanded view immediately to avoid transition issues
  expandedView.value = true;
  saveExpandedViewState(); // Save expanded view state
  
  // Force a layout recalculation and ensure the panel is visible
  setTimeout(() => {
    document.body.offsetHeight; // Force reflow
    
    // Find the panel element and ensure it's visible with proper positioning
    const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
    if (panelElement) {
      panelElement.style.zIndex = '9999';
      panelElement.style.right = '0';
      panelElement.style.transform = 'none';
      
      // Remove any transform that might be causing issues
      setTimeout(() => {
        const visibleClass = document.querySelector('.chart-actions-panel.expanded-view');
        if (visibleClass) {
          visibleClass.classList.add('visible');
        }
      }, 10);
    }
  }, 10);
};

const closeExpandedView = () => {
  // First remove the visible class to trigger proper transitions
  const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
  if (panelElement) {
    panelElement.classList.remove('visible');
    
    // Reset any inline styles that might interfere with transitions
    panelElement.style.transform = 'translateX(100%)';
  }
  
  // Delay setting expandedView to false to allow animation to complete
  setTimeout(() => {
    expandedView.value = false;
    saveExpandedViewState(); // Save expanded view state
    
    // Return to detailed view
    detailedView.value = true;
    saveDetailedViewState();
    showDetailedViewUI();
    
    // Restore body overflow
    document.body.style.overflow = '';
    
    // Reset any inline styles on the panel
    const basicPanel = document.querySelector('.chart-actions-panel');
    if (basicPanel) {
      basicPanel.style.zIndex = '';
      basicPanel.style.transform = '';
    }
  }, 300); // Wait for transition to complete
};

// Watch for visibility changes
watch(() => props.visible, (newVisible, oldVisible) => {
  // If the panel becomes visible again, restore saved state
  if (newVisible && !oldVisible) {
    // When panel becomes visible, load the saved collapsed state
    try {
      const savedCollapsed = localStorage.getItem('chartActionsPanelCollapsed');
      if (savedCollapsed !== null) {
        collapsed.value = JSON.parse(savedCollapsed);
        emit('collapse-change', collapsed.value);
      }
      
      // Check if detailed view was active
      const savedDetailedView = localStorage.getItem('chartActionsPanelDetailedView');
      if (savedDetailedView !== null && JSON.parse(savedDetailedView) === true) {
        // Restore detailed view after a short delay
        setTimeout(() => {
          detailedView.value = true;
          showDetailedViewUI();
        }, 50);
      }
      
      // Check if expanded view was active
      const savedExpandedView = localStorage.getItem('chartActionsPanelExpandedView');
      if (savedExpandedView !== null && JSON.parse(savedExpandedView) === true) {
        // Restore expanded view after a short delay
        setTimeout(() => {
          expandedView.value = true;
          showExpandedViewUI();
        }, 50);
      }
    } catch (error) {
      console.error('Error restoring ChartActionsPanel state:', error);
    }
  } else if (!newVisible && oldVisible) {
    // When panel becomes hidden, remember if views were active,
    // but close them now to avoid UI inconsistencies
    if (detailedView.value) {
      // Save state but close UI
      saveDetailedViewState();
      // Close detailed view UI without changing state
      const panelElement = document.querySelector('.chart-actions-panel.detailed-view');
      if (panelElement) {
        panelElement.classList.remove('visible');
        panelElement.style.transform = 'translateX(100%)';
      }
    }
    
    if (expandedView.value) {
      // Save state but close UI
      saveExpandedViewState();
      // Close expanded view UI without changing state
      const panelElement = document.querySelector('.chart-actions-panel.expanded-view');
      if (panelElement) {
        panelElement.classList.remove('visible');
        panelElement.style.transform = 'translateX(100%)';
      }
    }
  }
});
</script>

<style scoped>
/* Import Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.chart-actions-panel {
  position: fixed;
  top: 56px; /* Match the sidebar's top position */
  right: -250px;
  width: 240px; /* Match the sidebar width exactly */
  height: calc(100vh - 56px); /* Match the sidebar height */
  display: flex;
  flex-direction: row;
  background-color: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1000; /* Increased z-index to ensure it appears above other elements */
  box-shadow: none;
  border-left: 1px solid rgba(232, 232, 232, 0.5);
}

.chart-actions-panel.visible {
  right: 0;
}

.chart-actions-panel.collapsed {
  width: 60px;
}

/* Styles for detailed view mode */
.chart-actions-panel.detailed-view {
  width: 600px;
  max-width: 100%;
  right: -600px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 9999; /* Very high z-index to ensure it's on top of everything */
  position: fixed;
  top: 56px;
  bottom: 0;
  left: auto;
  height: calc(100vh - 56px);
  border-left: 1px solid #dfdfdf;
  transform: translateX(0); /* Reset any transforms */
}

.chart-actions-panel.detailed-view.visible {
  right: 0 !important;
  border-left: 1px solid #dfdfdf;
  transform: none !important;
  opacity: 1;
  display: flex !important;
  visibility: visible !important;
}

.detailed-view .panel-content {
  padding: 0;
  overflow-y: auto; /* Allow scrolling within the panel content */
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-height: 100%;
  background-color: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(10px);
}

.panel-border {
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(232,232,232,1) 5%, rgba(85,85,85,0) 10%);
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(10px);
  height: 100%;
  overflow: hidden;
}

.collapsed .panel-content {
  padding: 16px 8px;
}

.panel-header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 17px;
  width: 100%;
}

.collapsed .panel-header-container {
  justify-content: center;
  margin-bottom: 24px;
}

.panel-toggle {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 10px;
}

.collapsed .panel-toggle {
  margin-right: 0;
}

.panel-toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  opacity: 0.8;
}

.panel-toggle-icon.flipped {
  transform: rotate(180deg);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
}

.panel-title {
  color: #323232;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 24px;
  margin: 0;
}

.panel-description {
  color: #777777;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 16px;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-action .material-icons {
  font-size: 20px;
  color: #313438;
}

.chart-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}

.add-chart-section {
  padding: 16px 24px;
  border-top: 1px solid #DADEE3;
}

.add-chart-section h3 {
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 16px 0;
}

.chart-type-selector {
  display: flex;
  gap: 16px;
}

.chart-type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.chart-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.chart-type-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-type-option span {
  color: #777777;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 16px;
}

.panel-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.action-button {
  width: 100%;
  padding: 12px 8px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: rgba(44, 228, 207, 0.1);
  transform: none;
  box-shadow: none;
}

.collapsed .action-button {
  padding: 12px 0;
  justify-content: center;
}

.button-icon {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.button-text {
  color: #777777;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

/* The panel has a left border matching the sidebar style */
.chart-actions-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(232,232,232,1) 5%, rgba(85,85,85,0) 70%);
  pointer-events: none;
}

/* Responsive styles */
@media (min-width: 1441px) {
  .panel-content {
    padding: 24px 16px;
  }
  
  .collapsed .panel-content {
    padding: 24px 8px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 700px;
  }
}

@media (max-width: 1200px) {
  .panel-content {
    padding: 16px 12px;
  }
  
  .collapsed .panel-content {
    padding: 16px 8px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 550px;
  }
}

@media (max-width: 991px) {
  .chart-actions-panel {
    top: 56px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 500px;
  }
}

@media (max-width: 768px) {
  .chart-actions-panel {
    display: flex;
    width: 240px;
    transform: translateX(100%);
    box-shadow: none;
    border-left: 1px solid rgba(232, 232, 232, 0.8);
    right: 0; /* Position at edge, will be moved by transform */
    background-color: rgba(255, 255, 255, 0.4);
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .chart-actions-panel.visible {
    transform: translateX(0);
  }
  
  .chart-actions-panel.collapsed {
    width: 60px;
  }
  
  .chart-actions-panel.detailed-view {
    position: fixed;
    top: 56px;
    bottom: 0;
    left: auto;
    right: 0;
    width: 100%;
    max-width: 100%;
    transform: translateX(100%);
    height: calc(100vh - 56px);
    box-sizing: border-box;
    z-index: 9999; /* Consistent with desktop z-index */
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .chart-actions-panel.detailed-view.visible {
    transform: translateX(0) !important;
    right: 0 !important;
    opacity: 1;
    display: flex !important;
    visibility: visible !important;
  }
  
  /* Add overlay background when panel is visible on mobile */
  .chart-actions-panel.detailed-view.visible::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
  
  .chart-type-selector {
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .chart-panel {
    height: calc(100% - 57px);
    width: 100%;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .chart-actions-panel {
    width: 80%; /* Takes up most of the screen on very small devices */
    max-width: 240px;
  }
  
  .chart-actions-panel.detailed-view {
    width: 100%;
    right: 0;
    transform: translateX(100%);
    max-width: 100%; /* Ensure full width on small screens */
  }

  .detailed-view-header {
    padding: 12px 16px;
  }

  .chart-panel {
    padding: 16px;
  }
}

.panel-title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

/* Detailed view styles */
.detailed-charts-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative; /* Add position relative */
}

.detailed-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 57px; /* Fixed height for the header */
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-button {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.detailed-view-title {
  color: #323232;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  line-height: 20px;
  word-wrap: break-word;
}

.close-button {
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-panel {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 57px); /* Account for header height */
  position: relative; /* Add position relative */
}

.empty-chart-message {
  display: none; /* Hide the empty message since we now have chart examples */
}

.empty-chart-message svg {
  margin-bottom: 16px;
}

.empty-chart-message p {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
}

.empty-chart-message span {
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #777777;
}

/* Animation for the panel appearing */
@keyframes slideInPanel {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Make sure the content doesn't shift when showing the panel */
:global(.app-container.with-detailed-panel) {
  overflow: hidden;
}

/* Add this to the end of the style section */
@supports (-webkit-overflow-scrolling: touch) {
  /* iOS-specific fixes */
  .chart-actions-panel.detailed-view {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

/* Fix for stacking context issues */
.chart-actions-panel {
  will-change: transform, opacity;
}

/* Fix for global positioning */
body {
  position: relative;
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

/* Prevent text selection during panel interactions */
.chart-actions-panel * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Chart Examples Container */
.chart-examples-container {
  display: flex;
  flex-direction: column;
  gap: 21px;
  width: 100%;
  padding: 16px 0;
}

.chart-example {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.chart-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F7F8FA;
  border-radius: 13px;
}

.pie-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

/* Data Table Styles */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
}

.data-table th {
  background: #D9D9D9;
  padding: 12px 24px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.data-table td {
  padding: 12px 24px;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.data-table .positive {
  color: #0CB670;
}

.data-table .negative {
  color: #FC5A5A;
}

/* Chart Action Buttons */
.chart-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  width: 100%;
}

.action-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  outline: none;
  border: none;
  height: 40px;
}

.action-btn.secondary {
  background: #FAFBFC;
  color: #323232;
  outline: 1px solid #DADEE3;
  outline-offset: -1px;
}

.action-btn.primary {
  background: #257BDF;
  color: white;
}

.btn-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

/* Make sure the detailed view has scrollable content */
.detailed-view .chart-panel {
  overflow-y: auto;
  padding: 24px;
}

/* Fix for mobile responsiveness of charts */
@media (max-width: 768px) {
  .chart-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .chart-example {
    max-width: 100%;
    overflow-x: auto;
  }
}

/* Styles for expanded view mode */
.chart-actions-panel.expanded-view {
  width: calc(100% - 240px);
  max-width: 100%;
  right: -100%;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 9999; /* Very high z-index to ensure it's on top of everything */
  position: fixed;
  top: 56px;
  bottom: 0;
  left: auto;
  height: calc(100vh - 56px);
  border-left: 1px solid #dfdfdf;
  transform: translateX(0); /* Reset any transforms */
  background-color: white;
}

.chart-actions-panel.expanded-view.visible {
  right: 0 !important;
  border-left: 1px solid #dfdfdf;
  transform: none !important;
  opacity: 1;
  display: flex !important;
  visibility: visible !important;
}

.expanded-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.expanded-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  width: 100%;
  padding: 16px 24px;
  border-bottom: 1px solid #DADEE3;
  position: sticky;
  top: 0;
  z-index: 10;
  height: 57px; /* Fixed height for the header */
  box-sizing: border-box;
  background-color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E1F5F2;
  border-radius: 16px;
  padding: 4px 12px;
  height: 24px;
}

.header-badge span {
  font-size: 12px;
  font-weight: 500;
  color: #00A389;
  font-family: 'DM Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  width: 240px;
  height: 36px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  border: 1px solid #DADEE3;
  padding: 0 16px 0 36px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #323232;
  background-color: #F7F8FA;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #5C88DA;
  box-shadow: 0 0 0 2px rgba(92, 136, 218, 0.2);
}

.search-input::placeholder {
  color: #7E8794;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #F7F8FA;
}

.action-icon:hover {
  background-color: #E8EBF0;
}

.back-button, .close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #F7F8FA;
}

.back-button:hover, .close-button:hover {
  background-color: #E8EBF0;
}

.expanded-view-title {
  color: #323232;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  line-height: 24px;
  word-wrap: break-word;
}

.expanded-content {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-chart-area {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #F7F8FA;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
  margin-top: 8px;
}

.chart-insights {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.insight-item {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: #F7F8FA;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-title {
  font-size: 14px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.insight-value {
  font-size: 24px;
  font-weight: 600;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
}

.insight-trend {
  font-size: 12px;
  color: #777777;
  font-family: 'DM Sans', sans-serif;
}

.insight-trend.positive {
  color: #0CB670;
}

.insight-trend.negative {
  color: #FC5A5A;
}

.data-section {
  width: 100%;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #323232;
  font-family: 'DM Sans', sans-serif;
}

.data-table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.expanded-data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
}

.expanded-data-table th {
  background: #F7F8FA;
  padding: 12px 24px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
}

.expanded-data-table td {
  padding: 12px 24px;
  font-size: 14px;
  color: #323232;
  border-bottom: 1px solid #DADEE3;
  background: white;
}

.expanded-data-table .positive {
  color: #0CB670;
}

.expanded-data-table .negative {
  color: #FC5A5A;
}

.expanded-data-table .neutral {
  color: #FFA500;
}

.expanded-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  width: 100%;
  border-top: 1px solid #DADEE3;
  margin-top: 16px;
}

/* Responsive styles for expanded view */
@media (max-width: 1200px) {
  .chart-actions-panel.expanded-view {
    width: calc(100% - 200px);
  }
  
  .chart-insights {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-container {
    width: 180px;
  }
}

@media (max-width: 992px) {
  .chart-actions-panel.expanded-view {
    width: calc(100% - 100px);
  }
  
  .header-badge {
    display: none;
  }
}

@media (max-width: 768px) {
  .chart-actions-panel.expanded-view {
    width: 100%;
    left: 0;
    right: 0;
  }
  
  .chart-container {
    gap: 24px;
  }
  
  .expanded-content {
    padding: 16px;
  }
  
  .expanded-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .expanded-view-header {
    padding: 12px 16px;
  }
  
  .search-container {
    width: 140px;
  }
  
  .action-icons {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .expanded-view-header {
    padding: 12px 16px;
    height: auto;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-container {
    width: 100%;
    max-width: 220px;
  }
  
  .expanded-content {
    padding: 12px;
  }
  
  .chart-title {
    font-size: 18px;
  }
  
  .insight-value {
    font-size: 20px;
  }
}
</style> 