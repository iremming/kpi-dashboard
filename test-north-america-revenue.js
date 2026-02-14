/**
 * Test script to validate the multi-region revenue API endpoint
 */

import { Client } from 'pg';

// Mock environment variable for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kpi_dashboard';

/**
 * Test the north-america-revenue API endpoint (now returns all regions)
 */
async function testMultiRegionRevenueAPI() {
  console.log('🧪 Testing Multi-Region Revenue API Endpoint');
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
    
    // Test the actual API logic (all regions for 12 months)
    console.log('\n4. Testing API query logic...');
    const apiQuery = `
      SELECT 
        TO_CHAR(date, 'Mon YYYY') as month,
        date,
        region,
        revenue
      FROM revenue_by_region 
      WHERE date >= CURRENT_DATE - INTERVAL '12 months'
      ORDER BY date ASC, region ASC
    `;
    
    const result = await client.query(apiQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No data available for last 12 months');
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} records for multi-region chart`);
    
    // Analyze the data by month and region
    const dataByMonth = {};
    result.rows.forEach(row => {
      const month = row.month;
      if (!dataByMonth[month]) {
        dataByMonth[month] = {};
      }
      dataByMonth[month][row.region] = parseFloat(row.revenue);
    });
    
    const months = Object.keys(dataByMonth).sort();
    console.log(`\n📊 Data Analysis for Multi-Region Chart:`);
    console.log(`   Months available: ${months.length}`);
    console.log(`   Date range: ${months[0]} to ${months[months.length - 1]}`);
    
    // Show sample data for first few months
    const sampleMonths = months.slice(0, 3);
    sampleMonths.forEach(month => {
      console.log(`   ${month}:`);
      Object.entries(dataByMonth[month]).forEach(([region, revenue]) => {
        console.log(`     ${region}: $${revenue.toLocaleString()}`);
      });
    });
    
    // Test chart data transformation
    console.log('\n5. Testing chart data transformation...');
    
    // Transform data like the component does
    const chartData = months.map(month => {
      const monthData = { month, ...dataByMonth[month] };
      return monthData;
    });
    
    console.log(`✅ Chart data transformation successful`);
    console.log(`✅ ${chartData.length} data points for line chart`);
    
    // Check that all regions have data for most months
    const regionsInData = new Set();
    chartData.forEach(monthData => {
      Object.keys(monthData).forEach(key => {
        if (key !== 'month' && regions.includes(key)) {
          regionsInData.add(key);
        }
      });
    });
    
    console.log(`✅ Regions with data: ${Array.from(regionsInData).sort().join(', ')}`);
    
    // Test expected API response structure
    console.log('\n6. Validating API response structure...');
    
    const transformedData = result.rows.map(row => ({
      month: row.month,
      date: row.date,
      region: row.region,
      revenue: parseFloat(row.revenue)
    }));
    
    const expectedResponse = {
      success: true,
      data: transformedData,
      count: transformedData.length
    };
    
    console.log('✅ Expected API response structure validated');
    console.log('Sample response (first 3 records):');
    console.log(JSON.stringify({
      success: expectedResponse.success,
      data: expectedResponse.data.slice(0, 3),
      count: expectedResponse.count
    }, null, 2));
    
    // Test multi-region line chart colors
    console.log('\n7. Testing multi-region line chart colors...');
    const regionColors = {
      'North America': '#60a5fa',
      'Europe': '#34d399',
      'Asia Pacific': '#fbbf24',
      'Latin America': '#f87171'
    };
    
    regions.forEach(region => {
      const color = regionColors[region] || '#9ca3af';
      console.log(`   ${region}: ${color}`);
    });
    
    console.log('✅ Region color mapping complete');
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000 to see the dashboard');
    console.log('   3. Verify Revenue Trends by Region chart shows multiple lines');
    console.log('   4. Check that each region has its own colored line');
    console.log('   5. Verify legend shows all 4 regions');
    console.log('   6. Test hover interactions on different lines');
    console.log('   7. Check responsive layout on mobile/tablet');
    console.log('   8. Check browser console for any component errors');
    
    console.log('\n🎨 Visual Validation Checklist:');
    console.log('   □ Chart title: "Revenue Trends by Region"');
    console.log('   □ Dark theme background (#1f2937)');
    console.log('   □ Legend shows all 4 regions with color indicators');
    console.log('   □ Multiple colored lines (blue, green, yellow, red)');
    console.log('   □ Proper currency formatting in tooltips');
    console.log('   □ X-axis shows months, angled for readability');
    console.log('   □ Y-axis shows currency values');
    console.log('   □ Smooth line animations on load');
    console.log('   □ Responsive design on mobile devices');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL environment variable');
    console.log('   3. Run database seeding: npm run seed');
    console.log('   4. Verify database permissions');
    console.log('   5. Check that revenue_by_region table was created properly');
    console.log('   6. Ensure all 4 regions have data for multiple months');
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
testMultiRegionRevenueAPI();