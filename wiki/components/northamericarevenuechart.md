# NorthAmericaRevenueChart Component

## Overview
The NorthAmericaRevenueChart component has been enhanced to display revenue trends for all regions, making it a comprehensive regional revenue visualization tool.

## Changes

### Multi-Region Support
- **New API Integration**: Now fetches data from `/api/all-regions-revenue` endpoint
- **Multiple Lines**: Displays separate trend lines for all four regions:
  - North America
  - Europe  
  - Asia Pacific
  - Latin America

### Visual Enhancements
- **Color Palette**: Each region has a distinct color for easy identification
- **Legend**: Added interactive legend to toggle region visibility
- **Responsive Design**: Maintains chart readability across different screen sizes

### API Changes
- **New Endpoint**: `/api/all-regions-revenue` returns revenue data for all regions
- **Backward Compatibility**: Existing functionality preserved

## Usage
```jsx
<NorthAmericaRevenueChart />
```

The component automatically fetches and displays revenue data for the past 12 months across all regions.

## Props
- No props required - automatically handles data fetching and rendering

## Data Structure
Expects data in format:
```json
[
  {
    "month": "2024-01",
    "north_america": 150000,
    "europe": 120000,
    "asia_pacific": 90000,
    "latin_america": 60000
  }
]
```