import { Client } from 'pg';

/**
 * Serverless function to fetch churn rate data with growth indicator
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

    // Query last 2 months of churn rate data to calculate growth
    const query = `
      SELECT 
        date,
        churn_rate
      FROM monthly_metrics
      ORDER BY date DESC
      LIMIT 2
    `;

    const result = await client.query(query);

    if (result.rows.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          churn_rate: result.rows[0]?.churn_rate || 0,
          growth_percentage: 0
        }
      });
    }

    // Get current month (most recent) and previous month data
    const currentMonth = result.rows[0];
    const previousMonth = result.rows[1];

    // Calculate month-over-month growth percentage
    const currentChurn = parseFloat(currentMonth.churn_rate);
    const previousChurn = parseFloat(previousMonth.churn_rate);
    
    let growthPercentage = 0;
    if (previousChurn > 0) {
      growthPercentage = ((currentChurn - previousChurn) / previousChurn) * 100;
    }

    // Set CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return successful response with data
    // Note: Negative growth is positive for churn (lower churn is better)
    res.status(200).json({
      success: true,
      data: {
        churn_rate: currentChurn,
        growth_percentage: Math.round(growthPercentage * 100) / 100, // Round to 2 decimal places
        current_date: currentMonth.date,
        previous_date: previousMonth.date
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Failed to fetch churn rate data',
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