# Component Documentation

This guide covers all React components in the KPI Dashboard, including their props, state management, usage patterns, and integration examples.

## Component Overview

The dashboard consists of four main components that follow a consistent architecture pattern:

- **ActiveUsersCard** - Displays active user count with growth indicators
- **ChurnRateCard** - Shows churn rate metrics with trend analysis  
- **NorthAmericaRevenueChart** - Multi-region revenue trend line chart (all four regions)
- **RevenueByRegionChart** - Bar chart comparing latest revenue across all regions

## Common Component Pattern

All dashboard components follow the same architectural pattern:

```javascript
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
```

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
```javascript
// No props - component is self-contained
const ActiveUsersCard = () => { ... }
```

### State
```javascript
const [data, setData] = useState(null);     // API response data
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state
```

### API Integration
- **Endpoint**: `GET /api/active-users`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "active_users": 3250,
      "growth_percentage": 7.2,
      "current_date": "2025-01-01",
      "previous_date": "2024-12-01"
    }
  }
  ```

### Styling & Layout
- **Container**: Dark theme card (`#1f2937` background)
- **Border**: Subtle border (`#374151`)
- **Typography**: Monospace font for numbers, uppercase labels
- **Colors**: Green for positive growth, red for negative
- **Icons**: Arrow indicators (↗ for up, ↘ for down)

### Usage Example
```jsx
import ActiveUsersCard from './components/ActiveUsersCard';

function Dashboard() {
  return (
    <div className="metrics-row">
      <ActiveUsersCard />
      {/* Other metric cards */}
    </div>
  );
}
```

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
```javascript
// No props - component is self-contained  
const ChurnRateCard = () => { ... }
```

### State
```javascript
const [data, setData] = useState(null);     // API response data
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state
```

### API Integration
- **Endpoint**: `GET /api/churn-rate`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "churn_rate": 2.3,
      "growth_percentage": -12.5,
      "current_date": "2025-01-01",
      "previous_date": "2024-12-01"
    }
  }
  ```

### Color Logic (Inverse)
Churn rate uses inverse color logic since lower churn is better:
- **Green + Down Arrow**: Decreasing churn (good)
- **Red + Up Arrow**: Increasing churn (bad)

```javascript
const isChurnDecreasing = data.growth_percentage <= 0;
const growthColor = isChurnDecreasing ? '#10b981' : '#ef4444';
const growthIcon = isChurnDecreasing ? '↘' : '↗';
```

### Usage Example
```jsx
import ChurnRateCard from './components/ChurnRateCard';

function Dashboard() {
  return (
    <div className="metrics-row">
      <ActiveUsersCard />
      <ChurnRateCard />
    </div>
  );
}
```

### Helper Functions
- `formatPercentage(value)`: Main churn rate (e.g., "2.3%")
- `formatPercentageChange(value)`: Change with +/- sign (e.g., "-12.5%")

---

## NorthAmericaRevenueChart (Multi-Region Revenue Trends)

### Overview
Enhanced line chart displaying 12 months of revenue trends for all four regions (North America, Europe, Asia Pacific, Latin America). Features multiple lines with distinct colors, interactive legend, and comprehensive accessibility support.

**Note**: Despite the component name, this chart now displays data for all regions, not just North America.

### Props
```javascript
// No props - component is self-contained
const NorthAmericaRevenueChart = () => { ... }
```

### State
```javascript
const [data, setData] = useState([]);       // Chart data array
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state
const [highlightedRegion, setHighlightedRegion] = useState(null); // Interactive legend state
```

### API Integration
- **Endpoint**: `GET /api/all-regions-revenue`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": [
      {
        "month": "Jan 2025",
        "date": "2025-01-01",
        "NorthAmerica": 22500.00,
        "Europe": 18000.00,
        "AsiaPacific": 12000.00,
        "LatinAmerica": 5500.00
      },
      // ... 11 more months
    ],
    "count": 12,
    "regions": ["North America", "Europe", "Asia Pacific", "Latin America"]
  }
  ```

### Enhanced Features

#### Multi-Region Line Display
- **Four distinct lines** with high-contrast colors optimized for accessibility
- **Interactive highlighting** - hover over legend to highlight specific regions
- **Performance ranking** displayed in legend with latest revenue values

#### Color Palette (WCAG AA Compliant)
```javascript
const regionColors = {
  NorthAmerica: '#3b82f6',     // Blue - High contrast
  Europe: '#10b981',          // Emerald Green
  AsiaPacific: '#f59e0b',     // Amber
  LatinAmerica: '#ef4444'     // Red
};
```

#### Advanced Tooltip
- **Comprehensive data display** for all regions on hover
- **Performance ranking** with highest to lowest revenue
- **Total revenue calculation** for the selected month
- **Enhanced visual styling** with color-coded indicators

#### Interactive Legend
- **Click/keyboard navigation** to highlight individual regions
- **Performance metrics** showing rank and latest revenue
- **Accessibility support** with ARIA labels and keyboard navigation
- **Visual feedback** with hover and focus states

### Recharts Components Used
```jsx
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
  <YAxis tickFormatter={formatCurrency} />
  <Tooltip content={<CustomTooltip />} />
  <Legend content={<CustomLegend />} />
  
  {/* Four Lines for Each Region */}
  <Line dataKey="NorthAmerica" name="North America" stroke="#3b82f6" />
  <Line dataKey="Europe" name="Europe" stroke="#10b981" />
  <Line dataKey="AsiaPacific" name="Asia Pacific" stroke="#f59e0b" />
  <Line dataKey="LatinAmerica" name="Latin America" stroke="#ef4444" />
</LineChart>
```

### Custom Components

#### Enhanced Tooltip
```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalRevenue = payload.reduce((sum, entry) => sum + entry.value, 0);
    const sortedPayload = payload.sort((a, b) => b.value - a.value);
    
    return (
      <div className="multi-region-tooltip">
        <div className="tooltip-header">{label}</div>
        {sortedPayload.map((entry, index) => (
          <div key={index} className="tooltip-row">
            <span className="region-name">{entry.name}</span>
            <span className="region-value">{formatCurrency(entry.value)}</span>
          </div>
        ))}
        <div className="tooltip-footer">
          <span>Total Revenue: {formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    );
  }
  return null;
};
```

#### Interactive Legend
```jsx
const CustomLegend = ({ payload, onMouseEnter, onMouseLeave, highlightedRegion }) => {
  return (
    <div className="interactive-legend">
      {payload.map((entry, index) => (
        <div
          key={index}
          className={`legend-item ${highlightedRegion === entry.dataKey ? 'highlighted' : ''}`}
          onMouseEnter={() => onMouseEnter(entry.dataKey)}
          onMouseLeave={onMouseLeave}
          tabIndex={0}
          role="button"
        >
          <div className="legend-color" style={{ backgroundColor: entry.color }} />
          <div className="legend-text">
            <span className="region-name">{entry.value}</span>
            <span className="region-performance">#{rank} • {formatCurrency(latestRevenue)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Usage Example
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

### Accessibility Features
- **Keyboard Navigation**: Tab through legend items, Enter/Space to toggle highlights
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **High Contrast Colors**: WCAG AA compliant color palette
- **Semantic HTML**: Proper heading structure and role attributes
- **Alternative Text**: Descriptive chart summaries for screen readers

### Performance Optimizations
- **Region-specific highlighting** reduces visual clutter
- **Memoized legend components** prevent unnecessary re-renders
- **Optimized tooltip rendering** only shows when active
- **Responsive container** efficiently handles window resizing

---

## RevenueByRegionChart

### Overview
Bar chart comparing latest revenue across all four regions (North America, Europe, Asia Pacific, Latin America). Bars are color-coded by performance rank.

### Props
```javascript
// No props - component is self-contained
const RevenueByRegionChart = () => { ... }
```

### State
```javascript
const [data, setData] = useState([]);       // Chart data array
const [loading, setLoading] = useState(true); // Loading indicator
const [error, setError] = useState(null);    // Error state
```

### API Integration
- **Endpoint**: `GET /api/revenue-by-region`
- **Response Format**:
  ```json
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
  ```

### Color Coding Strategy
Bars are colored by performance rank (data comes pre-sorted from API):

```javascript
const getBarColor = (index, total) => {
  const colors = [
    '#60a5fa', // Brightest blue - highest revenue (index 0)
    '#3b82f6', // Medium blue - second highest (index 1) 
    '#2563eb', // Darker blue - third highest (index 2)
    '#1d4ed8'  // Darkest blue - lowest revenue (index 3)
  ];
  return colors[index] || '#1d4ed8';
};
```

### Chart Configuration
- **Type**: Bar chart with rounded corners
- **X-Axis**: Region names at 45° angle
- **Y-Axis**: Currency formatted
- **Animation**: 1000ms duration
- **Radius**: `[4, 4, 0, 0]` for rounded top corners

### Usage Example
```jsx
import RevenueByRegionChart from './components/RevenueByRegionChart';

function Dashboard() {
  return (
    <div className="chart-container">
      <RevenueByRegionChart />
    </div>
  );
}
```

### Footer Information
Displays summary information below the chart:
- Total number of regions
- Top performer callout with revenue amount

```jsx
<div className="chart-footer">
  <div>Showing {data.length} regions</div>
  <div className="top-performer">
    Top performer: {topPerformer.region} ({formatCurrency(topPerformer.revenue)})
  </div>
</div>
```

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

### Chart Responsiveness
```jsx
// All charts use ResponsiveContainer
<div style={{ height: '350px' }}>
  <ResponsiveContainer width="100%" height="100%">
    <Chart data={data}>
      {/* Chart components */}
    </Chart>
  </ResponsiveContainer>
</div>
```

## Error Handling Patterns

### Network Error Handling
All components handle common error scenarios:

```javascript
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
```

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
- **Multi-region chart**: Memoized legend components and optimized highlighting

### Memory Management
- No cleanup needed (components fetch data once)
- No event listeners or subscriptions to clean up
- Chart libraries handle their own optimization

## Testing Strategies

### Manual Testing
Each component can be tested independently:

```bash
# Test API endpoints
npm run test-api          # ActiveUsersCard
npm run test-churn        # ChurnRateCard
node test-revenue-by-region.js  # RevenueByRegionChart
# NorthAmericaRevenueChart uses /api/all-regions-revenue endpoint
```

### Integration Testing
1. Verify component renders without errors
2. Check loading states appear correctly
3. Confirm error handling with invalid API responses
4. Test responsive behavior across screen sizes
5. Validate accessibility with screen readers
6. **Multi-region chart**: Test legend interactions and region highlighting

### Visual Testing Checklist
- [ ] Dark theme colors consistent
- [ ] Typography readable at all sizes
- [ ] Charts display correctly with real data
- [ ] Loading states are visually clear
- [ ] Error states are user-friendly
- [ ] Mobile layout works properly
- [ ] Hover interactions function smoothly
- [ ] **Multi-region chart**: All four lines visible with distinct colors
- [ ] **Multi-region chart**: Legend interactions work correctly
- [ ] **Multi-region chart**: Accessibility features function properly

## Future Enhancement Ideas

### Potential Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Data Export**: Download chart data as CSV/PDF
3. **Custom Date Ranges**: User-selectable time periods for trend charts
4. **Drill-down Analytics**: Click charts for detailed regional views
5. **Comparison Tools**: Side-by-side period comparisons
6. **Performance Monitoring**: Track component load times
7. **Accessibility Enhancements**: Better screen reader support
8. **Animation Controls**: User preference for reduced motion
9. **Region Filtering**: Toggle specific regions on/off in multi-region chart
10. **Data Annotations**: Mark significant events or milestones on trend lines

---

*This component documentation is maintained alongside the codebase to ensure accuracy and completeness.*