# RevenueByRegionChart Component

## Overview
A multi-line chart component that displays revenue trends for all four regions (North America, Europe, Asia Pacific, Latin America) over time.

## Features
- Displays revenue trends as separate colored lines for each region
- Monthly time-series data visualization
- Interactive tooltips showing exact revenue values
- Comprehensive legend identifying regional lines
- Responsive design that adapts to container size

## Data Source
Fetches time-series revenue data from `/api/all-regions-revenue-trend.js` endpoint.

## Props
None - component manages its own data fetching and state.

## Implementation Details
- Built using Recharts library
- Uses LineChart with XAxis (month), YAxis (currency format)
- Four Line components with distinct colors
- ResponsiveContainer wrapper for flexible sizing
- Error handling for API failures