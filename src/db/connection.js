import { Client } from 'pg';

/**
 * Get a database client connection using DATABASE_URL environment variable
 * @returns {Client} PostgreSQL client instance
 */
export function getDbClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  return client;
}

/**
 * Create and connect to database client
 * @returns {Promise<Client>} Connected PostgreSQL client
 */
export async function connectDb() {
  const client = getDbClient();
  await client.connect();
  return client;
}

/**
 * Execute a query with automatic connection management
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export async function query(query, params = []) {
  const client = await connectDb();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    await client.end();
  }
}