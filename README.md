# AI Analytics Platform with Observable Plot & SpacetimeDB

A modern analytics platform that combines the power of Observable Plot for visualization with SpacetimeDB for data management, and adds AI capabilities for enhanced data analysis.

## Project Overview

This project provides an analytics platform with the following features:

- Interactive data visualizations using Observable Plot
- Real-time data storage with SpacetimeDB
- AI-powered analytics with code generation
- Custom chart creation and editing
- Sample data generation for testing

## Project Structure

```
ai-analytics-platform/
├── backend/                  # Backend Rust code and SpacetimeDB integration
│   ├── analytics/            # Rust modules for analytics
│   ├── bridge/               # Node.js API bridge
│   └── config/               # Configuration files
├── frontend/                 # Vue.js frontend application
│   ├── components/           # Vue components
│   │   ├── ObservablePlot.vue  # Observable Plot component wrapper
│   │   └── CodeEditor.vue      # Code editor with AI integration
│   ├── pages/                # Page components
│   │   ├── AnalyticsDashboard.vue  # Main dashboard page
│   │   └── NotFound.vue          # 404 page
│   ├── stores/               # Pinia state management
│   │   └── analytics.js      # Store for analytics data
│   ├── utils/                # Utility functions
│   │   └── api.js            # API client utilities
│   ├── router/               # Vue Router configuration
│   ├── App.vue               # Root component
│   └── main.js               # Application entry point
└── docs/                     # Documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Rust (latest stable version)
- SpacetimeDB CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-analytics-platform.git
   cd ai-analytics-platform
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   cargo build
   ```

4. Install SpacetimeDB CLI (if not already installed):
   ```bash
   cargo install spacetime
   ```

### Running the Application

1. Start the SpacetimeDB backend:
   ```bash
   cd backend
   cargo run
   ```

2. Start the API bridge:
   ```bash
   cd backend/bridge
   npm install
   npm start
   ```

3. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Features

### Data Visualization

The platform uses Observable Plot to create interactive data visualizations:

- Line charts
- Bar charts
- Scatter plots
- Area charts
- Custom visualizations with code editor

### AI Integration

The platform includes AI capabilities for enhanced analytics:

- Code generation for custom visualizations
- Data pattern recognition
- Anomaly detection

### Data Management

- Real-time data storage with SpacetimeDB
- Data categorization
- Sample data generation

## Technologies Used

- **Frontend**: Vue.js, Pinia, Observable Plot
- **Backend**: Rust, SpacetimeDB, Node.js
- **Tools**: Vite, Cargo

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 