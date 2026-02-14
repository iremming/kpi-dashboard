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
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Multi-Region Revenue Chart Component
 * Displays revenue trends for all regions over the past 12 months using Recharts LineChart
 * Demonstrates that LineChart component can support multiple lines with different colors and styling
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
        
        const response = await fetch('/api/all-regions-revenue');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch revenue data');
        }
        
        setData(result.data || []);
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

  // Define colors for each region - demonstrating LineChart's multi-line capability
  const regionColors = {
    NorthAmerica: '#60a5fa',     // Blue
    Europe: '#34d399',          // Green  
    AsiaPacific: '#fbbf24',     // Yellow
    LatinAmerica: '#f87171'     // Red
  };

  // Define display names for regions
  const regionDisplayNames = {
    NorthAmerica: 'North America',
    Europe: 'Europe',
    AsiaPacific: 'Asia Pacific',
    LatinAmerica: 'Latin America'
  };

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
                fontSize: '14px'
              }}
              iconType="line"
            />
            
            {/* Multiple Line components - demonstrating LineChart's multi-line support */}
            <Line 
              type="monotone" 
              dataKey="NorthAmerica" 
              name="North America"
              stroke={regionColors.NorthAmerica}
              strokeWidth={3}
              dot={{ fill: regionColors.NorthAmerica, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors.NorthAmerica, stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Europe" 
              name="Europe"
              stroke={regionColors.Europe}
              strokeWidth={3}
              dot={{ fill: regionColors.Europe, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors.Europe, stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="AsiaPacific" 
              name="Asia Pacific"
              stroke={regionColors.AsiaPacific}
              strokeWidth={3}
              dot={{ fill: regionColors.AsiaPacific, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors.AsiaPacific, stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="LatinAmerica" 
              name="Latin America"
              stroke={regionColors.LatinAmerica}
              strokeWidth={3}
              dot={{ fill: regionColors.LatinAmerica, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: regionColors.LatinAmerica, stroke: '#1f2937', strokeWidth: 2 }}
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
        Showing {data.length} months of revenue data across all regions • Multiple lines demonstrate Recharts LineChart capabilities
      </div>
    </div>
  );
};

export default NorthAmericaRevenueChart;