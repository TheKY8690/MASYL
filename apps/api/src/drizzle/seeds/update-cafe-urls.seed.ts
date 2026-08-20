/**
 * 브랜드 카페 websiteUrl 업데이트 스크립트
 * 실행: DATABASE_URL=... node_modules/.bin/jiti src/drizzle/seeds/update-cafe-urls.seed.ts
 *
 * 검증일: 2026-08-20
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';

const UPDATES: { name: string; websiteUrl: string | null }[] = [
  {
    name: '메가MGC커피',
    websiteUrl:
      'https://www.megacoffee.co.kr/board/event_list_zone.php?page=1&bdId=eventgallery2',
  },
  { name: '컴포즈커피', websiteUrl: 'https://composecoffee.com/event' },
  { name: '빽다방', websiteUrl: 'https://paikdabang.com/news/?cate=event' },
  {
    name: '더벤티',
    websiteUrl: 'https://www.theventi.co.kr/new2022/news/event.html',
  },
  {
    name: '이디야커피',
    websiteUrl: 'https://www.ediya.com/contents/notice.html',
  },
  { name: '커피베이', websiteUrl: 'https://www.coffeebay.com/news/event' },
  {
    name: '요거프레소',
    websiteUrl: 'https://www.yogerpresso.co.kr/community/event.html',
  },
  { name: '달콤커피', websiteUrl: 'https://dalkomm.com/notice' },
  {
    name: '매머드커피',
    websiteUrl: 'https://mmthcoffee.com/sub/event/list.html',
  },
  { name: '탐앤탐스', websiteUrl: 'https://www.tomntoms.com/event' },
  {
    name: '카페베네',
    websiteUrl:
      'http://www.caffebene.co.kr/contents/content_list.html?code=013005',
  },
  { name: '할리스', websiteUrl: 'https://www.hollys.co.kr/news/event/list.do' },
  {
    name: '스타벅스',
    websiteUrl: 'https://www.starbucks.co.kr/whats_new/campaign_list.do',
  },
  // 제거: 드롭탑, 투썸플레이스
  { name: '드롭탑', websiteUrl: null },
  { name: '투썸플레이스', websiteUrl: null },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  for (const { name, websiteUrl } of UPDATES) {
    const result = await db
      .update(schema.cafes)
      .set({ websiteUrl })
      .where(eq(schema.cafes.name, name))
      .returning({ id: schema.cafes.id });

    if (result.length) {
      console.log(`  ✓ ${name} → ${websiteUrl ?? 'null'}`);
    } else {
      console.log(`  ✗ ${name} (not found in DB)`);
    }
  }

  await pool.end();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
