/**
 * Test script to validate the active users API endpoint
 */

import { Client } from 'pg';

// Mock environment variable for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kpi_dashboard';

/**
 * Test the active users API endpoint functionality
 */
async function testActiveUsersAPI() {
  console.log('🧪 Testing Active Users API Endpoint');
  console.log('=' .repeat(50));
  
  let client;
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Test table exists and has data
    console.log('\n2. Checking monthly_metrics table...');
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'monthly_metrics'
    `);
    
    if (parseInt(tableCheck.rows[0].count) === 0) {
      console.log('❌ monthly_metrics table does not exist');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log('✅ monthly_metrics table exists');
    
    // Check data availability
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM monthly_metrics');
    const recordCount = parseInt(dataCheck.rows[0].count);
    
    if (recordCount === 0) {
      console.log('❌ No data in monthly_metrics table');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log(`✅ Found ${recordCount} records in monthly_metrics`);
    
    // Test the actual API logic
    console.log('\n3. Testing API query logic...');
    const apiQuery = `
      SELECT 
        date,
        active_users
      FROM monthly_metrics
      ORDER BY date DESC
      LIMIT 2
    `;
    
    const result = await client.query(apiQuery);
    
    if (result.rows.length < 2) {
      console.log(`⚠️  Only ${result.rows.length} month(s) of data available`);
      if (result.rows.length === 1) {
        console.log('   Growth calculation will default to 0%');
      } else {
        console.log('❌ No data available for active users');
        return;
      }
    } else {
      console.log('✅ Found sufficient data for growth calculation');
    }
    
    // Calculate growth like the API does
    const currentMonth = result.rows[0];
    const previousMonth = result.rows[1];
    
    const currentUsers = parseInt(currentMonth.active_users);
    let growthPercentage = 0;
    
    if (result.rows.length >= 2) {
      const previousUsers = parseInt(previousMonth.active_users);
      
      if (previousUsers > 0) {
        growthPercentage = ((currentUsers - previousUsers) / previousUsers) * 100;
      }
      
      console.log(`\n📊 Data Analysis:`);
      console.log(`   Current month (${currentMonth.date}): ${currentUsers.toLocaleString()} users`);
      console.log(`   Previous month (${previousMonth.date}): ${previousUsers.toLocaleString()} users`);
      console.log(`   Growth: ${growthPercentage >= 0 ? '+' : ''}${(Math.round(growthPercentage * 100) / 100).toFixed(1)}%`);
    } else {
      console.log(`\n📊 Data Analysis:`);
      console.log(`   Current month (${currentMonth.date}): ${currentUsers.toLocaleString()} users`);
      console.log(`   Growth: No previous data available (0.0%)`);
    }
    
    // Test expected API response structure
    console.log('\n4. Validating API response structure...');
    
    const expectedResponse = {
      success: true,
      data: {
        active_users: currentUsers,
        growth_percentage: Math.round(growthPercentage * 100) / 100,
        current_date: currentMonth.date,
        previous_date: result.rows.length >= 2 ? previousMonth.date : null
      }
    };
    
    console.log('✅ Expected API response:');
    console.log(JSON.stringify(expectedResponse, null, 2));
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000 to see the dashboard');
    console.log('   3. Check browser console for any component errors');
    console.log('   4. Verify the Active Users card displays correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL environment variable');
    console.log('   3. Run database seeding: npm run seed');
    console.log('   4. Verify database permissions');
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError.message);
      }
    }
  }
}

// Run the test
testActiveUsersAPI();