# API Endpoints

## GET /api/north-america-revenue
Returns revenue data for all regions (North America, Europe, Asia Pacific, Latin America).

### Response Format
```json
[
  {
    "month": "2024-01",
    "revenue": 125000,
    "region": "North America"
  },
  {
    "month": "2024-01", 
    "revenue": 85000,
    "region": "Europe"
  },
  // ... additional data points for all regions
]
```

### Notes
- Previously filtered to North America only, now returns data for all four regions
- Each data point includes region identifier
- Data is sorted chronologically by month