## RevenueByRegionChart

### Overview
Bar chart comparing latest revenue across all four regions (North America, Europe, Asia Pacific, Latin America). Bars are color-coded by performance rank.

### Props
javascript
// No props - component is self-contained
const RevenueByRegionChart = () => { ... }


### State
javascript
const [data, setData] = useState([]);       // Chart data array
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state


### API Integration
- **Endpoint**: `GET /api/revenue-by-region`
- **Response Format**:
  
  {
    "success": true,
    "data": [
      {
        "region": "North America",
        "revenue": 54000.00
      },
      {
        "region": "Europe", 
        "revenue": 36000.00
      },
      // ... other regions (pre-sorted by revenue DESC)
    ],
    "count": 4
  }
  

### Color Coding Strategy
Bars are colored by performance rank (data comes pre-sorted from API). This strategy is now applied to all four regions: North America, Europe, Asia Pacific, and Latin America.

javascript
const getBarColor = (index, total) => {
  const colors = [
    '#60a5fa', // Brightest blue - highest revenue (index 0)
    '#3b82f6', // Medium blue - second highest (index 1) 
    '#2563eb', // Darker blue - third highest (index 2)
    '#1d4ed8'  // Darkest blue - lowest revenue (index 3)
  ];
  return colors[index] || '#1d4ed8';
};


### Chart Configuration
- **Type**: Bar chart with rounded corners
- **X-Axis**: Region names at 45° angle
- **Y-Axis**: Currency formatted
- **Animation**: 1000ms duration
- **Radius**: `[4, 4, 0, 0]` for rounded top corners

### Usage Example
jsx
import RevenueByRegionChart from './components/RevenueByRegionChart';

function Dashboard() {
  return (
    <div className="chart-container">
      <RevenueByRegionChart />
    </div>
  );
}


### Footer Information
Displays summary information below the chart:
- Total number of regions shown (now always 4)
- Top performer callout with revenue amount

jsx
<div className="chart-footer">
  <div>Showing {data.length} regions</div>
  <div className="top-performer">
    Top performer: {topPerformer.region} ({formatCurrency(topPerformer.revenue)})
  </div>
</div>
