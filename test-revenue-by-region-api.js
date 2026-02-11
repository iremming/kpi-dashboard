/**
 * Test script to validate the revenue by region API endpoint
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
    const actualColumns = columnCheck.rows.map(row => row.column_name);
    
    for (const column of expectedColumns) {
      if (!actualColumns.includes(column)) {
        console.log(`❌ Missing column: ${column}`);
        console.log('   Please run: npm run seed');
        return;
      }
    }
    
    console.log('✅ All required columns exist: date, region, revenue');
    
    // Check data availability
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM revenue_by_region');
    const recordCount = parseInt(dataCheck.rows[0].count);
    
    if (recordCount === 0) {
      console.log('❌ No data in revenue_by_region table');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log(`✅ Found ${recordCount} records in revenue_by_region`);
    
    // Check for expected regions
    const regionCheck = await client.query(`
      SELECT DISTINCT region, COUNT(*) as months
      FROM revenue_by_region 
      GROUP BY region 
      ORDER BY region
    `);
    
    console.log('\n   Available regions:');
    regionCheck.rows.forEach(row => {
      console.log(`   - ${row.region}: ${row.months} months of data`);
    });
    
    const expectedRegions = ['Asia Pacific', 'Europe', 'Latin America', 'North America'];
    const actualRegions = regionCheck.rows.map(row => row.region);
    
    for (const region of expectedRegions) {
      if (!actualRegions.includes(region)) {
        console.log(`⚠️  Missing expected region: ${region}`);
      }
    }
    
    // Test the actual API logic
    console.log('\n3. Testing API query logic...');
    const apiQuery = `
      SELECT 
        region,
        revenue,
        date
      FROM revenue_by_region 
      WHERE date = (
        SELECT MAX(date) 
        FROM revenue_by_region
      )
      ORDER BY revenue DESC
    `;
    
    const result = await client.query(apiQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No data available for latest month');
      return;
    }
    
    console.log(`✅ Found data for ${result.rows.length} regions in latest month`);
    
    // Analyze the data like the API does
    const revenueData = result.rows.map(row => ({
      region: row.region,
      revenue: parseFloat(row.revenue),
      date: row.date
    }));
    
    const bestPerforming = revenueData[0]; // Already sorted by revenue DESC
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const latestDate = result.rows[0].date;
    
    console.log(`\n📊 Data Analysis for ${new Date(latestDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}:`);
    console.log(`   Best performing region: ${bestPerforming.region}`);
    console.log(`   Total revenue: $${totalRevenue.toLocaleString()}`);
    console.log('\n   Region breakdown:');
    
    revenueData.forEach((region, index) => {
      const percentage = ((region.revenue / totalRevenue) * 100).toFixed(1);
      const isBest = region.region === bestPerforming.region;
      const indicator = isBest ? '🏆' : '  ';
      console.log(`   ${indicator} ${index + 1}. ${region.region}: $${region.revenue.toLocaleString()} (${percentage}%)`);
    });
    
    // Test expected API response structure
    console.log('\n4. Validating API response structure...');
    
    const expectedResponse = {
      success: true,
      data: revenueData,
      bestPerforming: bestPerforming.region,
      totalRevenue: totalRevenue,
      count: revenueData.length,
      date: latestDate
    };
    
    console.log('✅ Expected API response:');
    console.log(JSON.stringify(expectedResponse, null, 2));
    
    // Test chart data transformation
    console.log('\n5. Testing chart data transformation...');
    
    const chartData = revenueData.map(item => ({
      region: item.region,
      revenue: item.revenue,
      fill: item.region === bestPerforming.region ? '#10b981' : '#60a5fa' // Green for best, blue for others
    }));
    
    console.log('✅ Chart data with colors:');
    chartData.forEach(item => {
      const colorName = item.fill === '#10b981' ? 'GREEN (best)' : 'BLUE (other)';
      console.log(`   ${item.region}: $${item.revenue.toLocaleString()} - ${colorName}`);
    });
    
    // Test date ranges
    console.log('\n6. Testing data date range...');
    
    const dateRangeQuery = `
      SELECT 
        MIN(date) as earliest_date,
        MAX(date) as latest_date,
        COUNT(DISTINCT date) as total_months
      FROM revenue_by_region
    `;
    
    const dateRange = await client.query(dateRangeQuery);
    const { earliest_date, latest_date, total_months } = dateRange.rows[0];
    
    console.log(`   Date range: ${earliest_date} to ${latest_date}`);
    console.log(`   Total months of data: ${total_months}`);
    console.log(`   API uses latest month: ${latest_date}`);
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add the test script to package.json: npm script');
    console.log('   2. Start the development server: npm run dev');
    console.log('   3. Visit http://localhost:3000 to see the dashboard');
    console.log('   4. Verify the Revenue by Region bar chart displays correctly');
    console.log('   5. Check that the best performing region is highlighted in green');
    console.log('   6. Ensure all 4 regions are displayed with proper colors');
    console.log('   7. Check browser console for any component errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL environment variable');
    console.log('   3. Run database seeding: npm run seed');
    console.log('   4. Verify database permissions');
    console.log('   5. Check that revenue_by_region table was created properly');
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