import { query } from './connection.js';

/**
 * Create the monthly_metrics table
 */
export async function createMonthlyMetricsTable() {
  const createTableQuery = `
    DROP TABLE IF EXISTS monthly_metrics;
    CREATE TABLE monthly_metrics (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      mrr DECIMAL(12, 2) NOT NULL,
      churn_rate DECIMAL(5, 2) NOT NULL,
      active_users INTEGER NOT NULL,
      new_signups INTEGER NOT NULL
    );
  `;
  
  await query(createTableQuery);
}

/**
 * Create the revenue_by_region table
 */
export async function createRevenueByRegionTable() {
  const createTableQuery = `
    DROP TABLE IF EXISTS revenue_by_region;
    CREATE TABLE revenue_by_region (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      region TEXT NOT NULL,
      revenue DECIMAL(12, 2) NOT NULL
    );
  `;
  
  await query(createTableQuery);
}

/**
 * Create all database tables
 */
export async function createTables() {
  try {
    console.log('Creating monthly_metrics table...');
    await createMonthlyMetricsTable();
    
    console.log('Creating revenue_by_region table...');
    await createRevenueByRegionTable();
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

/**
 * Check if a table exists and is empty
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} True if table is empty or doesn't exist
 */
export async function isTableEmpty(tableName) {
  try {
    const result = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    // Table doesn't exist
    return true;
  }
}