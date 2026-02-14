# Performance Guide

This guide covers performance optimization strategies, monitoring recommendations, and best practices for maintaining optimal performance in the KPI Dashboard.

## Performance Overview

The KPI Dashboard is designed for high performance with sub-second load times and efficient resource utilization. This guide covers optimization techniques across all layers of the application.

### Current Performance Metrics

- **Initial Page Load**: < 2 seconds on 3G networks
- **API Response Time**: < 300ms average
- **Chart Rendering**: < 100ms for datasets up to 1000 points
- **Mobile Performance**: Lighthouse score 95+
- **Database Queries**: Sub-100ms with proper indexing

---

## Frontend Performance

### React Component Optimization

#### Component Memoization

javascript
// Prevent unnecessary re-renders of expensive components
const MemoizedChart = React.memo(({ data, title }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* Chart components */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// Use with comparison function for complex props
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  return prevProps.data.length === nextProps.data.length &&
         prevProps.lastUpdated === nextProps.lastUpdated;
});


#### useMemo for Expensive Calculations

javascript
const DashboardComponent = ({ rawData }) => {
  // Memoize data processing to prevent recalculation on every render
  const processedData = useMemo(() => {
    if (!rawData) return [];
    
    return rawData.map(item => ({
      ...item,
      revenue: parseFloat(item.revenue),
      formattedDate: new Date(item.date).toLocaleDateString(),
      growth: calculateGrowth(item) // Expensive calculation
    }));
  }, [rawData]);

  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
  }), []);

  return (
    <Chart data={processedData} config={chartConfig} />
  );
};


#### useCallback for Event Handlers

javascript
const InteractiveChart = ({ data, onDataPointClick }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Memoize event handlers to prevent child re-renders
  const handlePointClick = useCallback((point) => {
    setSelectedPoint(point);
    onDataPointClick?.(point);
  }, [onDataPointClick]);

  const handleChartHover = useCallback((event) => {
    // Handle hover logic
  }, []);

  return (
    <LineChart 
      data={data} 
      onClick={handlePointClick}
      onMouseEnter={handleChartHover}
    >
      {/* Chart components */}
    </LineChart>
  );
};


### Bundle Optimization

#### Code Splitting

javascript
// vite.config.js - Manual chunk splitting
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'db-vendor': ['pg']
        }
      }
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000
  }
});


#### Dynamic Imports (Future Enhancement)

javascript
// Lazy load components that aren't immediately needed
const AdvancedAnalytics = lazy(() => import('./AdvancedAnalytics'));

const Dashboard = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div>
      {/* Core dashboard components */}
      <ActiveUsersCard />
      <ChurnRateCard />
      
      {showAdvanced && (
        <Suspense fallback={<div>Loading advanced analytics...</div>}>
          <AdvancedAnalytics />
        </Suspense>
      )}
    </div>
  );
};


### Asset Optimization

#### Image Optimization

javascript
// Future: Optimize dashboard screenshots and assets
const OptimizedImage = ({ src, alt, width, height }) => {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <source srcSet={`${src}.jpg`} type="image/jpeg" />
      <img 
        src={`${src}.jpg`} 
        alt={alt} 
        width={width} 
        height={height}
        loading="lazy"
      />
    </picture>
  );
};


#### CSS Optimization

css
/* Use CSS containment for performance */
.chart-container {
  contain: layout style paint;
}

/* Optimize animations */
.metric-card {
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.metric-card:hover {
  transform: translateY(-2px);
}

/* Use transform instead of changing layout properties */
@media (prefers-reduced-motion: reduce) {
  .metric-card {
    transition: none;
  }
}


---

## Backend Performance

### Database Query Optimization

#### Index Strategy

sql
-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_date_desc 
ON monthly_metrics(date DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_by_region_date_desc 
ON revenue_by_region(date DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_by_region_region_date 
ON revenue_by_region(region, date DESC);

-- Partial index for active data only
CREATE INDEX IF NOT EXISTS idx_recent_metrics 
ON monthly_metrics(date DESC) 
WHERE date >= CURRENT_DATE - INTERVAL '12 months';


#### Query Performance Analysis

sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT date, active_users 
FROM monthly_metrics 
ORDER BY date DESC 
LIMIT 2;

-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE mean_time > 100  -- Queries taking more than 100ms
ORDER BY mean_time DESC;


### API Optimization

#### Connection Pooling

javascript
// Production connection pool configuration
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool configuration for optimal performance
  max: 20,                    // Maximum connections
  min: 2,                     // Minimum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Wait max 2s for connection
  acquireTimeoutMillis: 60000,   // Wait max 60s to acquire connection
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});

export { pool };


#### Response Caching

javascript
// API endpoint with caching headers
export default async function handler(req, res) {
  try {
    // Set cache headers for production
    if (process.env.NODE_ENV === 'production') {
      // Cache for 5 minutes, serve stale for 1 minute while revalidating
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
      
      // ETag for conditional requests
      const etag = generateETag(req.url);
      res.setHeader('ETag', etag);
      
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
    }
    
    const result = await pool.query(query);
    
    // Add timing header for monitoring
    res.setHeader('X-Response-Time', Date.now() - req.startTime);
    
    res.json({
      success: true,
      data: result.rows,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Error handling
  }
}


#### Request/Response Compression

javascript
// For self-hosted deployments, add compression middleware
import compression from 'compression';

const app = express();

// Enable gzip compression
app.use(compression({
  level: 6,                    // Compression level (1-9)
  threshold: 1024,             // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));


---

## Database Performance

### Query Optimization Techniques

#### Efficient Data Retrieval

sql
-- Optimized query for dashboard metrics
-- Instead of separate queries, use window functions
WITH monthly_data AS (
  SELECT 
    date,
    active_users,
    churn_rate,
    LAG(active_users) OVER (ORDER BY date) as prev_active_users,
    LAG(churn_rate) OVER (ORDER BY date) as prev_churn_rate,
    ROW_NUMBER() OVER (ORDER BY date DESC) as rn
  FROM monthly_metrics
  ORDER BY date DESC
  LIMIT 2
)
SELECT 
  date,
  active_users,
  churn_rate,
  CASE 
    WHEN prev_active_users > 0 THEN 
      ((active_users - prev_active_users)::float / prev_active_users) * 100
    ELSE 0 
  END as user_growth_pct,
  CASE 
    WHEN prev_churn_rate > 0 THEN 
      ((churn_rate - prev_churn_rate)::float / prev_churn_rate) * 100
    ELSE 0 
  END as churn_change_pct
FROM monthly_data
WHERE rn = 1;


#### Connection Management

javascript
// Monitor connection pool health
const monitorPool = () => {
  setInterval(() => {
    console.log('Pool status:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });
    
    // Alert if pool is exhausted
    if (pool.waitingCount > 5) {
      console.warn('Connection pool under pressure!');
    }
  }, 30000); // Check every 30 seconds
};

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  monitorPool();
}


### Database Maintenance

sql
-- Regular maintenance queries
-- Analyze tables for optimal query plans
ANALYZE monthly_metrics;
ANALYZE revenue_by_region;

-- Check for bloat and vacuum if needed
VACUUM ANALYZE monthly_metrics;
VACUUM ANALYZE revenue_by_region;

-- Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;


---

## Monitoring and Metrics

### Performance Monitoring

#### Frontend Performance Tracking

javascript
// Performance monitoring hooks
const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('component_render_time', {
        //   component: componentName,
        //   renderTime: renderTime
        // });
      }
    };
  }, [componentName]);
};

// Usage in components
const ActiveUsersCard = () => {
  usePerformanceMonitor('ActiveUsersCard');
  
  // Component logic
};


#### API Performance Monitoring

javascript
// Middleware to track API performance
const performanceMiddleware = (req, res, next) => {
  req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    
    // Log slow requests
    if (responseTime > 500) {
      console.warn(`Slow API request: ${req.method} ${req.url} - ${responseTime}ms`);
    }
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Timestamp', new Date().toISOString());
    
    return originalSend.call(this, data);
  };
  
  next();
};


### Lighthouse Performance Optimization

javascript
// Optimize for Core Web Vitals
// 1. Largest Contentful Paint (LCP)
const optimizeLCP = () => {
  // Preload critical resources
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/api/active-users';
  link.as = 'fetch';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// 2. First Input Delay (FID) - Already optimized with React
// 3. Cumulative Layout Shift (CLS)
const preventLayoutShift = () => {
  // Ensure containers have explicit dimensions
  return (
    <div 
      className="chart-container" 
      style={{ 
        height: '350px',    // Explicit height prevents CLS
        minHeight: '350px'  // Fallback for older browsers
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* Chart content */}
      </ResponsiveContainer>
    </div>
  );
};


---

## Optimization Recommendations

### Short-term Optimizations (1-2 weeks)

1. **Database Indexing**
   - Add indexes for all date-based queries
   - Monitor query performance with EXPLAIN ANALYZE
   - Set up automated VACUUM and ANALYZE

2. **API Response Caching**
   - Implement HTTP caching headers
   - Add ETag support for conditional requests
   - Consider Redis for frequently accessed data

3. **Frontend Bundle Optimization**
   - Analyze bundle size with vite-bundle-analyzer
   - Implement manual chunk splitting
   - Add compression in production

### Medium-term Optimizations (1-2 months)

1. **Connection Pooling**
   - Replace individual connections with connection pool
   - Monitor pool health and connection usage
   - Implement graceful degradation

2. **Component Optimization**
   - Add React.memo to expensive components
   - Implement useMemo for data processing
   - Optimize chart re-rendering

3. **Performance Monitoring**
   - Set up performance tracking
   - Monitor Core Web Vitals
   - Add alerts for performance regressions

### Long-term Optimizations (3-6 months)

1. **Caching Layer**
   - Implement Redis for data caching
   - Add background data refresh
   - Cache computed metrics

2. **Database Optimization**
   - Implement read replicas for analytics
   - Consider columnar storage for large datasets
   - Add data archiving strategy

3. **Advanced Frontend Features**
   - Implement service worker for offline support
   - Add progressive web app features
   - Optimize for mobile performance

---

## Performance Testing

### Load Testing

bash
# Install artillery for API load testing
npm install -g artillery

# Create artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/active-users"
      - get:
          url: "/api/churn-rate"
      - get:
          url: "/api/revenue-by-region"

# Run load test
artillery run artillery.yml


### Database Performance Testing

sql
-- Load test queries
-- Test with larger datasets
INSERT INTO monthly_metrics (date, mrr, churn_rate, active_users, new_signups)
SELECT 
  generate_series('2020-01-01'::date, '2025-12-01'::date, '1 month'::interval),
  random() * 100000 + 50000,  -- MRR between 50k-150k
  random() * 5 + 1,           -- Churn between 1-6%
  (random() * 5000 + 2000)::int,  -- Users between 2k-7k
  (random() * 500 + 100)::int     -- Signups between 100-600
FROM generate_series(1, 72);  -- 6 years of data

-- Test query performance with larger dataset
EXPLAIN (ANALYZE, BUFFERS) 
SELECT date, active_users 
FROM monthly_metrics 
ORDER BY date DESC 
LIMIT 2;


### Frontend Performance Testing

javascript
// Performance measurement utilities
class PerformanceMonitor {
  static measureRenderTime(componentName, renderFn) {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    
    console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
  
  static measureAPICall(endpoint, apiFn) {
    const startTime = performance.now();
    
    return apiFn().then(result => {
      const endTime = performance.now();
      console.log(`${endpoint} API call: ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    });
  }
  
  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      };
    }
    return null;
  }
}

// Usage in development
if (process.env.NODE_ENV === 'development') {
  // Monitor memory usage
  setInterval(() => {
    const memory = PerformanceMonitor.getMemoryUsage();
    if (memory) {
      console.log('Memory usage:', memory);
    }
  }, 10000);
}


---

## Performance Checklist

### Development Phase
- [ ] Database queries use appropriate indexes
- [ ] Components use React.memo where beneficial
- [ ] Expensive calculations are memoized with useMemo
- [ ] Event handlers are wrapped with useCallback
- [ ] Bundle size is analyzed and optimized
- [ ] Images and assets are optimized

### Pre-Production
- [ ] Load testing completed with realistic traffic
- [ ] Database performance tested with production-sized data
- [ ] Lighthouse audit scores > 90 for all metrics
- [ ] API response times < 300ms under load
- [ ] Memory leaks checked and resolved
- [ ] Error rates < 0.1% under normal load

### Production Monitoring
- [ ] Performance monitoring configured
- [ ] Alerting set up for performance regressions
- [ ] Database monitoring active
- [ ] CDN and caching properly configured
- [ ] Regular performance audits scheduled

---

## Troubleshooting Performance Issues

### Slow API Responses

1. **Check Database Performance**
   sql
   -- Find slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   WHERE mean_time > 100 
   ORDER BY mean_time DESC;
   

2. **Monitor Connection Pool**
   javascript
   console.log('Pool health:', {
     total: pool.totalCount,
     idle: pool.idleCount,
     waiting: pool.waitingCount
   });
   

3. **Check Network Latency**
   bash
   # Test database connection latency
   time psql $DATABASE_URL -c "SELECT 1;"
   

### Slow Frontend Rendering

1. **Use React DevTools Profiler**
   - Identify components with unnecessary re-renders
   - Find expensive render cycles
   - Optimize component hierarchies

2. **Check Bundle Size**
   bash
   npm run build
   npx vite-bundle-analyzer dist
   

3. **Monitor Memory Usage**
   javascript
   // Check for memory leaks
   setInterval(() => {
     if (performance.memory) {
       const used = performance.memory.usedJSHeapSize;
       if (used > 50 * 1024 * 1024) { // 50MB threshold
         console.warn('High memory usage detected:', used);
       }
     }
   }, 5000);
   

---

*This performance guide should be reviewed and updated regularly as the application scales and new optimization techniques become available.*