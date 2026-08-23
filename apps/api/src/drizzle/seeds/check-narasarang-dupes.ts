import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const result = await db.execute(sql`
  SELECT id, brand_id, title, status, created_at
  FROM discounts
  WHERE lower(trim(title)) LIKE '%나라사랑%'
  ORDER BY brand_id, title, created_at ASC
`);
console.log(JSON.stringify(result.rows, null, 2));
await pool.end();
