# Components

## ActiveUsersCard
Displays total active users and month-over-month growth.

## ChurnRateCard
Shows churn rate and its month-over-month change, using inverse color logic.

## RevenueTrendChart
Displays revenue trends for all four regions (North America, Europe, Asia Pacific, Latin America) over the past 12 months.

### Props
This component does not require any props. It fetches data from the `/api/north-america-revenue.js` endpoint automatically.

### Features
- Multi-line chart showing revenue trends across all regions
- Color coding for each region:
  - North America: #60a5fa
  - Europe: #3b82f6
  - Asia Pacific: #10b981
  - Latin America: #f59e0b
- Interactive tooltips showing region-specific data
- Responsive design for mobile and desktop
- Loading and error states handling

### API Dependencies
- `/api/north-america-revenue.js`: Returns revenue data for all regions with month, date, region, and revenue fields

## RevenueByRegionChart
Displays revenue comparison across all four regions with performance-based color coding.

### Props
This component does not require any props. It fetches data from the `/api/revenue-by-region.js` endpoint automatically.

### Features
- Bar chart comparing latest revenue across regions
- Performance-based color gradient (brightest for highest revenue)
- Interactive tooltips
- Top performer identification
- Responsive design