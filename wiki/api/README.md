# API Endpoints

## Revenue Data API

### `GET /api/north-america-revenue`
Returns revenue trend data for North America region only.

**Response Format:**
```json
[
  {
    "date": "2024-01-01",
    "revenue": 12345.67
  }
  // ... more data points
]
```

### `GET /api/all-regions-revenue`
Returns revenue trend data for all four regions (North America, Europe, Asia Pacific, Latin America).

**Response Format:**
```json
[
  {
    "date": "2024-01-01",
    "revenue": 12345.67,
    "region": "north-america"
  },
  {
    "date": "2024-01-01", 
    "revenue": 9876.54,
    "region": "europe"
  },
  {
    "date": "2024-01-01",
    "revenue": 5678.90,
    "region": "asia-pacific"
  },
  {
    "date": "2024-01-01",
    "revenue": 2345.67,
    "region": "latin-america"
  }
  // ... more data points across regions
]
```

**Region Codes:**
- `north-america`
- `europe`
- `asia-pacific` 
- `latin-america`

## Active Users API

### `GET /api/active-users`
Returns the current active users count and month-over-month growth data.

**Response Format:**
```json
{
  "current": 12345,
  "previous": 12000,
  "growth": 0.0288
}
```

## Churn Rate API

### `GET /api/churn-rate`
Returns the current churn rate and month-over-month change.

**Response Format:**
```json
{
  "current": 0.12,
  "previous": 0.15,
  "change": -0.03
}
```