/**
 * 중복 할인 제거 스크립트
 * 실행: DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-) node_modules/.bin/jiti src/drizzle/seeds/dedup-discounts.seed.ts
 *
 * brandId + title(소문자 trim) 기준 중복 제거. 가장 오래된 레코드(created_at 최소) 보존.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { sql } from 'drizzle-orm';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  // 중복 그룹 조회: brandId + lower(trim(title)) 기준
  const dupes = await db.execute<{
    brand_id: string;
    normalized_title: string;
    ids: string[];
    keep_id: string;
  }>(sql`
    SELECT
      brand_id,
      lower(trim(title)) AS normalized_title,
      array_agg(id ORDER BY created_at ASC) AS ids,
      (array_agg(id ORDER BY created_at ASC))[1] AS keep_id
    FROM discounts
    WHERE brand_id IS NOT NULL
    GROUP BY brand_id, lower(trim(title))
    HAVING count(*) > 1
  `);

  const rows = dupes.rows;

  if (rows.length === 0) {
    console.log('중복 없음.');
    await pool.end();
    return;
  }

  console.log(`중복 그룹 ${rows.length}개 발견.`);

  let totalDeleted = 0;
  for (const row of rows) {
    const deleteIds = row.ids.slice(1); // keep_id(첫번째) 제외
    const placeholders = deleteIds
      .map((_: string, i: number) => `$${i + 1}`)
      .join(', ');
    // FK 참조 해제 후 삭제
    await pool.query(
      `UPDATE crawled_events SET discount_id = NULL WHERE discount_id IN (${placeholders})`,
      deleteIds,
    );
    await pool.query(
      `DELETE FROM discounts WHERE id IN (${placeholders})`,
      deleteIds,
    );
    console.log(
      `브랜드=${row.brand_id} 제목="${row.normalized_title}" → ${deleteIds.length}개 삭제 (보존: ${row.keep_id})`,
    );
    totalDeleted += deleteIds.length;
  }

  console.log(`\n총 ${totalDeleted}개 중복 레코드 삭제 완료.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
