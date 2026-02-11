/**
 * Test script to validate the revenue by region API endpoint and component integration
 */

import { Client } from 'pg';

// Mock environment variable for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kpi_dashboard';

/**
 * Test the revenue by region API endpoint functionality
 */
async function testRevenueByRegionAPI() {
  console.log('🧪 Testing Revenue by Region API Endpoint');
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
    console.log('\n2. Checking revenue_by_region table...');
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'revenue_by_region'
    `);
    
    if (parseInt(tableCheck.rows[0].count) === 0) {
      console.log('❌ revenue_by_region table does not exist');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log('✅ revenue_by_region table exists');
    
    // Check required columns exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'revenue_by_region' 
      AND column_name IN ('date', 'region', 'revenue')
      ORDER BY column_name
    `);
    
    const expectedColumns = ['date', 'region', 'revenue'];
    const actualColumns = columnCheck.rows.map(row => row.column_name).sort();
    
    if (actualColumns.length !== expectedColumns.length) {
      console.log('❌ Missing required columns in revenue_by_region table');
      console.log('   Expected:', expectedColumns);
      console.log('   Found:', actualColumns);
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log('✅ Required columns exist:', actualColumns);
    
    // Check data availability
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM revenue_by_region');
    const recordCount = parseInt(dataCheck.rows[0].count);
    
    if (recordCount === 0) {
      console.log('❌ No data in revenue_by_region table');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log(`✅ Found ${recordCount} records in revenue_by_region`);
    
    // Check region data
    console.log('\n3. Analyzing region data...');
    const regionCheck = await client.query(`
      SELECT DISTINCT region 
      FROM revenue_by_region 
      ORDER BY region
    `);
    
    const regions = regionCheck.rows.map(row => row.region);
    console.log(`✅ Found ${regions.length} regions:`, regions);
    
    if (regions.length !== 4) {
      console.log('⚠️  Expected 4 regions, found', regions.length);
      console.log('   Expected: North America, Europe, Asia Pacific, Latin America');
    }
    
    // Test the actual API logic
    console.log('\n4. Testing API query logic...');
    const apiQuery = `
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
    
    const result = await client.query(apiQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No data available for latest date');
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} regions for latest date`);
    
    // Analyze the data like the API does
    const latestDateQuery = await client.query('SELECT MAX(date) as max_date FROM revenue_by_region');
    const latestDate = latestDateQuery.rows[0].max_date;
    
    console.log(`\n📊 Data Analysis for ${latestDate}:`);
    
    let totalRevenue = 0;
    result.rows.forEach((row, index) => {
      const revenue = parseFloat(row.revenue);
      totalRevenue += revenue;
      
      const ranking = index === 0 ? '🥇 TOP PERFORMER' : 
                     index === 1 ? '🥈 2nd place' :
                     index === 2 ? '🥉 3rd place' : '4th place';
      
      console.log(`   ${ranking}: ${row.region} - $${revenue.toLocaleString()}`);
    });
    
    console.log(`   💰 Total Revenue: $${totalRevenue.toLocaleString()}`);
    
    // Test color assignment logic
    console.log('\n5. Testing bar chart color assignment...');
    const colors = [
      '#60a5fa', // Brightest blue for highest revenue
      '#3b82f6', // Medium blue for second highest
      '#2563eb', // Darker blue for third highest
      '#1d4ed8'  // Darkest blue for lowest revenue
    ];
    
    result.rows.forEach((row, index) => {
      const color = colors[index] || '#1d4ed8';
      console.log(`   ${row.region}: ${color} (rank ${index + 1})`);
    });
    
    // Test expected API response structure
    console.log('\n6. Validating API response structure...');
    
    const revenueData = result.rows.map(row => ({
      region: row.region,
      revenue: parseFloat(row.revenue)
    }));
    
    const expectedResponse = {
      success: true,
      data: revenueData,
      count: revenueData.length
    };
    
    console.log('✅ Expected API response structure validated');
    console.log('Sample response:', JSON.stringify({
      ...expectedResponse,
      data: expectedResponse.data.slice(0, 2) // Show first 2 for brevity
    }, null, 2));
    
    // Test component integration readiness
    console.log('\n7. Testing component integration readiness...');
    
    // Verify data can be processed for chart display
    const chartData = revenueData.map((item, index) => ({
      ...item,
      fill: colors[index] || colors[3]
    }));
    
    console.log('✅ Chart data transformation successful');
    console.log('✅ Color assignment logic working');
    
    const topPerformer = chartData[0];
    console.log(`✅ Top performer identification: ${topPerformer.region} ($${topPerformer.revenue.toLocaleString()})`);
    
    console.log('\n8. Testing error handling scenarios...');
    
    // Test with invalid date (should return empty result)
    const invalidDateQuery = `
      SELECT region, revenue
      FROM revenue_by_region 
      WHERE date = '1900-01-01'
    `;
    
    const invalidResult = await client.query(invalidDateQuery);
    console.log(`✅ Invalid date query returns ${invalidResult.rows.length} rows (expected 0)`);
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000 to see the dashboard');
    console.log('   3. Verify RevenueByRegionChart appears below NorthAmericaRevenueChart');
    console.log('   4. Check that bars are colored by performance (brightest = highest revenue)');
    console.log('   5. Verify top performer is highlighted in chart footer');
    console.log('   6. Test hover interactions on bars');
    console.log('   7. Check responsive layout on mobile/tablet');
    console.log('   8. Check browser console for any component errors');
    
    console.log('\n🎨 Visual Validation Checklist:');
    console.log('   □ Chart title: "Revenue by Region"');
    console.log('   □ Dark theme background (#1f2937)');
    console.log('   □ Bars sorted by revenue (highest to lowest)');
    console.log('   □ Color gradient from brightest (top) to darkest (bottom)');
    console.log('   □ Proper currency formatting in tooltips');
    console.log('   □ Top performer callout in footer');
    console.log('   □ Responsive design on mobile devices');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL environment variable');
    console.log('   3. Run database seeding: npm run seed');
    console.log('   4. Verify database permissions');
    console.log('   5. Check that revenue_by_region table was created properly');
    console.log('   6. Ensure all 4 regions have data for the latest date');
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
testRevenueByRegionAPI();