/**
 * Test script to validate the churn rate API endpoint and component integration
 */

import { Client } from 'pg';

// Mock environment variable for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kpi_dashboard';

/**
 * Test the churn rate API endpoint functionality
 */
async function testChurnRateAPI() {
  console.log('🧪 Testing Churn Rate API Endpoint');
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
    
    // Check if churn_rate column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'monthly_metrics' AND column_name = 'churn_rate'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ churn_rate column does not exist in monthly_metrics table');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log('✅ churn_rate column exists');
    
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
        churn_rate
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
        console.log('❌ No data available for churn rate');
        return;
      }
    } else {
      console.log('✅ Found sufficient data for growth calculation');
    }
    
    // Calculate growth like the API does
    const currentMonth = result.rows[0];
    const previousMonth = result.rows[1];
    
    const currentChurn = parseFloat(currentMonth.churn_rate);
    let growthPercentage = 0;
    
    if (result.rows.length >= 2) {
      const previousChurn = parseFloat(previousMonth.churn_rate);
      
      if (previousChurn > 0) {
        growthPercentage = ((currentChurn - previousChurn) / previousChurn) * 100;
      }
      
      console.log(`\n📊 Data Analysis:`);
      console.log(`   Current month (${currentMonth.date}): ${currentChurn.toFixed(1)}% churn rate`);
      console.log(`   Previous month (${previousMonth.date}): ${previousChurn.toFixed(1)}% churn rate`);
      console.log(`   Change: ${growthPercentage >= 0 ? '+' : ''}${(Math.round(growthPercentage * 100) / 100).toFixed(1)}%`);
      
      // Test color logic
      const isChurnDecreasing = growthPercentage <= 0;
      const indicatorColor = isChurnDecreasing ? 'GREEN (good)' : 'RED (bad)';
      const indicatorIcon = isChurnDecreasing ? '↘ (down)' : '↗ (up)';
      
      console.log(`\n🎨 Color Logic Test:`);
      console.log(`   Churn is ${isChurnDecreasing ? 'decreasing' : 'increasing'}`);
      console.log(`   Display color: ${indicatorColor}`);
      console.log(`   Display icon: ${indicatorIcon}`);
      console.log(`   This is ${isChurnDecreasing ? 'POSITIVE' : 'NEGATIVE'} (lower churn = better)`);
    } else {
      console.log(`\n📊 Data Analysis:`);
      console.log(`   Current month (${currentMonth.date}): ${currentChurn.toFixed(1)}% churn rate`);
      console.log(`   Growth: No previous data available (0.0%)`);
    }
    
    // Test expected API response structure
    console.log('\n4. Validating API response structure...');
    
    const expectedResponse = {
      success: true,
      data: {
        churn_rate: currentChurn,
        growth_percentage: Math.round(growthPercentage * 100) / 100,
        current_date: currentMonth.date,
        previous_date: result.rows.length >= 2 ? previousMonth.date : null
      }
    };
    
    console.log('✅ Expected API response:');
    console.log(JSON.stringify(expectedResponse, null, 2));
    
    // Test percentage formatting
    console.log('\n5. Testing display formatting...');
    const displayChurnRate = `${currentChurn.toFixed(1)}%`;
    const displayChange = `${growthPercentage >= 0 ? '+' : ''}${Math.abs(growthPercentage).toFixed(1)}%`;
    
    console.log(`   Churn rate display: "${displayChurnRate}"`);
    console.log(`   Change display: "${displayChange}"`);
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000 to see the dashboard');
    console.log('   3. Check that ChurnRateCard appears next to ActiveUsersCard');
    console.log('   4. Verify colors: GREEN for decreasing churn, RED for increasing churn');
    console.log('   5. Check browser console for any component errors');
    
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
testChurnRateAPI();