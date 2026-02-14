# KPI Dashboard Wiki

Welcome to the KPI Dashboard project documentation. This wiki serves as the comprehensive knowledge base for our business intelligence dashboard built with React, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+ database
- Environment variable: `DATABASE_URL`

### Setup Instructions

1. **Clone and Install**
   bash
   git clone <repository-url>
   cd kpi-dashboard
   npm install
   

2. **Database Setup**
   bash
   # Set your PostgreSQL connection string
   export DATABASE_URL="postgresql://username:password@localhost:5432/kpi_dashboard"
   
   # Initialize database with mock data
   npm run seed
   

3. **Development**
   bash
   # Start development server
   npm run dev
   
   # Visit http://localhost:3000
   

4. **Testing**
   bash
   # Test API endpoints
   npm run test-api
   npm run test-churn
   node test-revenue-by-region.js
   

## 📋 Project Overview

The KPI Dashboard is a modern business intelligence application that provides real-time insights into key performance metrics for SaaS businesses. It displays:

- **Active Users**: Monthly active user count with growth trends
- **Churn Rate**: Customer retention metrics with month-over-month analysis
- **Revenue Analytics**: Regional revenue distribution and North America trends
- **Interactive Charts**: Responsive visualizations using Recharts library

### Key Features

- 📊 **Real-time Metrics**: Live data from PostgreSQL database
- 📱 **Responsive Design**: Mobile-first approach with dark theme
- 🚀 **Serverless API**: Vercel-ready API endpoints
- 📈 **Interactive Charts**: Line charts, bar charts with hover states
- 🔄 **Growth Indicators**: Visual trend analysis with color-coded indicators
- 🌐 **Cross-platform**: Works on desktop, tablet, and mobile devices

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
- `GET /api/north-america-revenue` - 12-month North America revenue trend
- `GET /api/revenue-by-region` - Latest revenue by all regions

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