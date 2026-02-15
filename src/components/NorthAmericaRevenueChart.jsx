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
 * Region color palette
 */
const regionColors = {
  'North America': '#60a5fa',
  'Europe': '#a855f7',
  'Asia Pacific': '#f97316',
  'Latin America': '#22c55e'
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
          <p key={index} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600' }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Custom legend component for better control over styling
 */
const renderCustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '16px',
      flexWrap: 'wrap'
    }}>
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <div style={{
            width: '12px',
            height: '3px',
            backgroundColor: entry.color,
            borderRadius: '2px'
          }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
};

/**
 * Regional Revenue Chart Component
 * Displays revenue trends for all regions over the past 12 months
 */
const NorthAmericaRevenueChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/all-regions-revenue');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch revenue data');
        }
        
        setData(result.data || {});
      } catch (err) {
        console.error('Error fetching all regions revenue data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

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
          Regional Revenue Trends
        </h3>
        <div style={{
          height: '350px',
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
          Regional Revenue Trends
        </h3>
        <div style={{
          height: '350px',
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

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{
        backgroundColor: '#极地影7',
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
          Regional Revenue Trends
        </h3>
        <div style={{
          height: '350px',
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

  // Create data structure for Recharts - array of objects with month as key
  // and each region as a property
  const chartData = [];
  const allMonths = data['North America']?.map(item => item.month) || [];
  
  allMonths.forEach(month => {
    const monthData = { month };
    
    Object.keys(data).forEach(region => {
      const regionMonthData = data[region]?.find(item => item.month === month);
      if (regionMonthData) {
        monthData[region] = regionMonthData.revenue;
      }
    });
    
    chartData.push(monthData);
  });

  const regionCount = Object.keys(data).length;
  const totalMonths = Object.values(data).reduce((total, regionData) => total + (regionData?.length || 0), 0) / regionCount;

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
        Regional Revenue Trends
      </h3>
      
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
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
            {Object.keys(data).map(region => (
              <Line 
                key={region}
                type="monotone" 
                dataKey={region}
                stroke={regionColors[region] || '#60a5fa'}
                strokeWidth={3}
                dot={{ fill: regionColors[region] || '#60a5fa', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: regionColors[region] || '#60a5fa', stroke: '#1f2937', strokeWidth: 2 }}
                animationDuration={1000}
                name={region}
              />
            ))}
            <Legend content={renderCustomLegend} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{
        marginTop: '16px',
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Showing {totalMonths} months of revenue data across {regionCount} regions
      </div>
    </div>
  );
};

export default NorthAmericaRevenueChart;