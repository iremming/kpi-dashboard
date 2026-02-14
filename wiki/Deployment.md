# Deployment Guide

This guide covers deployment strategies and procedures for the KPI Dashboard across different platforms and environments.

## Deployment Overview

The KPI Dashboard is designed as a serverless application that can be deployed to various platforms:

- **Recommended**: Vercel (optimal for serverless functions)
- **Alternative**: Netlify with serverless functions
- **Self-hosted**: Docker containers or traditional hosting
- **Cloud**: AWS, Google Cloud, or Azure

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository with the project code
- PostgreSQL database (hosted or cloud-based)

### Quick Deployment

#### 1. Connect Repository

bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from repository root
vercel


**Or deploy via Vercel Dashboard:**
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings (auto-detected)
5. Set environment variables
6. Deploy

#### 2. Build Configuration

Vercel automatically detects the Vite configuration. No additional setup needed.

**Automatic Configuration:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

#### 3. Environment Variables

Set environment variables in Vercel Dashboard:

**Production Variables:**

DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production


**Setting via CLI:**
bash
vercel env add DATABASE_URL production
vercel env add NODE_ENV production


**Setting via Dashboard:**
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add `DATABASE_URL` and `NODE_ENV`
4. Select appropriate environments (Production, Preview, Development)

#### 4. API Routes Configuration

Vercel automatically handles `/api` routes as serverless functions. No additional configuration required.

**Function Configuration (optional):**

Create `vercel.json` in project root:

{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x",
      "memory": 512,
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}


#### 5. Custom Domain (Optional)

bash
# Add custom domain via CLI
vercel domains add yourdomain.com
vercel domains link yourdomain.com your-project

# Or configure in Dashboard:
# Project Settings > Domains > Add Domain


### Deployment Commands

bash
# Deploy to production
vercel --prod

# Deploy preview (branch deployments)
vercel

# Deploy with environment
vercel --prod --env DATABASE_URL=@database-url-prod

# Redeploy latest
vercel --prod --force


## Database Deployment

### Hosted PostgreSQL Options

#### 1. Neon (Recommended for Vercel)

**Setup:**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project and database
3. Copy connection string
4. Add to Vercel environment variables

**Connection String Format:**

postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require


**Advantages:**
- Serverless-friendly
- Automatic scaling
- Integrated with Vercel
- Free tier available

#### 2. Railway

**Setup:**
bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway new

# Add PostgreSQL service
railway add postgresql

# Get connection string
railway variables


#### 3. Heroku Postgres

**Setup:**
bash
# Create Heroku app (for database only)
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Get connection string
heroku config:get DATABASE_URL


#### 4. AWS RDS

**Setup via AWS Console:**
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Note connection details
4. Format connection string

**Connection String:**

postgresql://username:password@rds-endpoint.region.rds.amazonaws.com:5432/database


### Database Migration

#### Production Database Setup

bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://prod-connection-string"

# Run database migration
npm run seed

# Verify tables created
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM monthly_metrics;"


#### Data Migration Script

Create `scripts/migrate-prod.js`:
javascript
import { connectDb } from '../src/db/connection.js';
import { createTables } from '../src/db/schema.js';
import { generateAllMockData } from '../src/db/mockData.js';

async function migrateProduction() {
  const client = await connectDb();
  
  try {
    // Create tables
    await createTables();
    console.log('Tables created successfully');
    
    // Check if data exists
    const count = await client.query('SELECT COUNT(*) FROM monthly_metrics');
    
    if (parseInt(count.rows[0].count) === 0) {
      // Insert production data
      const mockData = generateAllMockData();
      
      // Insert logic here
      console.log('Production data inserted');
    } else {
      console.log('Data already exists, skipping insertion');
    }
  } finally {
    await client.end();
  }
}

migrateProduction().catch(console.error);


## Alternative Deployment Platforms

### Netlify Deployment

#### Setup

1. **Connect Repository:**
   - Visit [netlify.com](https://netlify.com)
   - Connect GitHub repository
   - Configure build settings

2. **Build Configuration:**
   toml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_ENV = "production"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   

3. **Serverless Functions:**
   bash
   # Create Netlify functions directory
   mkdir netlify/functions
   
   # Move API files and adapt for Netlify format
   # Each API file needs to be adapted for Netlify Functions format
   

**Netlify Function Example:**
javascript
// netlify/functions/active-users.js
import { Client } from 'pg';

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Same logic as Vercel function, adapted for Netlify format
  let client;
  
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    
    // Query logic here
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: result.data
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  } finally {
    if (client) await client.end();
  }
};


### Docker Deployment

#### Dockerfile

dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "preview"]


#### Docker Compose (with PostgreSQL)

yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/kpi_dashboard
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=kpi_dashboard
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:


#### Docker Commands

bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs app


## Environment Configuration

### Production Environment Variables

bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Environment
NODE_ENV=production

# Optional: API Configuration
API_TIMEOUT=30000
DATABASE_POOL_SIZE=20

# Optional: Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=error


### Environment Validation

Create `scripts/validate-env.js`:
javascript
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(envVar => console.error(`- ${envVar}`));
    process.exit(1);
  }
  
  console.log('Environment validation passed');
}

validateEnvironment();


## Performance Optimization

### Build Optimization

javascript
// vite.config.js - Production optimizations
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts']
        }
      }
    },
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000
  }
});


### Database Connection Optimization

javascript
// Production database configuration
import { Pool } from 'pg';

// Use connection pooling in production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };


### Caching Strategy

javascript
// API caching with headers
export default async function handler(req, res) {
  try {
    // Cache for 5 minutes in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
    }
    
    // API logic here
    
  } catch (error) {
    // Error handling
  }
}


## Monitoring and Logging

### Application Monitoring

#### Sentry Integration

bash
npm install @sentry/react @sentry/tracing


javascript
// src/main.jsx
import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing()
    ],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV
  });
}


#### Logging Strategy

javascript
// utils/logger.js
const logger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', message, meta);
    }
    // In production, send to logging service
  },
  
  error: (message, error = null) => {
    console.error('[ERROR]', message, error);
    
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      if (typeof Sentry !== 'undefined') {
        Sentry.captureException(error || new Error(message));
      }
    }
  },
  
  warn: (message, meta = {}) => {
    console.warn('[WARN]', message, meta);
  }
};

export default logger;


### Health Checks

javascript
// api/health.js
import { Client } from 'pg';

export default async function handler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    database: 'unknown'
  };
  
  try {
    // Test database connection
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    
    health.database = 'connected';
    
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
    health.error = error.message;
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}


## Security Considerations

### Environment Security

1. **Never commit secrets to version control**
2. **Use platform environment variable management**
3. **Rotate database credentials regularly**
4. **Enable SSL for database connections**
5. **Use HTTPS for all production deployments**

### Database Security

javascript
// Secure database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for most hosted PostgreSQL
  }
});


### API Security

javascript
// Rate limiting and CORS
export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // API logic here
}


## Deployment Checklist

### Pre-deployment
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Production build successful
- [ ] Performance tested
- [ ] Security review completed

### Post-deployment
- [ ] Health check endpoints respond
- [ ] All API endpoints functional
- [ ] Frontend loads without errors
- [ ] Database connections stable
- [ ] Monitoring alerts configured
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)

### Rollback Plan

bash
# Vercel rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy previous version
git checkout previous-commit
vercel --prod


## Troubleshooting Deployment Issues

### Common Issues

#### "Build failed" errors
1. Check build logs for specific errors
2. Verify all dependencies are in package.json
3. Ensure environment variables are set
4. Test build locally: `npm run build`

#### "Database connection failed"
1. Verify DATABASE_URL format
2. Check database server is accessible
3. Confirm SSL settings
4. Test connection manually

#### "API endpoints return 500 errors"
1. Check serverless function logs
2. Verify environment variables in production
3. Test API logic locally
4. Check database connection in functions

#### "Frontend loads but no data"
1. Verify API endpoints are accessible
2. Check CORS configuration
3. Inspect browser network tab
4. Test API endpoints directly

### Debugging Production Issues

bash
# Vercel function logs
vercel logs --follow

# Test production API endpoints
curl https://your-domain.vercel.app/api/health

# Database connection test
psql $DATABASE_URL -c "SELECT COUNT(*) FROM monthly_metrics;"


---

*This deployment guide covers the most common deployment scenarios and should be updated as new platforms or requirements are added.*