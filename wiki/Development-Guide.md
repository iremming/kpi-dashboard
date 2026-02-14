# Development Guide

This guide covers the complete development workflow for the KPI Dashboard, from initial setup to testing and debugging procedures.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **PostgreSQL**: Version 12 or higher
- **Git**: For version control
- **Code Editor**: VS Code recommended with React/JavaScript extensions

### Development Environment Setup

#### 1. PostgreSQL Installation

**macOS (using Homebrew):**
bash
brew install postgresql
brew services start postgresql

# Create database
createdb kpi_dashboard


**Ubuntu/Debian:**
bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb kpi_dashboard


**Windows:**
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Use pgAdmin or command line to create `kpi_dashboard` database

#### 2. Project Setup

bash
# Clone the repository
git clone <repository-url>
cd kpi-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local  # If .env.example exists
# OR create new .env.local file


#### 3. Environment Configuration

Create `.env.local` file in the project root:

env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/kpi_dashboard"

# Development settings
NODE_ENV=development

# Optional: API configuration
API_BASE_URL=http://localhost:3000


**Connection String Format:**

postgresql://[username]:[password]@[host]:[port]/[database_name]


#### 4. Database Initialization

bash
# Initialize database schema and seed with mock data
npm run seed

# Verify database setup
psql $DATABASE_URL -c "SELECT COUNT(*) FROM monthly_metrics;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM revenue_by_region;"


## Development Workflow

### Starting Development Server

bash
# Start the development server with hot reload
npm run dev

# Server will start at http://localhost:3000
# API endpoints available at http://localhost:3000/api/*


### Code Organization Principles

#### Project Structure

kpi-dashboard/
├── api/                    # Serverless API functions
│   ├── active-users.js
│   ├── churn-rate.js
│   ├── north-america-revenue.js
│   └── revenue-by-region.js
├── src/
│   ├── components/         # React components
│   │   ├── ActiveUsersCard.jsx
│   │   ├── ChurnRateCard.jsx
│   │   ├── NorthAmericaRevenueChart.jsx
│   │   └── RevenueByRegionChart.jsx
│   ├── db/                 # Database utilities
│   │   ├── connection.js
│   │   ├── schema.js
│   │   ├── mockData.js
│   │   └── index.js
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── scripts/               # Utility scripts
│   └── seed.js           # Database seeding script
├── wiki/                  # Project documentation
└── test-*.js             # API testing scripts


#### Component Development Guidelines

1. **Consistent Component Structure:**
   javascript
   const ComponentName = () => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       fetchData();
     }, []);

     // Helper functions
     const fetchData = async () => { ... };

     // Render logic with loading, error, and success states
     if (loading) return <LoadingState />;
     if (error) return <ErrorState />;
     return <SuccessState />;
   };
   

2. **State Management Pattern:**
   - Use `useState` for component-level state
   - Use `useEffect` for side effects and API calls
   - Always handle loading, error, and success states
   - Clean up subscriptions in `useEffect` cleanup function

3. **API Integration Pattern:**
   javascript
   const fetchData = async () => {
     try {
       setLoading(true);
       setError(null);
       
       const response = await fetch('/api/endpoint');
       
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       
       const result = await response.json();
       
       if (!result.success) {
         throw new Error(result.error || 'Failed to fetch data');
       }
       
       setData(result.data);
     } catch (err) {
       console.error('Error fetching data:', err);
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   

#### API Development Guidelines

1. **Serverless Function Structure:**
   javascript
   import { Client } from 'pg';

   export default async function handler(req, res) {
     // Method validation
     if (req.method !== 'GET') {
       return res.status(405).json({ error: 'Method not allowed' });
     }

     let client;

     try {
       // Database connection
       client = new Client({
         connectionString: process.env.DATABASE_URL
       });
       
       await client.connect();

       // Query execution
       const result = await client.query('SELECT ...');

       // CORS headers
       res.setHeader('Access-Control-Allow-Origin', '*');
       res.setHeader('Access-Control-Allow-Methods', 'GET');
       res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

       // Success response
       res.status(200).json({
         success: true,
         data: result.rows,
         count: result.rows.length
       });

     } catch (error) {
       console.error('Database error:', error);
       
       res.status(500).json({
         success: false,
         error: 'Failed to fetch data',
         message: error.message
       });
     } finally {
       if (client) {
         await client.end();
       }
     }
   }
   

2. **Database Connection Best Practices:**
   - Always close connections in `finally` block
   - Use parameterized queries to prevent SQL injection
   - Handle connection errors gracefully
   - Set appropriate timeouts for production

### Testing Procedures

#### API Endpoint Testing

The project includes dedicated test scripts for each API endpoint:

bash
# Test active users endpoint
npm run test-api

# Test churn rate endpoint
npm run test-churn

# Test revenue by region endpoint
node test-revenue-by-region.js

# Test North America revenue endpoint (manual)
curl http://localhost:3000/api/north-america-revenue


#### Manual Testing Checklist

**Frontend Components:**
- [ ] All components render without errors
- [ ] Loading states display correctly
- [ ] Error states show user-friendly messages
- [ ] Data displays with proper formatting
- [ ] Charts are interactive and responsive
- [ ] Mobile layout works on different screen sizes

**API Endpoints:**
- [ ] All endpoints return valid JSON
- [ ] Error responses include appropriate status codes
- [ ] CORS headers are set correctly
- [ ] Database connections are properly closed
- [ ] Query performance is acceptable

**Database:**
- [ ] Tables exist with correct schema
- [ ] Data is properly seeded
- [ ] Queries return expected results
- [ ] Indexes are created for performance

#### Integration Testing

bash
# Start development server
npm run dev

# In another terminal, run integration tests
node test-integration.js  # If exists

# Manual browser testing
# 1. Visit http://localhost:3000
# 2. Verify all components load
# 3. Check browser console for errors
# 4. Test responsive behavior


### Debugging Tips

#### Common Development Issues

1. **Database Connection Errors:**
   bash
   # Check if PostgreSQL is running
   pg_ctl status
   # OR
   brew services list | grep postgresql
   
   # Test connection manually
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Check environment variables
   echo $DATABASE_URL
   

2. **Port Already in Use:**
   bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   
   # Or use different port
   npm run dev -- --port 3001
   

3. **Module Import Errors:**
   bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   

4. **API Endpoint 404 Errors:**
   - Verify file is in `/api` directory
   - Check file naming (must match endpoint path)
   - Ensure default export is present
   - Restart development server

#### Browser DevTools Debugging

1. **Console Errors:**
   - Open browser DevTools (F12)
   - Check Console tab for JavaScript errors
   - Look for network request failures in Network tab

2. **Component State Debugging:**
   javascript
   // Add debug logging to components
   useEffect(() => {
     console.log('Component state:', { data, loading, error });
   }, [data, loading, error]);
   

3. **API Response Debugging:**
   javascript
   // Log API responses
   const response = await fetch('/api/endpoint');
   console.log('API Response:', response.status, await response.json());
   

#### Server-Side Debugging

1. **API Function Logs:**
   javascript
   // Add logging to serverless functions
   export default async function handler(req, res) {
     console.log('Request received:', req.method, req.url);
     console.log('Headers:', req.headers);
     
     try {
       const result = await client.query(query);
       console.log('Query result:', result.rowCount, 'rows');
     } catch (error) {
       console.error('Query error:', error.message);
     }
   }
   

2. **Database Query Debugging:**
   bash
   # Enable PostgreSQL query logging
   # Add to postgresql.conf:
   log_statement = 'all'
   log_duration = on
   
   # View logs
   tail -f /var/log/postgresql/postgresql-*.log
   

### Performance Optimization

#### Frontend Performance

1. **Component Optimization:**
   javascript
   // Memoize expensive calculations
   const expensiveValue = useMemo(() => {
     return data?.map(item => complexCalculation(item));
   }, [data]);
   
   // Prevent unnecessary re-renders
   const MemoizedComponent = React.memo(Component);
   

2. **Bundle Analysis:**
   bash
   # Analyze bundle size
   npm run build
   npx vite-bundle-analyzer dist
   

#### Backend Performance

1. **Database Query Optimization:**
   sql
   -- Add indexes for common queries
   CREATE INDEX IF NOT EXISTS idx_monthly_metrics_date 
   ON monthly_metrics(date DESC);
   
   CREATE INDEX IF NOT EXISTS idx_revenue_by_region_date_region 
   ON revenue_by_region(date, region);
   

2. **Connection Pooling (Production):**
   javascript
   // For production, consider connection pooling
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   

### Code Quality Tools

#### Linting and Formatting

bash
# ESLint is configured in Vite
# Check for linting errors
npm run lint  # If script exists

# Format code (if Prettier is configured)
npm run format  # If script exists


#### Pre-commit Hooks (Optional)

bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "git add"]
  }
}


### Environment Management

#### Development vs Production

- **Development**: Uses local PostgreSQL, detailed error messages, hot reload
- **Production**: Uses hosted database, generic error messages, optimized builds

#### Environment Variables

bash
# Development (.env.local)
DATABASE_URL="postgresql://localhost:5432/kpi_dashboard"
NODE_ENV=development

# Production (managed by hosting platform)
DATABASE_URL="postgresql://prod-host:5432/prod_db"
NODE_ENV=production


### Git Workflow

#### Branch Strategy

bash
# Feature development
git checkout -b feature/new-component
git commit -m "Add new dashboard component"
git push origin feature/new-component

# Create pull request
# After review and merge:
git checkout main
git pull origin main
git branch -d feature/new-component


#### Commit Message Conventions

- Use imperative mood: "Add", "Fix", "Update"
- Keep first line under 72 characters
- Include context in body if needed

Examples:

Add revenue trend chart component

Implements line chart for North America revenue
with responsive design and error handling.

Fix database connection leak in API endpoints

Ensures connections are properly closed in
finally blocks to prevent connection pool
exhaustion.


### Troubleshooting Common Issues

#### "Cannot connect to database"
1. Check PostgreSQL service is running
2. Verify DATABASE_URL format
3. Test connection with psql command
4. Check firewall settings

#### "Module not found" errors
1. Verify file paths and imports
2. Check case sensitivity (Linux/Mac)
3. Clear npm cache and reinstall

#### "Port 3000 already in use"
1. Kill existing process on port 3000
2. Use different port with --port flag
3. Check for other dev servers running

#### Charts not rendering
1. Check browser console for errors
2. Verify Recharts import statements
3. Ensure data format matches chart expectations
4. Test with mock data

#### API endpoints returning 404
1. Verify file is in /api directory
2. Check filename matches URL path
3. Ensure default export function
4. Restart development server

### Development Resources

- **React Documentation**: [react.dev](https://react.dev)
- **Recharts Documentation**: [recharts.org](https://recharts.org)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **PostgreSQL Documentation**: [postgresql.org](https://www.postgresql.org/docs/)
- **Vercel Functions**: [vercel.com/docs/functions](https://vercel.com/docs/functions)

---

*This development guide is maintained to reflect the current project structure and best practices. Update as the project evolves.*