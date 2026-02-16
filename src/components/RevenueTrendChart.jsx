import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
 * Custom tooltip component for the line chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#f9fafb', margin: 0, fontSize: '14px', fontWeight: '500' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            color: entry.color || entry.stroke, 
            margin: '4px 0 0 0', 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            {entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Revenue Trend Chart Component
 * Displays revenue trends for all regions over the past 12 months
 */
const RevenueTrendChart = () => {
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
        
        // Transform data for Recharts LineChart
        // Group by month and create separate data keys for each region
        const transformedData = {};
        
        result.data.forEach(item => {
          if (!transformedData[item.month]) {
            transformedData[item.month] = {
              month: item.month,
              date: item.date
            };
          }
          transformedData[item.month][item.region] = item.revenue;
        });
        
        setData(Object.values(transformedData));
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Define colors for each region
  const regionColors = {
    'North America': '#60a5fa',
    'Europe': '#3b82f6',
    'Asia Pacific': '#10b981',
    'Latin America': '#f59e0b'
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
          Revenue Trend by Region
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
          Revenue Trend by Region
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
          Revenue Trend by Region
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
        Revenue Trend by Region
      </h3>
      
      <div style={{ height: '400px' }}>
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
              content={<CustomTooltip />}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                color: '#f9fafb'
              }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="North America" 
              stroke={regionColors['North America']}
              strokeWidth={3}
              dot={{ fill: regionColors['North America'], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors['North America'], stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Europe" 
              stroke={regionColors['Europe']}
              strokeWidth={3}
              dot={{ fill: regionColors['Europe'], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors['Europe'], stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Asia Pacific" 
              stroke={regionColors['Asia Pacific']}
              strokeWidth={3}
              dot={{ fill: regionColors['Asia Pacific'], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors['Asia Pacific'], stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Latin America" 
              stroke={regionColors['Latin America']}
              strokeWidth={3}
              dot={{ fill: regionColors['Latin America'], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6,fill: regionColors['Latin America'], stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{
        marginTop: '16px',
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Showing {data.length} months of revenue data across 4 regions
      </div>
    </div>
  );
};

export default RevenueTrendChart;