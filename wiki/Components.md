# Component Documentation

This guide covers all React components in the KPI Dashboard, including their props, state management, usage patterns, and integration examples.

## Component Overview

The dashboard consists of four main components that follow a consistent architecture pattern:

- **ActiveUsersCard** - Displays active user count with growth indicators
- **ChurnRateCard** - Shows churn rate metrics with trend analysis  
- **RevenueByRegionTrendChart** - Multi-region line chart showing revenue trends for all regions
- **RevenueByRegionChart** - Bar chart comparing revenue across all regions

## Common Component Pattern

All dashboard components follow the same architectural pattern:

javascript
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) return <LoadingComponent />;
  
  // Error state  
  if (error) return <ErrorComponent />;
  
  // Success state
  return <DataVisualization />;
};


### Shared Features

- **State Management**: Uses React hooks for data, loading, and error states
- **API Integration**: Fetches data from corresponding `/api` endpoints
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Loading States**: Visual loading indicators during data fetch
- **Responsive Design**: Mobile-first approach with dark theme
- **Accessibility**: Semantic HTML structure and ARIA attributes

---

## ActiveUsersCard

### Overview
Displays the current month's active user count with month-over-month growth percentage. Uses color-coded indicators to show positive/negative growth trends.

### Props
javascript
// No props - component is self-contained
const ActiveUsersCard = () => { ... }


### State
javascript
const [data, setData] = useState(null);     // API response data
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state


### API Integration
- **Endpoint**: `GET /api/active-users`
- **Response Format**:
  
  {
    "success": true,
    "data": {
      "active_users": 3250,
      "growth_percentage": 7.2,
      "current_date": "2025-01-01",
      "previous_date": "2024-12-01"
    }
  }
  

### Styling & Layout
- **Container**: Dark theme card (`#1f2937` background)
- **Border**: Subtle border (`#374151`)
- **Typography**: Monospace font for numbers, uppercase labels
- **Colors**: Green for positive growth, red for negative
- **Icons**: Arrow indicators (↗ for up, ↘ for down)

### Usage Example
jsx
import ActiveUsersCard from './components/ActiveUsersCard';

function Dashboard() {
  return (
    <div className="metrics-row">
      <ActiveUsersCard />
      {/* Other metric cards */}
    </div>
  );
}


### Helper Functions
- `formatNumber(value)`: Formats numbers with commas (e.g., "3,250")
- `formatPercentage(value)`: Formats percentage with +/- sign (e.g., "+7.2%")

### Visual States
1. **Loading**: Shows card skeleton with "Loading..." text
2. **Error**: Red border with error message
3. **Success**: Full card with data and growth indicator
4. **No Data**: Gray card with "No data available" message

---

## ChurnRateCard

### Overview
Displays current churn rate percentage with month-over-month change. Uses inverse color logic where decreasing churn (negative growth) is positive (green).

### Props
javascript
// No props - component is self-contained  
const ChurnRateCard = () => { ... }


### State
javascript
const [data, setData] = useState(null);     // API response data
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state


### API Integration
- **Endpoint**: `GET /api/churn-rate`
- **Response Format**:
  
  {
    "success": true,
    "data": {
      "churn_rate": 2.3,
      "growth_percentage": -12.5,
      "current_date": "2025-01-01",
      "previous_date": "2024-12-01"
    }
  }
  

### Color Logic (Inverse)
Churn rate uses inverse color logic since lower churn is better:
- **Green + Down Arrow**: Decreasing churn (good)
- **Red + Up Arrow**: Increasing churn (bad)

javascript
const isChurnDecreasing = data.growth_percentage <= 0;
const growthColor = isChurnDecreasing ? '#10b981' : '#ef4444';
const growthIcon = isChurnDecreasing ? '↘' : '↗';


### Usage Example
jsx
import ChurnRateCard from './components/ChurnRateCard';

function Dashboard() {
  return (
    <div className="metrics-row">
      <ActiveUsersCard />
      <ChurnRateCard />
    </div>
  );
}


### Helper Functions
- `formatPercentage(value)`: Main churn rate (e.g., "2.3%")
- `formatPercentageChange(value)`: Change with +/- sign (e.g., "-12.5%")

---

## RevenueByRegionTrendChart

### Overview
Multi-region line chart displaying 12 months of revenue trends for all four regions. Features color-coded lines for each region with interactive tooltips and legend. Built with Recharts library and optimized for dark theme.

### Props
javascript
// No props - component is self-contained
const RevenueByRegionTrendChart = () => { ... }


### State
javascript
const [data, setData] = useState([]);       // Chart data array
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state


### API Integration
- **Endpoint**: `GET /api/north-america-revenue` (returns all regions data)
- **Response Format**:
  
  {
    "success": true,
    "data": [
      {
        "month": "Jan 2025",
        "date": "2025-01-01",
        "region": "North America",
        "revenue": 22500.00
      },
      {
        "month": "Jan 2025",
        "date": "2025-01-01",
        "region": "Europe",
        "revenue": 15300.00
      }
      // ... more regions and months
    ],
    "count": 48
  }
  

### Data Transformation
The component transforms the API response to group revenue by month:

javascript
const transformMultiRegionData = (apiData) => {
  const monthlyData = {};
  
  apiData.forEach(item => {
    const month = item.month;
    if (!monthlyData[month]) {
      monthlyData[month] = { month: month, date: item.date };
    }
    monthlyData[month][item.region] = item.revenue;
  });
  
  return Object.values(monthlyData).sort((a, b) => new Date(a.date) - new Date(b.date));
};


### Chart Configuration
- **Type**: Multi-line chart with monotone curves
- **Colors**: Region-specific color scheme
  - North America: `#60a5fa` (blue)
  - Europe: `#34d399` (green)
  - Asia Pacific: `#fbbf24` (yellow)
  - Latin America: `#f87171` (red)
- **Grid**: Dashed lines with opacity
- **Animation**: 1000ms duration
- **Responsive**: Uses `ResponsiveContainer`
- **Legend**: Shows all regions with color indicators

### Recharts Components Used
jsx
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} angle={-45} />
  <YAxis tickFormatter={formatCurrency} />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  {availableRegions.map((region) => (
    <Line 
      key={region}
      type="monotone" 
      dataKey={region}
      stroke={regionColors[region]} 
      strokeWidth={3}
      dot={{ fill: regionColors[region], r: 4 }}
      activeDot={{ r: 6 }}
    />
  ))}
</LineChart>


### Custom Tooltip Component
jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ /* Dark theme tooltip styles */ }}>
        <p>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


### Usage Example
jsx
import RevenueByRegionTrendChart from './components/NorthAmericaRevenueChart';

function Dashboard() {
  return (
    <div className="chart-container">
      <RevenueByRegionTrendChart />
    </div>
  );
}


### Helper Functions
- `formatCurrency(value)`: Formats numbers as USD currency without decimals
- `transformMultiRegionData(data)`: Groups API response by month for chart display

---

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
      }
      // ... other regions (pre-sorted by revenue DESC)
    ],
    "count": 4
  }
  

### Color Coding Strategy
Bars are colored by performance rank (data comes pre-sorted from API):

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
- Total number of regions
- Top performer callout with revenue amount

jsx
<div className="chart-footer">
  <div>Showing {data.length} regions</div>
  <div className="top-performer">
    Top performer: {topPerformer.region} ({formatCurrency(topPerformer.revenue)})
  </div>
</div>


---

## Responsive Design

### Breakpoints
All components use CSS Grid and Flexbox for responsive layouts:

- **Mobile** (`< 640px`): Stacked layout, smaller fonts
- **Tablet** (`640px - 1023px`): 2-column grid for cards
- **Desktop** (`1024px+`): Multi-column layouts
- **Large** (`1280px+`): Optimized spacing and sizing

### Mobile Optimizations
- Smaller chart heights (350px vs 400px)
- Adjusted font sizes for readability  
- Touch-friendly hover states
- Simplified chart interactions
- Angled X-axis labels for better mobile display

### Chart Responsiveness
jsx
// All charts use ResponsiveContainer
<div style={{ height: '350px' }}>
  <ResponsiveContainer width="100%" height="100%">
    <Chart data={data}>
      {/* Chart components */}
    </Chart>
  </ResponsiveContainer>
</div>


## Error Handling Patterns

### Network Error Handling
All components handle common error scenarios:

javascript
try {
  const response = await fetch('/api/endpoint');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch data');
  }
  
  setData(result.data);
} catch (err) {
  console.error('Error fetching data:', err);
  setError(err.message);
} finally {
  setLoading(false);
}


### Error UI States
- **Network errors**: Red border with generic message
- **No data**: Gray styling with informative message
- **Loading errors**: Fallback to previous data if available

## Performance Considerations

### Data Fetching Optimization
- Single API call per component on mount
- No polling or real-time updates (reduces server load)
- Error states prevent infinite retry loops
- Loading states prevent multiple concurrent requests

### Rendering Optimization
- Charts only render when data is available
- Responsive containers handle resize events efficiently
- Minimal re-renders through proper state management
- Data transformation memoized to prevent recalculation

### Memory Management
- No cleanup needed (components fetch data once)
- No event listeners or subscriptions to clean up
- Chart libraries handle their own optimization

## Testing Strategies

### Manual Testing
Each component can be tested independently:

bash
# Test API endpoints
npm run test-api          # ActiveUsersCard
npm run test-churn        # ChurnRateCard
node test-revenue-by-region.js  # RevenueByRegionChart
node test-north-america-revenue.js # RevenueByRegionTrendChart


### Integration Testing
1. Verify component renders without errors
2. Check loading states appear correctly
3. Confirm error handling with invalid API responses
4. Test responsive behavior across screen sizes
5. Validate accessibility with screen readers
6. Test multi-region chart shows all regions correctly
7. Verify legend and tooltips work properly

### Visual Testing Checklist
- [ ] Dark theme colors consistent
- [ ] Typography readable at all sizes
- [ ] Charts display correctly with real data
- [ ] Loading states are visually clear
- [ ] Error states are user-friendly
- [ ] Mobile layout works properly
- [ ] Hover interactions function smoothly
- [ ] Multi-region chart shows distinct colored lines
- [ ] Legend displays all regions with correct colors
- [ ] Tooltips show multiple regions on hover

## Future Enhancement Ideas

### Potential Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Data Export**: Download chart data as CSV/PDF
3. **Custom Date Ranges**: User-selectable time periods
4. **Drill-down Analytics**: Click charts for detailed views
5. **Comparison Tools**: Side-by-side period comparisons
6. **Performance Monitoring**: Track component load times
7. **Accessibility Enhancements**: Better screen reader support
8. **Animation Controls**: User preference for reduced motion
9. **Region Filtering**: Toggle regions on/off in multi-region chart
10. **Data Annotations**: Highlight significant events or changes

---

*This component documentation is maintained alongside the codebase to ensure accuracy and completeness.*