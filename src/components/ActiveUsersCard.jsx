import React, { useState, useEffect } from 'react';

/**
 * Format number with commas for display
 * @param {number} value - Number to format
 * @returns {string} Formatted number string
 */
const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format percentage for display with + or - sign
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage string
 */
const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Active Users Card Component
 * Displays total active users with month-over-month growth percentage
 */
const ActiveUsersCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveUsersData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/active-users');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch active users data');
        }
        
        setData(result.data);
      } catch (err) {
        console.error('Error fetching active users data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsersData();
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
          Active Users
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
          Active Users
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
          Active Users
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

  const growthColor = data.growth_percentage >= 0 ? '#10b981' : '#ef4444';

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
        Active Users
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
          {formatNumber(data.active_users)}
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
            {data.growth_percentage >= 0 ? '↗' : '↘'}
          </span>
          {formatPercentage(data.growth_percentage)}
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersCard;