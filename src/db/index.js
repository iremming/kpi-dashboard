/**
 * Database module - main entry point for database operations
 */

export { connectDb, getDbClient, query } from './connection.js';
export { createTables, isTableEmpty } from './schema.js';
export { generateAllMockData, generateMonthlyMetrics, generateRevenueByRegion } from './mockData.js';