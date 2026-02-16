# Components

## ActiveUsersCard
Displays total active users and month-over-month growth.

## ChurnRateCard
Shows churn rate and its month-over-month change, using inverse color logic.

## RevenueTrendChart
Displays revenue trends across all four regions (North America, Europe, Asia Pacific, Latin America) as multiple line series.

### Props
- `data`: Array of revenue data objects with `month`, `revenue`, and `region` properties
- `height`: Optional height for the chart container
- `width`: Optional width for the chart container

### Features
- Color-coded lines for each region (North America: #60a5fa, Europe: #3b82f6, Asia Pacific: #10b981, Latin America: #f59e0b)
- Responsive design with tooltips showing region-specific revenue data
- X-axis showing months, Y-axis showing revenue amounts
- Legend showing all four regions with their respective colors