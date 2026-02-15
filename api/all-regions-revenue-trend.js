import { Client } from 'pg';

/**
 * Serverless function to fetch revenue trend data for all regions
 * Returns time-series data formatted for multi-line chart
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;

  try {
    // Connect to PostgreSQL using DATABASE_URL environment variable
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();

    // Query revenue data for all regions for the past 12 months
    const query = `
      SELECT 
        TO_CHAR(date, 'Mon YYYY') as month,
        date,
        region,
        revenue
      FROM revenue_by_region 
      WHERE date >= CURRENT_DATE - INTERVAL '12 months'
      ORDER BY date ASC, region
    `;

    const result = await client.query(query);

    if (result.rows.length === 0) {
      // Set CORS headers for frontend access
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No revenue trend data available'
      });
    }

    // Transform data for multi-line chart format
    const monthlyData = {};
    
    result.rows.forEach(row => {
      const monthKey = row.month;
      const region = row.region.toLowerCase().replace(/\s+/g, '_');
      const revenue = parseFloat(row.revenue);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          date: row.date
        };
      }
      
      monthlyData[monthKey][region] = revenue;
    });

    // Convert to array and ensure all regions are present in each month
    const chartData = Object.values(monthlyData).map(month => ({
      month: month.month,
      date: month.date,
      north_america: month.north_america || 0,
      europe: month.europe || 0,
      asia_pacific: month.asia_pacific || 0,
      latin_america: month.latin_america || 0
    }));

    // Set CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return successful response with data
    res.status(200).json({
      success: true,
      data: chartData,
      count: chartData.length
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Set CORS headers even for error responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue trend data',
      message: error.message
    });
  } finally {
    // Always close the database connection
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}