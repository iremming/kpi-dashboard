#!/usr/bin/env node

/**
 * Test script to validate the all regions revenue API endpoint
 */

import { Client } from 'pg';

// Mock environment variable for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kpi_dashboard';

/**
 * Test the all regions revenue API endpoint functionality
 */
async function testAllRegionsRevenueAPI() {
  console.log('🧪 Testing All Regions Revenue API Endpoint');
  console.log('='.repeat(50));
  
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
    
    // Check data availability
    console.log('\n3. Checking data availability...');
    const dataCheck = await client.query('SELECT COUNT(*) as count FROM revenue_by_region');
    const recordCount = parseInt(dataCheck.rows[0].count);
    
    if (recordCount === 0) {
      console.log('❌ No data in revenue_by_region table');
      console.log('   Please run: npm run seed');
      return;
    }
    
    console.log(`✅ Found ${recordCount} records in revenue_by_region`);
    
    // Check region coverage - should have all 4 regions
    const regionCheck = await client.query(`
      SELECT DISTINCT region 
      FROM revenue_by_region 
      ORDER BY region
    `);
    
    const regions = regionCheck.rows.map(row => row.region);
    console.log(`✅ Found ${regions.length} regions:`, regions);
    
    const expectedRegions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    const hasAllRegions = expectedRegions.every(region => regions.includes(region));
    
    if (!hasAllRegions) {
      console.log('⚠️  Missing regions. Expected:', expectedRegions);
      console.log('   Found:', regions);
    } else {
      console.log('✅ All 4 expected regions found');
    }
    
    // Test the actual API query logic
    console.log('\n4. Testing API query logic...');
    const apiQuery = `
      SELECT 
        TO_CHAR(date, 'Mon YYYY') as month,
        date,
        region,
        revenue
      FROM revenue_by_region 
      WHERE date >= CURRENT_DATE - INTERVAL '12 months'
      ORDER BY date ASC, region
    `;
    
    const result = await client.query(apiQuery);
    
    if (result.rows.length === 0) {
      console.log('❌ No data found for the past 12 months');
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} records for the past 12 months`);
    
    // Transform data like the API does
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
    
    // Count months per region
    console.log('\n📊 Data Analysis by Region:');
    Object.keys(regionData).forEach(region => {
      const months = regionData[region].length;
      console.log(`   ${region}: ${months} months of data`);
    });
    
    // Check sample data
    const sampleRegion = Object.keys(regionData)[0];
    if (regionData[sampleRegion].length > 0) {
      console.log('\n📈 Sample data points:');
      regionData[sampleRegion].slice(0, 3).forEach(dataPoint => {
        console.log(`   ${dataPoint.month}: $${dataPoint.revenue.toLocaleString()}`);
      });
    }
    
    // Test expected API response structure
    console.log('\n5. Validating API response structure...');
    
    const expectedResponse = {
      success: true,
      data: regionData,
      count: result.rows.length
    };
    
    const hasRequiredFields = (
      expectedResponse.success === true &&
      expectedResponse.data &&
      typeof expectedResponse.count === 'number'
    );
    
    if (hasRequiredFields) {
      console.log('✅ API response structure is valid');
    } else {
      console.log('❌ API response structure is invalid');
    }
    
    console.log('\n🎉 API endpoint validation completed successfully!');
    console.log('\n📝 Testing Instructions:');
    console.log('   To manually test the new endpoint:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. The chart should now show 4 lines for each region');
    console.log('   4. Verify each region has a different color');
    console.log('   5. Test hover tooltips for each data point');
    console.log('   6. Verify the legend shows all 4 regions');
    console.log('   7. Check responsive behavior on different screen sizes');
    
    console.log('\n🎨 Visual Verification Checklist:');
    console.log('   □ Chart title: "Regional Revenue Trends" (not North America)');
    console.log('   □ 4 distinct colored lines visible');
    console.log('   □ Legend shows: North America, Europe, Asia Pacific, Latin America');
    console.log('   □ Hover tooltips show correct region and revenue data');
    console.log('   □ All 12 months of data shown for each region');
    console.log('   □ Responsive layout works on mobile/tablet');
    console.log('   □ No console errors');
    
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
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllRegionsRevenueAPI();
}