const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DB_STRING });
async function run() {
  const res = await pool.query('SELECT * FROM "ProductImage"');
  console.log(res.rows);
  pool.end();
}
run().catch(console.error);
