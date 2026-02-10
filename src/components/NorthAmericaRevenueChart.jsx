import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchNorthAmericaRevenue } from '../api/revenue.js';

/**
 * Custom tooltip component for the revenue chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          Revenue: {data.formattedRevenue}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * North America Revenue Chart Component
 * Displays a line chart showing revenue trends over the past 12 months
 */
const NorthAmericaRevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        const revenueData = await fetchNorthAmericaRevenue();
        setData(revenueData);
      } catch (err) {
        console.error('Error loading revenue data:', err);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">North America Revenue Trend</h3>
        <div className="chart-loading">Loading revenue data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">North America Revenue Trend</h3>
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">North America Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#30363d"
            opacity={0.5}
          />
          <XAxis 
            dataKey="month" 
            stroke="#8b949e"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#8b949e"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: 'compact'
              }).format(value);
            }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#58a6ff', strokeWidth: 1 }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#58a6ff" 
            strokeWidth={3}
            dot={{ fill: '#58a6ff', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#58a6ff', strokeWidth: 2, fill: '#0d1117' }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NorthAmericaRevenueChart;