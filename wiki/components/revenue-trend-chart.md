# Revenue Trend Chart Component

## Overview
The `RevenueByRegionTrendChart` component displays a multi-line chart showing monthly revenue trends across all four regions (North America, Europe, Asia Pacific, and Latin America). This component replaced the previous `NorthAmericaRevenueChart` to provide comprehensive regional revenue analysis.

## Props
```javascript
// No props - component is self-contained
const RevenueByRegionTrendChart = () => { ... }
```

## State
```javascript
const [data, setData] = useState([]);       // Chart data array with all regions
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
      "north_america": 22500.00,
      "europe": 18200.00,
      "asia_pacific": 15300.00,
      "latin_america": 8900.00
    }
    // ... 11 more months
  ],
  "count": 12
}
```

## Chart Configuration
- **Type**: Multi-line chart with four data series
- **Colors**: 
  - North America: `#60a5fa` (primary blue)
  - Europe: `#34d399` (green)
  - Asia Pacific: `#fbbf24` (yellow)
  - Latin America: `#f87171` (red)
- **Features**: 
  - Interactive legend for toggling regions
  - Custom tooltips showing all region values
  - Responsive design with mobile optimization
  - Smooth curve interpolation

## Usage Example
```jsx
import RevenueByRegionTrendChart from './components/RevenueByRegionTrendChart';

function Dashboard() {
  return (
    <div className="chart-container">
      <h2>Revenue Trends by Region</h2>
      <RevenueByRegionTrendChart />
    </div>
  );
}
```

## Data Transformation
The component transforms the flat monthly data into the format required by Recharts:
```javascript
const transformedData = data.map(item => ({
  month: item.month,
  northAmerica: parseFloat(item.north_america),
  europe: parseFloat(item.europe),
  asiaPacific: parseFloat(item.asia_pacific),
  latinAmerica: parseFloat(item.latin_america)
}));
```

## Performance Considerations
- Uses `useMemo` for data transformation to prevent unnecessary recalculations
- Implements proper loading states to avoid layout shift
- Responsive container handles resize events efficiently

## Migration Notes
This component replaces `NorthAmericaRevenueChart`. The main differences:
- Shows all four regions instead of just North America
- Updated API endpoint to return multi-region data
- Enhanced legend and tooltip functionality
- Improved color scheme for better region differentiation