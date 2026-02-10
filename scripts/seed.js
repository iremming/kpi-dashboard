import { connectDb } from '../src/db/connection.js';
import { createTables, isTableEmpty } from '../src/db/schema.js';
import { generateAllMockData } from '../src/db/mockData.js';

/**
 * Insert monthly metrics data into the database
 * @param {Client} client - Database client
 * @param {Array} data - Monthly metrics data
 */
async function insertMonthlyMetrics(client, data) {
  const insertQuery = `
    INSERT INTO monthly_metrics (date, mrr, churn_rate, active_users, new_signups)
    VALUES ($1, $2, $3, $4, $5)
  `;
  
  for (const record of data) {
    await client.query(insertQuery, [
      record.date,
      record.mrr,
      record.churn_rate,
      record.active_users,
      record.new_signups
    ]);
  }
}

/**
 * Insert revenue by region data into the database
 * @param {Client} client - Database client
 * @param {Array} data - Revenue by region data
 */
async function insertRevenueByRegion(client, data) {
  const insertQuery = `
    INSERT INTO revenue_by_region (date, region, revenue)
    VALUES ($1, $2, $3)
  `;
  
  for (const record of data) {
    await client.query(insertQuery, [
      record.date,
      record.region,
      record.revenue
    ]);
  }
}

/**
 * Main seed function - idempotent database seeding
 */
async function seed() {
  let client;
  
  try {
    console.log('Connecting to database...');
    client = await connectDb();
    
    // Create tables (will drop existing ones)
    await createTables();
    
    // Check if tables are empty (they should be after creation)
    const monthlyMetricsEmpty = await isTableEmpty('monthly_metrics');
    const revenueByRegionEmpty = await isTableEmpty('revenue_by_region');
    
    if (!monthlyMetricsEmpty && !revenueByRegionEmpty) {
      console.log('Tables already contain data. Skipping seed.');
      return;
    }
    
    console.log('Generating mock data...');
    const mockData = generateAllMockData();
    
    console.log('Seeding monthly_metrics table...');
    await insertMonthlyMetrics(client, mockData.monthlyMetrics);
    console.log(`Inserted ${mockData.monthlyMetrics.length} monthly metrics records`);
    
    console.log('Seeding revenue_by_region table...');
    await insertRevenueByRegion(client, mockData.revenueByRegion);
    console.log(`Inserted ${mockData.revenueByRegion.length} revenue by region records`);
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Run the seed function
seed();