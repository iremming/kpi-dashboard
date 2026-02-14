# NorthAmericaRevenueChart Component

## Overview
Multi-region revenue line chart displaying revenue trends for all four regions (North America, Europe, Asia Pacific, Latin America). Originally designed for North America only, this component was expanded to support multi-region data visualization.

## Props
```javascript
// No props - component is self-contained
const NorthAmericaRevenueChart = () => { ... }
```

## State
```javascript
const [data, setData] = useState([]);       // Chart data array
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state
```

## API Integration
- **Endpoint**: `GET /api/north-america-revenue` (now returns all regions)
- **Response Format**:
  ```json
  {
    "success": true,
    "data": [
      {
        "month": "Jan 2025",
        "date": "2025-01-01",
        "North America": 22500.00,
        "Europe": 18000.00,
        "Asia Pacific": 15000.00,
        "Latin America": 12000.00
      }
      // ... 11 more months
    ],
    "count": 12
  }
  ```

## Multi-Region Configuration

### Region Color Mapping
- **North America**: `#60a5fa` (Light blue)
- **Europe**: `#3b82f6` (Medium blue)
- **Asia Pacific**: `#2563eb` (Dark blue)  
- **Latin America**: `#1d4ed8` (Darkest blue)

### Chart Structure
```jsx
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
  <YAxis tickFormatter={formatCurrency} />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  
  {/* Line for each region */}
  <Line 
    dataKey="North America" 
    stroke="#60a5fa" 
    strokeWidth={2}
    dot={{ fill: '#60a5fa', r: 3 }}
    activeDot={{ r: 5 }}
  />
  <Line 
    dataKey="Europe" 
    stroke="#3b82f6" 
    strokeWidth={2}
    dot={{ fill: '#3b82f6', r: 3 }}
    activeDot={{ r: 5 }}
  />
  <Line 
    dataKey="Asia Pacific" 
    stroke="#2563eb" 
    strokeWidth={2}
    dot={{ fill: '#2563eb', r: 3 }}
    activeDot={{ r: 5 }}
  />
  <Line 
    dataKey="Latin America" 
    stroke="#1d4ed8" 
    strokeWidth={2}
    dot={{ fill: '#1d4ed8', r: 3 }}
    activeDot={{ r: 5 }}
  />
</LineChart>
```

## Data Processing
The component transforms API response data from region-per-row format to month-per-row format suitable for multi-line charts:

```javascript
// Transform data for chart consumption
const chartData = monthlyData.reduce((acc, curr) => {
  const existing = acc.find(item => item.month === curr.month);
  if (existing) {
    existing[curr.region] = parseFloat(curr.revenue);
  } else {
    acc.push({
      month: curr.month,
      date: curr.date,
      [curr.region]: parseFloat(curr.revenue)
    });
  }
  return acc;
}, []);
```

## Updated Styling & Layout
- **Title**: Changed from "North America Revenue Trend" to "Revenue Trend by Region"
- **Legend**: Added interactive legend showing all four regions
- **Footer**: Updated to show "Showing 4 regions • 12 months of data"
- **Height**: Maintained at 350px for optimal multi-line visibility

## Usage Example
```jsx
import NorthAmericaRevenueChart from './components/NorthAmericaRevenueChart';

function Dashboard() {
  return (
    <div className="chart-container">
      <NorthAmericaRevenueChart />
    </div>
  );
}
```

## Migration Notes
- **Backward Compatible**: Component maintains same interface and styling
- **API Change**: Backend endpoint now returns all regions instead of filtering for North America
- **Data Format**: Changed from simple array to grouped multi-region format
- **Performance**: Chart handles 4 lines with 12 data points each efficiently

## Testing
Test the multi-region functionality:
```bash
node test-revenue-by-region.js
```

Verify all four regions display with distinct colors and interactive legend functionality.