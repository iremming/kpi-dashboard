# All Regions Revenue API

## Overview
The `/api/all-regions-revenue` endpoint provides revenue data for all four regions over the past 12 months.

## Endpoint
```
GET /api/all-regions-revenue
```

## Response Format
```json
[
  {
    "month": "2024-01",
    "north_america": 150000,
    "europe": 120000,
    "asia_pacific": 90000,
    "latin_america": 60000
  },
  // ... 11 more months
]
```

## Parameters
None - returns data for the past 12 complete months

## Data Source
- **Table**: `revenue_by_region`
- **Regions**: North America, Europe, Asia Pacific, Latin America
- **Timeframe**: Past 12 months (rolling window)

## Implementation Details
- Built as a Vercel Serverless Function
- Uses PostgreSQL connection pool
- Returns data in chronological order (oldest to newest)
- Handles missing months gracefully (returns 0 revenue)

## Usage Example
```javascript
// Fetch revenue data for all regions
const response = await fetch('/api/all-regions-revenue');
const revenueData = await response.json();
```

## Error Handling
- Returns 500 status code on database errors
- Returns empty array if no data available
- Includes proper CORS headers for cross-origin requests