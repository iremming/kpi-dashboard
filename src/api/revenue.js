import { query } from '../db/connection.js';

/**
 * Format date to month name for chart display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Month name (e.g., 'Jan 2025')
 */
function formatMonthName(dateString) {
  const date = new Date(dateString);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format revenue value with proper currency formatting
 * @param {number} revenue - Revenue amount
 * @returns {string} Formatted revenue string (e.g., '$50,000')
 */
function formatRevenue(revenue) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(revenue);
}

/**
 * Fetch North America revenue data for the last 12 months
 * @returns {Promise<Array>} Array of formatted revenue data points
 */
export async function fetchNorthAmericaRevenue() {
  try {
    const queryText = `
      SELECT date, revenue
      FROM revenue_by_region
      WHERE region = 'North America'
      ORDER BY date ASC
    `;
    
    const result = await query(queryText);
    
    // Format data for chart consumption
    const formattedData = result.rows.map(row => ({
      month: formatMonthName(row.date),
      revenue: parseFloat(row.revenue),
      formattedRevenue: formatRevenue(parseFloat(row.revenue))
    }));
    
    return formattedData;
    
  } catch (error) {
    console.error('Error fetching North America revenue data:', error);
    throw new Error('Failed to fetch revenue data');
  }
}