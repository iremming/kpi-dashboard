import { Client } from 'pg';

/**
 * Serverless function to fetch revenue data for all regions over the past 12 months
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

    // Query last 12 months of revenue data for all 4 regions
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

    // Transform data for frontend consumption - group by region
    const regionData = {
      'North America': [],
      'Europe': [],
      'Asia Pacific': [],
      'Latin America': []
    };

    result.rows.forEach(row => {
      if (regionData[row.region]) {
        regionData[row.region].push({
          month: row.month,
          date: row.date,
          revenue: parseFloat(row.revenue)
        });
      }
    });

    // Set CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return successful response with data
    res.status(200).json({
      success: true,
      data: regionData,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all regions revenue data',
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