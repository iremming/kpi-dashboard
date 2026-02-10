import React, { useState, useEffect } from 'react';

/**
 * Format percentage for display
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage string
 */
const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format percentage change for display with + or - sign
 * @param {number} value - Percentage change value
 * @returns {string} Formatted percentage change string
 */
const formatPercentageChange = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Churn Rate Card Component
 * Displays current churn rate with month-over-month change percentage
 * Uses inverse color logic - green for decreasing churn (good), red for increasing churn (bad)
 */
const ChurnRateCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChurnRateData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/churn-rate');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch churn rate data');
        }
        
        setData(result.data);
      } catch (err) {
        console.error('Error fetching churn rate data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChurnRateData();
  }, []);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid #374151',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h4 style={{
          color: '#f9fafb',
          fontSize: '14px',
          fontWeight: '500',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Churn Rate
        </h4>
        <div style={{
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          Loading...
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
        border: '1px solid #ef4444',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h4 style={{
          color: '#f9fafb',
          fontSize: '14px',
          fontWeight: '500',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Churn Rate
        </h4>
        <div style={{
          color: '#ef4444',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          Error loading data
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid #374151',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h4 style={{
          color: '#f9fafb',
          fontSize: '14px',
          fontWeight: '500',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Churn Rate
        </h4>
        <div style={{
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          No data available
        </div>
      </div>
    );
  }

  // Inverse color logic: negative growth (decreasing churn) is good (green)
  // positive growth (increasing churn) is bad (red)
  const growthColor = data.growth_percentage <= 0 ? '#10b981' : '#ef4444';
  const growthIcon = data.growth_percentage <= 0 ? '↘' : '↗';

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #374151',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <h4 style={{
        color: '#9ca3af',
        fontSize: '13px',
        fontWeight: '500',
        margin: '0 0 8px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Churn Rate
      </h4>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          color: '#f9fafb',
          fontSize: '32px',
          fontWeight: '700',
          lineHeight: '1',
          fontFamily: 'monospace'
        }}>
          {formatPercentage(data.churn_rate)}
        </div>
        
        <div style={{
          color: growthColor,
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '12px'
          }}>
            {growthIcon}
          </span>
          {formatPercentageChange(data.growth_percentage)}
        </div>
      </div>
    </div>
  );
};

export default ChurnRateCard;