# Troubleshooting Guide

This guide provides solutions to common issues encountered when developing and deploying the KPI Dashboard. Issues are organized by category with step-by-step resolution procedures.

## 🔍 Quick Diagnosis

### System Health Check

bash
# Run the complete health check
./scripts/health-check.sh  # If exists

# Manual health check steps
echo "1. Checking Node.js version..."
node --version  # Should be 18+

echo "2. Checking npm version..."
npm --version   # Should be 8+

echo "3. Checking PostgreSQL connection..."
psql $DATABASE_URL -c "SELECT version();"

echo "4. Checking database tables..."
psql $DATABASE_URL -c "\dt"

echo "5. Testing API endpoints..."
curl -s http://localhost:3000/api/active-users | jq '.success'


### Common Error Patterns

| Error Type | Quick Fix | Detailed Section |
|------------|-----------|------------------|
| Database connection failed | Check `DATABASE_URL` | [Database Issues](#database-connectivity-issues) |
| Port 3000 already in use | Kill process or use different port | [Development Issues](#development-server-issues) |
| API endpoints return 404 | Restart dev server | [API Issues](#api-endpoint-issues) |
| Components not loading | Check browser console | [Frontend Issues](#frontend-component-issues) |
| Charts not rendering | Verify data format | [Chart Issues](#chart-rendering-issues) |

---

## 🗄️ Database Connectivity Issues

### Connection Refused Errors

**Error Messages:**

connect ECONNREFUSED 127.0.0.1:5432
Error: connect ECONNREFUSED ::1:5432
fatal: password authentication failed


**Diagnosis Steps:**
bash
# 1. Check if PostgreSQL service is running
# macOS (Homebrew)
brew services list | grep postgresql
brew services start postgresql  # If not running

# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql  # If not running

# Windows
# Check Services app or use pg_ctl
pg_ctl status


**Resolution:**
1. **Start PostgreSQL Service:**
   bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   sudo systemctl enable postgresql  # Auto-start on boot
   
   # Windows
   net start postgresql-x64-14  # Adjust version as needed
   

2. **Verify Connection String:**
   bash
   # Test connection manually
   psql "postgresql://username:password@localhost:5432/kpi_dashboard"
   
   # Check environment variable
   echo $DATABASE_URL
   

3. **Create Database if Missing:**
   bash
   # Connect to default database and create project database
   psql -U postgres -c "CREATE DATABASE kpi_dashboard;"
   
   # Or using createdb utility
   createdb -U postgres kpi_dashboard
   

### Authentication Failures

**Error Messages:**

fatal: password authentication failed for user "postgres"
fatal: role "username" does not exist


**Resolution:**
1. **Reset PostgreSQL Password:**
   bash
   # macOS/Linux - Reset password for postgres user
   sudo -u postgres psql
   \password postgres
   # Enter new password
   
   # Or create new user
   sudo -u postgres createuser --superuser yourusername
   sudo -u postgres psql -c "ALTER USER yourusername PASSWORD 'yourpassword';"
   

2. **Update Connection String:**
   bash
   # Update .env.local with correct credentials
   DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/kpi_dashboard"
   

### SSL Connection Issues

**Error Messages:**

connection requires SSL
SSL connection has been closed unexpectedly


**Resolution:**
javascript
// For local development, disable SSL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// For production with hosted databases
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


### Connection Pool Exhaustion

**Error Messages:**

remaining connection slots are reserved
too many clients already
connection pool exhausted


**Resolution:**
1. **Check for Connection Leaks:**
   javascript
   // ❌ Bad: Connection not closed
   export default async function handler(req, res) {
     const client = new Client({ connectionString: process.env.DATABASE_URL });
     await client.connect();
     const result = await client.query('SELECT ...');
     // Missing: await client.end();
   }
   
   // ✅ Good: Connection properly closed
   export default async function handler(req, res) {
     let client;
     try {
       client = new Client({ connectionString: process.env.DATABASE_URL });
       await client.connect();
       const result = await client.query('SELECT ...');
       // Process result
     } finally {
       if (client) {
         await client.end();
       }
     }
   }
   

2. **Implement Connection Pooling:**
   javascript
   // Create a connection pool for production
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,                    // Maximum connections
     idleTimeoutMillis: 30000,   // Close idle connections after 30s
     connectionTimeoutMillis: 2000, // Wait 2s for connection
   });
   
   export default async function handler(req, res) {
     try {
       const result = await pool.query('SELECT ...');
       res.json({ success: true, data: result.rows });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   }
   

---

## 🚀 Development Server Issues

### Port Already in Use

**Error Messages:**

Error: listen EADDRINUSE :::3000
Port 3000 is already in use


**Resolution:**
bash
# Find process using port 3000
lsof -i :3000
# OR on Windows
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
npm run dev -- --port 3001

# Or set port in vite.config.js
export default defineConfig({
  server: {
    port: 3001
  }
});


### Module Resolution Errors

**Error Messages:**

Cannot resolve dependency
Module not found: Can't resolve 'module-name'


**Resolution:**
bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For specific module issues
npm uninstall problematic-package
npm install problematic-package

# Check for case sensitivity issues (macOS/Linux)
# Ensure import paths match exact file names


### Environment Variable Issues

**Error Messages:**

DATABASE_URL is not defined
process.env.DATABASE_URL is undefined


**Resolution:**
1. **Check Environment File:**
   bash
   # Verify .env.local exists and has correct format
   cat .env.local
   
   # Should contain:
   DATABASE_URL=postgresql://username:password@localhost:5432/kpi_dashboard
   NODE_ENV=development
   

2. **Environment Variable Loading:**
   javascript
   // Vite automatically loads .env.local for client-side
   // For server-side (API routes), ensure proper loading
   console.log('DATABASE_URL:', process.env.DATABASE_URL);
   

---

## 🔌 API Endpoint Issues

### 404 Not Found Errors

**Error Messages:**

GET /api/active-users 404 (Not Found)
API endpoint not found


**Resolution:**
1. **Verify File Structure:**
   
   api/
   ├── active-users.js      ✅ Correct
   ├── churn-rate.js        ✅ Correct
   ├── north-america-revenue.js ✅ Correct
   └── revenue-by-region.js ✅ Correct
   

2. **Check Export Format:**
   javascript
   // ✅ Correct: Default export function
   export default async function handler(req, res) {
     // API logic
   }
   
   // ❌ Wrong: Named export
   export async function handler(req, res) {
     // This won't work for Vercel functions
   }
   

3. **Restart Development Server:**
   bash
   # Stop server (Ctrl+C)
   # Then restart
   npm run dev
   

### 500 Internal Server Errors

**Diagnosis:**
javascript
// Add logging to API functions for debugging
export default async function handler(req, res) {
  console.log('API called:', req.method, req.url);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // API logic
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}


**Common Causes & Solutions:**

1. **Database Connection Failed:**
   javascript
   // Add connection validation
   let client;
   try {
     client = new Client({ connectionString: process.env.DATABASE_URL });
     await client.connect();
     console.log('Database connected successfully');
   } catch (error) {
     console.error('Database connection failed:', error.message);
     return res.status(500).json({ success: false, error: 'Database unavailable' });
   }
   

2. **SQL Query Errors:**
   javascript
   // Validate query syntax
   try {
     const query = `
       SELECT date, active_users
       FROM monthly_metrics
       ORDER BY date DESC
       LIMIT 2
     `;
     console.log('Executing query:', query);
     const result = await client.query(query);
     console.log('Query result:', result.rowCount, 'rows');
   } catch (error) {
     console.error('Query error:', error.message);
     throw error;
   }
   

### CORS Errors

**Error Messages:**

Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy


**Resolution:**
javascript
// Ensure CORS headers are set in all API endpoints
export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // API logic here
}


---

## ⚛️ Frontend Component Issues

### Components Not Rendering

**Symptoms:**
- Blank dashboard
- Components show loading state indefinitely
- Error boundaries triggered

**Diagnosis:**
javascript
// Add debug logging to components
const ActiveUsersCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('ActiveUsersCard: Component mounted');
    fetchActiveUsersData();
  }, []);
  
  useEffect(() => {
    console.log('ActiveUsersCard state:', { data, loading, error });
  }, [data, loading, error]);
  
  const fetchActiveUsersData = async () => {
    console.log('ActiveUsersCard: Fetching data...');
    try {
      const response = await fetch('/api/active-users');
      console.log('ActiveUsersCard: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('ActiveUsersCard: Response data:', result);
      
      setData(result.data);
    } catch (err) {
      console.error('ActiveUsersCard: Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Rest of component
};


**Resolution Steps:**
1. **Check Browser Console:** Look for JavaScript errors
2. **Verify API Responses:** Use Network tab to check API calls
3. **Test API Endpoints Directly:** Use curl or browser to test APIs
4. **Check Component State:** Add console.log statements

### React Hook Errors

**Error Messages:**

React Hook "useState" is called conditionally
Invalid hook call. Hooks can only be called inside function components


**Resolution:**
javascript
// ❌ Wrong: Conditional hooks
const Component = () => {
  if (condition) {
    const [state, setState] = useState(null); // Error!
  }
};

// ✅ Correct: Hooks at top level
const Component = () => {
  const [state, setState] = useState(null);
  
  if (condition) {
    // Use state here
  }
};


---

## 📊 Chart Rendering Issues

### Charts Not Displaying

**Common Causes:**
1. **Data Format Issues:**
   javascript
   // ✅ Correct format for LineChart
   const data = [
     { month: 'Jan 2025', revenue: 22500 },
     { month: 'Feb 2025', revenue: 24300 },
   ];
   
   // ❌ Wrong format
   const data = {
     months: ['Jan', 'Feb'],
     revenue: [22500, 24300]
   };
   

2. **Missing Container Dimensions:**
   javascript
   // ✅ Correct: Explicit height
   <div style={{ height: '350px' }}>
     <ResponsiveContainer width="100%" height="100%">
       <LineChart data={data}>
         {/* Chart components */}
       </LineChart>
     </ResponsiveContainer>
   </div>
   
   // ❌ Wrong: No height specified
   <ResponsiveContainer width="100%">
     <LineChart data={data}>
       {/* Chart won't render */}
     </LineChart>
   </ResponsiveContainer>
   

3. **Empty or Invalid Data:**
   javascript
   // Add data validation
   if (!data || data.length === 0) {
     return (
       <div className="chart-container">
         <div className="no-data">No data available</div>
       </div>
     );
   }
   
   // Validate data structure
   const isValidData = data.every(item => 
     item.hasOwnProperty('month') && 
     item.hasOwnProperty('revenue') &&
     !isNaN(item.revenue)
   );
   
   if (!isValidData) {
     console.error('Invalid chart data format:', data);
     return <div className="chart-error">Invalid data format</div>;
   }
   

### Chart Performance Issues

**Symptoms:**
- Slow chart rendering
- Browser freezes during chart updates
- High memory usage

**Resolution:**
javascript
// Optimize data processing
const processedData = useMemo(() => {
  if (!rawData) return [];
  
  return rawData.map(item => ({
    month: item.month,
    revenue: parseFloat(item.revenue)
  }));
}, [rawData]);

// Prevent unnecessary re-renders
const MemoizedChart = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        {/* Chart components */}
      </LineChart>
    </ResponsiveContainer>
  );
});


---

## 🏗️ Build and Deployment Issues

### Build Failures

**Error Messages:**

vite build failed
Rollup failed to resolve import
Out of memory error during build


**Resolution:**
bash
# Clear build cache
rm -rf dist node_modules/.vite

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Check for import errors
npm run build 2>&1 | grep -i "failed to resolve"

# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist


### Production API Errors

**Diagnosis:**
javascript
// Add environment-specific error handling
export default async function handler(req, res) {
  try {
    // API logic
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      // Log error server-side but don't expose details
      console.error('Production API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    } else {
      // Development: Show detailed error
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }
}


---

## ⚡ Performance Issues

### Slow API Response Times

**Diagnosis:**
javascript
// Add timing logs to API endpoints
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('API request started:', req.url);
  
  try {
    const dbStartTime = Date.now();
    const result = await client.query(query);
    const dbEndTime = Date.now();
    
    console.log('Database query time:', dbEndTime - dbStartTime, 'ms');
    console.log('Total request time:', Date.now() - startTime, 'ms');
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Request failed after:', Date.now() - startTime, 'ms');
    throw error;
  }
}


**Optimization Strategies:**

1. **Database Query Optimization:**
   sql
   -- Add indexes for frequently queried columns
   CREATE INDEX IF NOT EXISTS idx_monthly_metrics_date 
   ON monthly_metrics(date DESC);
   
   CREATE INDEX IF NOT EXISTS idx_revenue_by_region_date 
   ON revenue_by_region(date DESC);
   
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM monthly_metrics ORDER BY date DESC LIMIT 2;
   

2. **API Response Caching:**
   javascript
   // Add caching headers
   export default async function handler(req, res) {
     if (process.env.NODE_ENV === 'production') {
       res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
     }
     
     // API logic
   }
   

3. **Frontend Performance:**
   javascript
   // Debounce API calls if needed
   const debouncedFetch = useMemo(
     () => debounce(fetchData, 300),
     []
   );
   
   // Memoize expensive calculations
   const processedData = useMemo(() => {
     return data?.map(item => ({ ...item, calculated: expensiveOperation(item) }));
   }, [data]);
   

### Memory Leaks

**Detection:**
javascript
// Monitor component cleanup
useEffect(() => {
  console.log('Component mounted');
  
  return () => {
    console.log('Component unmounted - cleanup happening');
  };
}, []);

// Check for subscription cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // Some periodic task
  }, 1000);
  
  return () => {
    clearInterval(interval); // Important: cleanup interval
  };
}, []);


---

## 🔧 Error Handling Patterns

### API Error Handling Template

javascript
// Comprehensive API error handling
export default async function handler(req, res) {
  // Validate request method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  // Validate environment
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not configured');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
  }

  let client;
  const requestId = Date.now().toString(); // For request tracking

  try {
    // Database connection with timeout
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    
    console.log(`[${requestId}] Connecting to database...`);
    await client.connect();
    
    // Query execution with logging
    const startTime = Date.now();
    const result = await client.query(sqlQuery, params);
    const queryTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Query completed in ${queryTime}ms, ${result.rows.length} rows`);
    
    // Validate result
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No data available'
      });
    }
    
    // Success response with CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Error:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Categorize errors
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection failed';
    } else if (error.code?.startsWith('42')) { // SQL syntax errors
      errorMessage = 'Invalid query';
      statusCode = 400;
    } else if (error.code === '28P01') { // Authentication failed
      errorMessage = 'Database authentication failed';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: error.message,
          code: error.code
        }
      })
    });
    
  } finally {
    // Always cleanup database connection
    if (client) {
      try {
        await client.end();
        console.log(`[${requestId}] Database connection closed`);
      } catch (closeError) {
        console.error(`[${requestId}] Error closing database:`, closeError.message);
      }
    }
  }
}


### Frontend Error Handling Template

javascript
// Comprehensive component error handling
const DashboardComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchData = async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data (attempt ${attempt + 1})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('/api/endpoint', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error');
      }
      
      setData(result.data);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timeout - please try again');
      } else if (!navigator.onLine) {
        setError('No internet connection');
      } else if (attempt < 2) { // Retry up to 3 times
        console.log(`Retrying in ${(attempt + 1) * 1000}ms...`);
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchData(attempt + 1);
        }, (attempt + 1) * 1000);
        return;
      } else {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // Retry function for user-initiated retries
  const handleRetry = () => {
    setRetryCount(0);
    fetchData();
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="component-container loading">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
        {retryCount > 0 && <p>Retry {retryCount}/3</p>}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="component-container error">
        <div className="error-icon">⚠️</div>
        <h4>Unable to load data</h4>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }
  
  // Success state
  return (
    <div className="component-container">
      {/* Render data */}
    </div>
  );
};


---

## 🚨 Emergency Procedures

### Production Outage Response

1. **Immediate Assessment:**
   bash
   # Check application status
   curl -I https://your-domain.com/api/health
   
   # Check database connectivity
   psql $PRODUCTION_DATABASE_URL -c "SELECT 1;"
   
   # Check recent deployments
   vercel --version && vercel ls
   

2. **Quick Rollback (Vercel):**
   bash
   # List recent deployments
   vercel ls
   
   # Rollback to previous working deployment
   vercel rollback [previous-deployment-url]
   

3. **Database Recovery:**
   sql
   -- Check database health
   SELECT version();
   SELECT COUNT(*) FROM monthly_metrics;
   SELECT COUNT(*) FROM revenue_by_region;
   
   -- Check for recent changes
   SELECT schemaname, tablename, tableowner 
   FROM pg_tables 
   WHERE schemaname = 'public';
   

### Data Loss Recovery

bash
# Restore from backup (if available)
psql $DATABASE_URL < backup-file.sql

# Regenerate data if needed
npm run seed

# Verify data integrity
psql $DATABASE_URL -c "SELECT date, COUNT(*) FROM monthly_metrics GROUP BY date ORDER BY date;"


---

## 📞 Getting Help

### Debug Information Collection

Before reporting issues, collect this information:

bash
#!/bin/bash
# Debug info collection script

echo "=== System Information ==="
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Operating System: $(uname -a)"

echo "\n=== Environment Variables ==="
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'Yes' || echo 'No')"

echo "\n=== Database Status ==="
psql $DATABASE_URL -c "SELECT version();" 2>&1
psql $DATABASE_URL -c "SELECT COUNT(*) as monthly_metrics_count FROM monthly_metrics;" 2>&1
psql $DATABASE_URL -c "SELECT COUNT(*) as revenue_by_region_count FROM revenue_by_region;" 2>&1

echo "\n=== API Health Check ==="
curl -s http://localhost:3000/api/active-users | jq '.success' 2>&1

echo "\n=== Recent Logs ==="
tail -20 ~/.npm/_logs/*.log 2>/dev/null || echo "No npm logs found"


### Common Support Resources

- **React Issues**: [React GitHub Issues](https://github.com/facebook/react/issues)
- **Vite Issues**: [Vite GitHub Issues](https://github.com/vitejs/vite/issues)
- **PostgreSQL Issues**: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **Recharts Issues**: [Recharts GitHub Issues](https://github.com/recharts/recharts/issues)
- **Vercel Issues**: [Vercel Support](https://vercel.com/support)

---

*This troubleshooting guide is updated regularly based on encountered issues and community feedback. Keep it bookmarked for quick reference during development.*