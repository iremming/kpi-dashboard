# Components

## RegionalRevenueTrendChart
Displays revenue trends across all four regions (North America, Europe, Asia Pacific, Latin America) in a multi-line chart format. Replaces the previous NorthAmericaRevenueChart component.

**Key Features:**
- Fetches data from `/api/all-regions-revenue` endpoint
- Displays four distinct revenue trend lines with unique colors
- Shows interactive tooltips with region-specific revenue data
- Chart title: "Revenue Trend by Region"

**Props:** None (fetches data internally)

## ActiveUsersCard
Displays total active users and month-over-month growth.

## ChurnRateCard
Shows churn rate and its month-over-month change, using inverse color logic.

---

**DEPRECATED COMPONENTS:**
- `NorthAmericaRevenueChart` - Replaced by RegionalRevenueTrendChart