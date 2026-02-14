# KPI Dashboard Wiki

Welcome to the KPI Dashboard project documentation. This wiki serves as the comprehensive knowledge base for our business intelligence dashboard built with React, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+ database
- Environment variable: `DATABASE_URL`

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd kpi-dashboard
   npm install
   ```

2. **Database Setup**
   ```bash
   # Set your PostgreSQL connection string
   export DATABASE_URL="postgresql://username:password@localhost:5432/kpi_dashboard"
   
   # Initialize database with mock data
   npm run seed
   ```

3. **Development**
   ```bash
   # Start development server
   npm run dev
   
   # Visit http://localhost:3000
   ```

4. **Testing**
   ```bash
   # Test API endpoints
   npm run test-api
   npm run test-churn
   node test-revenue-by-region.js
   ```

## 📋 Project Overview

The KPI Dashboard is a modern business intelligence application that provides real-time insights into key performance metrics for SaaS businesses. It displays:

- **Active Users**: Monthly active user count with growth trends
- **Churn Rate**: Customer retention metrics with month-over-month analysis
- **Multi-Region Revenue Trends**: Interactive line chart showing 12-month revenue trends for all four regions
- **Revenue by Region Comparison**: Bar chart comparing latest revenue across all regions
- **Interactive Charts**: Responsive visualizations using Recharts library

### Key Features

- 📊 **Real-time Metrics**: Live data from PostgreSQL database
- 📱 **Responsive Design**: Mobile-first approach with dark theme
- 🚀 **Serverless API**: Vercel-ready API endpoints
- 📈 **Interactive Multi-Region Charts**: Line charts with interactive legends, bar charts with performance ranking
- 🔄 **Growth Indicators**: Visual trend analysis with color-coded indicators
- 🌐 **Cross-platform**: Works on desktop, tablet, and mobile devices
- ♿ **Accessibility**: WCAG AA compliant colors, keyboard navigation, screen reader support

### Recent Enhancements

**Multi-Region Revenue Analysis**: The revenue line chart has been enhanced to display data for all four regions (North America, Europe, Asia Pacific, Latin America) instead of just North America. Features include:
- **Four distinct trend lines** with high-contrast colors
- **Interactive legend** with click/hover to highlight specific regions
- **Enhanced tooltips** showing all regions' data with performance ranking
- **Comprehensive accessibility** with keyboard navigation and screen reader support

## 📚 Documentation Navigation

### Core Documentation
- **[Architecture](Architecture.md)** - Technical architecture, database schema, API design
- **[Components](Components.md)** - React component documentation and usage
- **[Development Guide](Development-Guide.md)** - Setup, testing, and debugging
- **[Deployment](Deployment.md)** - Production deployment instructions

### Additional Resources
- **[Troubleshooting](Troubleshooting.md)** - Common issues and solutions
- **[Performance](Performance.md)** - Optimization and monitoring
- **[Conventions](conventions/README.md)** - Code style and project standards

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Recharts** - Declarative chart library for React
- **CSS3** - Custom responsive styling

### Backend
- **Node.js** - JavaScript runtime
- **PostgreSQL** - Relational database
- **Vercel Serverless Functions** - API endpoints

### Development Tools
- **npm** - Package management
- **ESLint** - Code linting (configured in Vite)
- **Git** - Version control

## 📊 Database Schema

### Tables

1. **monthly_metrics**
   - `id`: Primary key
   - `date`: Month date (YYYY-MM-DD)
   - `mrr`: Monthly recurring revenue
   - `churn_rate`: Customer churn percentage
   - `active_users`: Active user count
   - `new_signups`: New user signups

2. **revenue_by_region**
   - `id`: Primary key
   - `date`: Month date (YYYY-MM-DD)
   - `region`: Geographic region name
   - `revenue`: Revenue amount for region

## 🔗 API Endpoints

- `GET /api/active-users` - Active user metrics with growth
- `GET /api/churn-rate` - Churn rate with month-over-month change
- `GET /api/north-america-revenue` - Multi-region revenue trend data (legacy endpoint, now supports all regions)
- `GET /api/all-regions-revenue` - 12-month revenue trends for all four regions (new endpoint)
- `GET /api/revenue-by-region` - Latest revenue comparison across all regions

### API Endpoint Updates

**Enhanced Multi-Region Support**: The revenue trend functionality now includes a new comprehensive endpoint:
- **`/api/all-regions-revenue`**: Returns 12 months of data structured for multi-region line charts
- **`/api/north-america-revenue`**: Updated to support all regions while maintaining backward compatibility
- **Optimized data format**: Monthly data points with revenue for each region organized for efficient chart rendering

## 🤝 Contributing

This project is collaboratively developed by the team and the Epicraft AI agent. See our [conventions](conventions/README.md) for contribution guidelines.

### Development Workflow
1. Read relevant wiki documentation
2. Implement changes following our conventions
3. Test using provided test scripts
4. Update documentation as needed
5. Submit pull request with clear description

---

*This documentation is maintained by both human developers and the Epicraft AI agent to ensure accuracy and completeness.*