/**
 * 브랜드 카페 websiteUrl 업데이트 스크립트
 * 실행: DATABASE_URL=... node_modules/.bin/jiti src/drizzle/seeds/update-cafe-urls.seed.ts
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

const URL_UPDATES: { name: string; websiteUrl: string }[] = [
  { name: '메가MGC커피', websiteUrl: 'https://www.mega-mgccoffee.com/' },
  { name: '컴포즈커피', websiteUrl: 'https://composecoffee.com/' },
  { name: '빽다방', websiteUrl: 'https://paikdabang.com/' },
  { name: '더벤티', websiteUrl: 'https://theventi.co.kr/' },
  { name: '이디야커피', websiteUrl: 'https://www.ediya.com/' },
  { name: '커피베이', websiteUrl: 'https://www.coffeebay.com/' },
  { name: '요거프레소', websiteUrl: 'https://yogerpresso.com/' },
  { name: '달콤커피', websiteUrl: 'https://dalkomm.com/' },
  { name: '매머드커피', websiteUrl: 'https://mmthcoffee.com/' },
  { name: '드롭탑', websiteUrl: 'https://cafedroptop.com/' },
  { name: '탐앤탐스', websiteUrl: 'https://www.tomntoms.com/' },
  { name: '카페베네', websiteUrl: 'http://www.caffebene.co.kr/' },
  { name: '할리스', websiteUrl: 'https://www.hollys.co.kr/' },
  { name: '투썸플레이스', websiteUrl: 'https://www.twosomeplace.co.kr/' },
  { name: '스타벅스', websiteUrl: 'https://www.starbucks.co.kr/' },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Updating cafe websiteUrls...');
  for (const { name, websiteUrl } of URL_UPDATES) {
    const result = await db
      .update(schema.cafes)
      .set({ websiteUrl })
      .where(eq(schema.cafes.name, name));
    console.log(`  ✓ ${name} → ${websiteUrl}`);
  }

  await pool.end();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
