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
 * Enhanced custom tooltip component for the multi-region line chart
 * Shows all regions' data when hovering with improved styling and interaction
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Calculate total revenue for all regions in this month
    const totalRevenue = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    
    // Sort payload by value (highest to lowest) for better UX
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
    
    return (
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
        minWidth: '200px',
        maxWidth: '300px'
      }}>
        {/* Month header with enhanced styling */}
        <div style={{
          color: '#f9fafb',
          margin: '0 0 12px 0',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid #374151'
        }}>
          {label}
        </div>
        
        {/* Individual region data */}
        {sortedPayload.map((entry, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '6px 0',
            padding: '4px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {/* Color indicator dot */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                border: '2px solid #1f2937',
                boxShadow: `0 0 0 1px ${entry.color}`
              }} />
              <span style={{
                color: '#e5e7eb',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {entry.name}
              </span>
            </div>
            <span style={{
              color: entry.color,
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: 'ui-monospace, monospace'
            }}>
              {formatCurrency(entry.value || 0)}
            </span>
          </div>
        ))}
        
        {/* Total revenue footer */}
        <div style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '13px',
            color: '#9ca3af',
            fontWeight: '500'
          }}>
            Total Revenue:
          </span>
          <span style={{
            fontSize: '15px',
            color: '#10b981',
            fontWeight: '700',
            fontFamily: 'ui-monospace, monospace'
          }}>
            {formatCurrency(totalRevenue)}
          </span>
        </div>
        
        {/* Growth indicator for total (if applicable) */}
        {payload.length > 0 && (
          <div style={{
            marginTop: '6px',
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Hover over lines to highlight individual regions
          </div>
        )}
      </div>
    );
  }
  return null;
};

/**
 * Enhanced Multi-Region Revenue Chart Component
 * Displays revenue trends for all regions over the past 12 months using Recharts LineChart
 * Features distinct colors, enhanced tooltips, and interactive legend
 */
const NorthAmericaRevenueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);

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
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div className="loading-spinner" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #374151',
            borderTop: '3px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div>Loading revenue data...</div>
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
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '18px' }}>⚠️</div>
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

  // Enhanced color palette for distinct region identification
  // Following accessibility guidelines with sufficient contrast
  const regionColors = {
    NorthAmerica: '#60a5fa',     // Bright Blue - Primary region
    Europe: '#34d399',          // Emerald Green - Strong contrast
    AsiaPacific: '#fbbf24',     // Amber Yellow - High visibility
    LatinAmerica: '#f87171'     // Coral Red - Warm complement
  };

  // Enhanced display names with proper formatting
  const regionDisplayNames = {
    NorthAmerica: 'North America',
    Europe: 'Europe',
    AsiaPacific: 'Asia Pacific',
    LatinAmerica: 'Latin America'
  };

  // Calculate performance metrics for enhanced insights
  const totalDataPoints = data.length;
  const latestMonth = data[data.length - 1];
  const latestTotal = latestMonth ? 
    (latestMonth.NorthAmerica || 0) + 
    (latestMonth.Europe || 0) + 
    (latestMonth.AsiaPacific || 0) + 
    (latestMonth.LatinAmerica || 0) : 0;

  // Calculate regional performance for the legend
  const regionPerformance = latestMonth ? [
    { key: 'NorthAmerica', value: latestMonth.NorthAmerica || 0 },
    { key: 'Europe', value: latestMonth.Europe || 0 },
    { key: 'AsiaPacific', value: latestMonth.AsiaPacific || 0 },
    { key: 'LatinAmerica', value: latestMonth.LatinAmerica || 0 }
  ].sort((a, b) => b.value - a.value) : [];

  // Handle legend interactions
  const handleLegendMouseEnter = (regionKey) => {
    setHighlightedRegion(regionKey);
  };

  const handleLegendMouseLeave = () => {
    setHighlightedRegion(null);
  };

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #374151'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{
          color: '#f9fafb',
          fontSize: '18px',
          fontWeight: '600',
          margin: 0
        }}>
          Revenue Trends by Region
        </h3>
        
        {/* Performance indicator */}
        {latestMonth && (
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            textAlign: 'right'
          }}>
            <div>Latest: {latestMonth.month}</div>
            <div style={{ color: '#10b981', fontWeight: '600' }}>
              Total: {formatCurrency(latestTotal)}
            </div>
          </div>
        )}
      </div>
      
      <div style={{ height: '420px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              strokeOpacity={0.6}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              interval="preserveStartEnd"
              angle={0}
              textAnchor="middle"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{
                stroke: '#6b7280',
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '24px',
                fontSize: '13px',
                color: '#f9fafb'
              }}
              iconType="line"
              iconSize={16}
              onMouseEnter={(data) => handleLegendMouseEnter(data.dataKey)}
              onMouseLeave={handleLegendMouseLeave}
              formatter={(value, entry) => {
                const regionKey = entry.dataKey;
                const performance = regionPerformance.find(r => r.key === regionKey);
                const rank = performance ? regionPerformance.findIndex(r => r.key === regionKey) + 1 : '-';
                
                return (
                  <span style={{
                    color: highlightedRegion === regionKey || !highlightedRegion ? entry.color : '#6b7280',
                    fontWeight: highlightedRegion === regionKey ? '600' : '500',
                    transition: 'all 0.2s ease'
                  }}>
                    {value} {performance && `(#${rank})`}
                  </span>
                );
              }}
            />
            
            {/* Enhanced Line components with distinct styling and interactions */}
            <Line 
              type="monotone" 
              dataKey="NorthAmerica" 
              name="North America"
              stroke={regionColors.NorthAmerica}
              strokeWidth={highlightedRegion === 'NorthAmerica' || !highlightedRegion ? 3 : 1.5}
              dot={{ 
                fill: regionColors.NorthAmerica, 
                strokeWidth: 2, 
                r: highlightedRegion === 'NorthAmerica' || !highlightedRegion ? 4 : 2,
                stroke: '#1f2937'
              }}
              activeDot={{ 
                r: 6, 
                fill: regionColors.NorthAmerica, 
                stroke: '#1f2937', 
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 0 6px rgba(96, 165, 250, 0.6))' }
              }}
              animationDuration={1200}
              animationEasing="ease-out"
              connectNulls={false}
              opacity={highlightedRegion === 'NorthAmerica' || !highlightedRegion ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <Line 
              type="monotone" 
              dataKey="Europe" 
              name="Europe"
              stroke={regionColors.Europe}
              strokeWidth={highlightedRegion === 'Europe' || !highlightedRegion ? 3 : 1.5}
              dot={{ 
                fill: regionColors.Europe, 
                strokeWidth: 2, 
                r: highlightedRegion === 'Europe' || !highlightedRegion ? 4 : 2,
                stroke: '#1f2937'
              }}
              activeDot={{ 
                r: 6, 
                fill: regionColors.Europe, 
                stroke: '#1f2937', 
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.6))' }
              }}
              animationDuration={1200}
              animationEasing="ease-out"
              connectNulls={false}
              opacity={highlightedRegion === 'Europe' || !highlightedRegion ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <Line 
              type="monotone" 
              dataKey="AsiaPacific" 
              name="Asia Pacific"
              stroke={regionColors.AsiaPacific}
              strokeWidth={highlightedRegion === 'AsiaPacific' || !highlightedRegion ? 3 : 1.5}
              dot={{ 
                fill: regionColors.AsiaPacific, 
                strokeWidth: 2, 
                r: highlightedRegion === 'AsiaPacific' || !highlightedRegion ? 4 : 2,
                stroke: '#1f2937'
              }}
              activeDot={{ 
                r: 6, 
                fill: regionColors.AsiaPacific, 
                stroke: '#1f2937', 
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))' }
              }}
              animationDuration={1200}
              animationEasing="ease-out"
              connectNulls={false}
              opacity={highlightedRegion === 'AsiaPacific' || !highlightedRegion ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <Line 
              type="monotone" 
              dataKey="LatinAmerica" 
              name="Latin America"
              stroke={regionColors.LatinAmerica}
              strokeWidth={highlightedRegion === 'LatinAmerica' || !highlightedRegion ? 3 : 1.5}
              dot={{ 
                fill: regionColors.LatinAmerica, 
                strokeWidth: 2, 
                r: highlightedRegion === 'LatinAmerica' || !highlightedRegion ? 4 : 2,
                stroke: '#1f2937'
              }}
              activeDot={{ 
                r: 6, 
                fill: regionColors.LatinAmerica, 
                stroke: '#1f2937', 
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 0 6px rgba(248, 113, 113, 0.6))' }
              }}
              animationDuration={1200}
              animationEasing="ease-out"
              connectNulls={false}
              opacity={highlightedRegion === 'LatinAmerica' || !highlightedRegion ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s ease' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Enhanced footer with regional performance insights */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: '#6b7280',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            Showing {totalDataPoints} months of revenue data across all regions
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            Hover over legend items to highlight individual regions
          </div>
        </div>
        
        {latestMonth && regionPerformance.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}>
            <div style={{
              color: '#10b981',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Top Performer: {regionDisplayNames[regionPerformance[0].key]}
            </div>
            <div style={{
              color: '#9ca3af',
              fontSize: '11px'
            }}>
              {formatCurrency(regionPerformance[0].value)} in {latestMonth.month}
            </div>
          </div>
        )}
      </div>
      
      {/* Accessibility and interaction hints */}
      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
        borderTop: '1px solid #374151',
        paddingTop: '8px'
      }}>
        💡 Interactive multi-region chart • Enhanced tooltips show all data • Click legend to highlight regions
      </div>
    </div>
  );
};

export default NorthAmericaRevenueChart;