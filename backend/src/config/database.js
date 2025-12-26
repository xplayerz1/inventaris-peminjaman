// PostgreSQL connection pools for both databases
const { Pool } = require('pg');
require('dotenv').config();

const authPool = new Pool({
  host: process.env.AUTH_DB_HOST || 'localhost',
  port: process.env.AUTH_DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.AUTH_DB_NAME || 'auth_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const inventoryPool = new Pool({
  host: process.env.INVENTORY_DB_HOST || 'localhost',
  port: process.env.INVENTORY_DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.INVENTORY_DB_NAME || 'inventory_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

authPool.on('connect', () => {
  console.log('✅ Connected to auth_db');
});

inventoryPool.on('connect', () => {
  console.log('✅ Connected to inventory_db');
});

authPool.on('error', (err) => {
  console.error('❌ Auth DB error:', err);
});

inventoryPool.on('error', (err) => {
  console.error('❌ Inventory DB error:', err);
});

module.exports = {
  authPool,
  inventoryPool,
};
