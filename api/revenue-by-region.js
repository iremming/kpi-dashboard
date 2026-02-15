import { Client } from 'pg';

/**
 * Serverless function to fetch revenue by region data for all 4 regions
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

    // Query latest revenue data for all 4 regions
    // The WHERE clause already fetches the latest date.
    // ORDER BY revenue DESC is crucial for the frontend to apply colors correctly.
    const query = `
      SELECT 
        region,
        revenue
      FROM revenue_by_region 
      WHERE date = (
        SELECT MAX(date) 
        FROM revenue_by_region
      )
      ORDER BY revenue DESC
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
        message: 'No revenue data available'
      });
    }

    // Transform data for frontend consumption
    const revenueData = result.rows.map(row => ({
      region: row.region,
      revenue: parseFloat(row.revenue)
    }));

    // Set CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return successful response with data
    res.status(200).json({
      success: true,
      data: revenueData,
      count: revenueData.length
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
      error: 'Failed to fetch revenue by region data',
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
