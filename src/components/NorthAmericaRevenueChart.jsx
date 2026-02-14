import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Format currency values for display
 * @param {number} value - Revenue value
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Multi-Region Revenue Chart Component
 * Displays revenue trends for all regions over the past 12 months
 */
const NorthAmericaRevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/north-america-revenue');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch revenue data');
        }
        
        // Transform data to group by month with all regions
        const transformedData = transformMultiRegionData(result.data || []);
        setData(transformedData);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  /**
   * Transform multi-region API data into chart format
   * Groups revenue data by month with separate line for each region
   */
  const transformMultiRegionData = (apiData) => {
    if (!apiData || apiData.length === 0) return [];

    // Group data by month
    const monthlyData = {};
    
    apiData.forEach(item => {
      const month = item.month;
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month: month,
          date: item.date
        };
      }
      
      // Add revenue for this region to the month
      monthlyData[month][item.region] = item.revenue;
    });

    // Convert to array and sort by date
    const chartData = Object.values(monthlyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return chartData;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #374151'
      }}>
        <h3 style={{
          color: '#f9fafb',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Revenue Trends by Region
        </h3>
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af'
        }}>
          Loading revenue data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #ef4444'
      }}>
        <h3 style={{
          color: '#f9fafb',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Revenue Trends by Region
        </h3>
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div>Error loading revenue data</div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #374151'
      }}>
        <h3 style={{
          color: '#f9fafb',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Revenue Trends by Region
        </h3>
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af'
        }}>
          No revenue data available
        </div>
      </div>
    );
  }

  // Define colors for each region
  const regionColors = {
    'North America': '#60a5fa',
    'Europe': '#34d399',
    'Asia Pacific': '#fbbf24',
    'Latin America': '#f87171'
  };

  // Get all regions that have data
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const availableRegions = regions.filter(region => 
    data.some(item => item[region] !== undefined)
  );

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #374151'
    }}>
      <h3 style={{
        color: '#f9fafb',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        Revenue Trends by Region
      </h3>
      
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              strokeOpacity={0.5}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}>
                      <p style={{ color: '#f9fafb', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
                        {label}
                      </p>
                      {payload.map((entry, index) => (
                        <p key={index} style={{ 
                          color: entry.color, 
                          margin: '4px 0', 
                          fontSize: '14px', 
                          fontWeight: '600' 
                        }}>
                          {entry.dataKey}: {formatCurrency(entry.value)}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Render a line for each region */}
            {availableRegions.map((region) => (
              <Line 
                key={region}
                type="monotone" 
                dataKey={region}
                stroke={regionColors[region]} 
                strokeWidth={3}
                dot={{ fill: regionColors[region], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: regionColors[region], stroke: '#1f2937', strokeWidth: 2 }}
                animationDuration={1000}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center'
      }}>
        {availableRegions.map((region) => (
          <div key={region} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <div style={{
              width: '12px',
              height: '3px',
              backgroundColor: regionColors[region],
              borderRadius: '2px'
            }}></div>
            <span>{region}</span>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '12px',
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Showing {data.length} months of revenue data for {availableRegions.length} regions
      </div>
    </div>
  );
};

export default NorthAmericaRevenueChart;