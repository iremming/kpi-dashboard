# Architecture

## System Overview

The KPI Dashboard is built as a modern, serverless web application using a three-tier architecture:

- **Presentation Layer**: React-based frontend with responsive UI components
- **API Layer**: Node.js serverless functions for data access
- **Data Layer**: PostgreSQL database with optimized schema for analytics

## Frontend Architecture

### React Application Structure

```
src/
├── components/          # React UI components
│   ├── ActiveUsersCard.jsx
│   ├── ChurnRateCard.jsx
│   ├── NorthAmericaRevenueChart.jsx  # Enhanced multi-region chart
│   └── RevenueByRegionChart.jsx
├── db/                  # Database utilities
│   ├── connection.js    # Database connection management
│   ├── schema.js        # Table creation and schema
│   ├── mockData.js      # Mock data generation
│   └── index.js         # Database module exports
├── App.jsx              # Root application component
├── main.jsx             # Application entry point
└── index.css            # Global styles and responsive design
```

### Component Architecture

Each dashboard component follows a consistent pattern:

1. **State Management**: Uses React hooks (`useState`, `useEffect`)
2. **Data Fetching**: Async API calls with loading and error states
3. **Error Handling**: Graceful degradation with user-friendly messages
4. **Responsive Design**: Mobile-first CSS with breakpoints
5. **Accessibility**: Semantic HTML and ARIA attributes

#### Component Props and State Pattern

```javascript
// Standard component structure
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Loading, error, and success states handled consistently
};
```

### Chart Library Integration

**Recharts Configuration**:
- Responsive containers for mobile compatibility
- Custom tooltips with branded styling
- Dark theme color palette
- Smooth animations and hover states
- Currency and percentage formatters
- **Multi-region support**: Interactive legends with highlighting
- **Accessibility features**: WCAG AA compliant colors and keyboard navigation

## API Layer Architecture

### Serverless Functions

API endpoints are implemented as Vercel serverless functions in the `/api` directory:

```
api/
├── active-users.js           # Active user metrics endpoint
├── churn-rate.js             # Churn rate analytics endpoint
├── north-america-revenue.js  # Legacy regional revenue (updated for all regions)
├── all-regions-revenue.js    # New comprehensive multi-region endpoint
└── revenue-by-region.js      # Cross-region revenue comparison
```

#### New Multi-Region Endpoint

**`/api/all-regions-revenue.js`**: Comprehensive endpoint for multi-region revenue analysis
- **Purpose**: Optimized data structure for multi-region line charts
- **Data Format**: Monthly data points with all regions' revenue organized for efficient chart rendering
- **Query Strategy**: Single query with region aggregation and date formatting
- **Response Structure**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "month": "Jan 2025",
        "date": "2025-01-01",
        "NorthAmerica": 22500.00,
        "Europe": 18000.00,
        "AsiaPacific": 12000.00,
        "LatinAmerica": 5500.00
      }
    ],
    "count": 12,
    "regions": ["North America", "Europe", "Asia Pacific", "Latin America"],
    "description": "Monthly revenue data for all regions over the past 12 months"
  }
  ```

### API Design Principles

1. **RESTful Endpoints**: Standard HTTP methods and status codes
2. **Consistent Response Format**:
   ```json
   {
     "success": true,
     "data": {...},
     "count": 4,
     "error": null
   }
   ```
3. **CORS Headers**: Cross-origin support for frontend integration
4. **Error Handling**: Structured error responses with debugging info
5. **Connection Management**: Automatic database connection cleanup
6. **Data Optimization**: Efficient query patterns for dashboard-specific use cases

### Database Connection Strategy

```javascript
// Connection pattern used across all endpoints
let client;
try {
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  // Query execution
} catch (error) {
  // Error handling
} finally {
  if (client) await client.end();
}
```

## Database Architecture

### Schema Design

#### monthly_metrics Table
```sql
CREATE TABLE monthly_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  mrr DECIMAL(12, 2) NOT NULL,
  churn_rate DECIMAL(5, 2) NOT NULL,
  active_users INTEGER NOT NULL,
  new_signups INTEGER NOT NULL
);
```

#### revenue_by_region Table
```sql
CREATE TABLE revenue_by_region (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  region TEXT NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL
);
```

### Data Model Relationships

- **Time-series Data**: Both tables use `date` for temporal analysis
- **Regional Data**: Four regions (North America, Europe, Asia Pacific, Latin America)
- **Metrics Correlation**: MRR from monthly_metrics correlates with revenue_by_region totals
- **Multi-region Analytics**: Optimized queries for cross-regional comparisons and trend analysis

### Query Optimization

1. **Date Indexing**: Queries optimized for date-based filtering
2. **Sorting**: `ORDER BY date DESC` for latest-first retrieval
3. **Limiting**: `LIMIT` clauses to prevent excessive data transfer
4. **Aggregation**: SUM and MAX operations for regional analysis
5. **Multi-region Queries**: Efficient data transformation for chart consumption

#### Multi-Region Query Pattern

```sql
-- Optimized query for multi-region chart data
SELECT 
  TO_CHAR(date, 'Mon YYYY') as month,
  date,
  region,
  revenue
FROM revenue_by_region 
WHERE date >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY date ASC, region;
```

**Data Transformation Strategy**:
- Server-side aggregation by month
- Region-specific property creation for chart compatibility
- Sorted chronologically for optimal chart rendering

## Data Flow Architecture

### Client-Side Data Flow

1. **Component Mount**: `useEffect` triggers API call
2. **Loading State**: UI shows loading indicator
3. **API Request**: Fetch data from serverless endpoint
4. **Response Processing**: Parse JSON and update component state
5. **Render Cycle**: Display data in charts/cards
6. **Error Handling**: Show error states if requests fail
7. **Interactive Features**: Handle legend interactions and chart highlighting

### Server-Side Data Flow

1. **Request Reception**: Serverless function receives HTTP request
2. **Database Connection**: Establish PostgreSQL connection
3. **Query Execution**: Run SQL queries with error handling
4. **Data Processing**: Format results for frontend consumption
5. **Response Generation**: Return JSON with CORS headers
6. **Connection Cleanup**: Close database connection

#### Multi-Region Data Processing Flow

```javascript
// Server-side data transformation for multi-region charts
result.rows.forEach(row => {
  const monthKey = row.month;
  if (!dataByMonth[monthKey]) {
    dataByMonth[monthKey] = {
      month: monthKey,
      date: row.date
    };
  }
  
  // Create region-specific property
  const regionKey = row.region.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  dataByMonth[monthKey][regionKey] = parseFloat(row.revenue);
});

// Convert to array format sorted by date
const chartData = Object.values(dataByMonth).sort((a, b) => new Date(a.date) - new Date(b.date));
```

## Infrastructure Architecture

### Development Environment

- **Vite Dev Server**: Hot reload at `localhost:3000`
- **Local PostgreSQL**: Development database
- **Environment Variables**: `.env.local` for configuration

### Production Deployment (Vercel)

- **Static Site**: React app built and deployed as static files
- **Serverless Functions**: API endpoints as Vercel functions
- **Edge Caching**: Static assets cached at CDN edge
- **Environment Variables**: Production secrets managed via Vercel dashboard

### Database Hosting Options

1. **Local Development**: PostgreSQL on developer machine
2. **Staging**: Heroku Postgres or Railway
3. **Production**: AWS RDS, Google Cloud SQL, or Neon

## Security Architecture

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (secret)
- No API keys required for current implementation

### Data Protection
- Database credentials stored as environment variables
- CORS headers configured for specific origins
- No sensitive data exposed in frontend code
- SQL injection prevention through parameterized queries

### Error Handling
- Generic error messages in production
- Detailed error logging server-side
- No database schema exposure in error responses

## Performance Architecture

### Frontend Optimizations

1. **Component Memoization**: Prevent unnecessary re-renders
2. **Lazy Loading**: Code splitting for large components
3. **Asset Optimization**: Vite's built-in optimization
4. **Responsive Images**: Optimized for different screen sizes
5. **Chart Performance**: Optimized multi-region rendering with selective highlighting

### Backend Optimizations

1. **Connection Pooling**: Reuse database connections
2. **Query Optimization**: Indexed queries and appropriate LIMIT clauses
3. **Caching Strategy**: Consider Redis for frequently accessed data
4. **Serverless Cold Start**: Minimize function initialization time
5. **Multi-region Queries**: Single query with server-side aggregation

### Database Optimizations

1. **Indexing Strategy**:
   ```sql
   CREATE INDEX idx_monthly_metrics_date ON monthly_metrics(date DESC);
   CREATE INDEX idx_revenue_by_region_date ON revenue_by_region(date DESC);
   CREATE INDEX idx_revenue_by_region_date_region ON revenue_by_region(date, region);
   ```

2. **Query Patterns**: Optimized for dashboard use cases
3. **Data Archiving**: Strategy for handling historical data growth
4. **Multi-region Optimization**: Efficient cross-regional aggregation queries

## Scalability Considerations

### Horizontal Scaling
- Serverless functions auto-scale with traffic
- Database connection pooling for concurrent requests
- CDN distribution for static assets

### Vertical Scaling
- Database instance sizing based on data volume
- Memory allocation for serverless functions
- Query optimization for large datasets

### Future Architecture Enhancements

1. **Caching Layer**: Redis for frequently accessed metrics
2. **Real-time Updates**: WebSocket connections for live data
3. **Data Warehouse**: Separate OLAP system for complex analytics
4. **Microservices**: Split API into domain-specific services
5. **Authentication**: User management and role-based access
6. **Monitoring**: Application performance monitoring (APM)
7. **Advanced Multi-region Features**: Region filtering, custom date ranges, comparative analysis

## Recent Architectural Changes

### Multi-Region Revenue Enhancement

**Implemented**: Enhanced revenue trend analysis with comprehensive multi-region support
- **New API Endpoint**: `/api/all-regions-revenue` optimized for multi-region chart data
- **Enhanced Component**: `NorthAmericaRevenueChart` now displays all four regions with interactive features
- **Improved Data Flow**: Server-side aggregation and client-side interactive highlighting
- **Accessibility Improvements**: WCAG AA compliance and keyboard navigation
- **Performance Optimization**: Memoized components and efficient re-rendering strategies

**Benefits**:
- **Enhanced Business Intelligence**: Complete regional revenue visibility in a single view
- **Improved User Experience**: Interactive legend with performance ranking and highlighting
- **Better Accessibility**: Comprehensive keyboard navigation and screen reader support
- **Scalable Foundation**: Architecture supports future regional expansion and feature additions

---

*This architecture supports the current dashboard requirements while providing a foundation for future enhancements and scaling.*