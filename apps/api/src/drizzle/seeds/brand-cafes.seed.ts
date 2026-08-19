/**
 * 브랜드 카페 시드 스크립트
 * 실행: DATABASE_URL=... npx ts-node -r tsconfig-paths/register src/drizzle/seeds/brand-cafes.seed.ts
 *
 * websiteUrl은 best-effort — 실제 이벤트 URL이 다를 경우 admin이 DB에서 직접 수정
 * lat/lng는 브랜드 대표 본사 위치 (크롤링용 더미 좌표, 실제 매장 아님)
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';

const BRAND_CAFES: (typeof schema.cafes.$inferInsert)[] = [
  {
    name: '메가MGC커피',
    address: '서울특별시 강남구 테헤란로 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://www.megacoffee.net/event/list',
    isVerified: true,
  },
  {
    name: '컴포즈커피',
    address: '부산광역시 해운대구 센텀중앙로 (본사)',
    latitude: '35.1695',
    longitude: '129.1330',
    websiteUrl: 'https://composecoffee.com/board/event',
    isVerified: true,
  },
  {
    name: '빽다방',
    address: '서울특별시 강남구 영동대로 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://www.paik.com/paiksdabang/event',
    isVerified: true,
  },
  {
    name: '더벤티',
    address: '서울특별시 마포구 (본사)',
    latitude: '37.5560',
    longitude: '126.9089',
    websiteUrl: 'https://theventi.co.kr/event',
    isVerified: true,
  },
  {
    name: '이디야커피',
    address: '서울특별시 중구 을지로 (본사)',
    latitude: '37.5663',
    longitude: '126.9997',
    websiteUrl: 'https://www.ediya.com/event/eventList.do',
    isVerified: true,
  },
  {
    name: '커피베이',
    address: '충청남도 천안시 (본사)',
    latitude: '36.8151',
    longitude: '127.1139',
    websiteUrl: 'https://www.coffeebay.co.kr/event',
    isVerified: true,
  },
  {
    name: '요거프레소',
    address: '대구광역시 수성구 (본사)',
    latitude: '35.8592',
    longitude: '128.6344',
    websiteUrl: 'https://www.yogerpresso.com/event',
    isVerified: true,
  },
  {
    name: '달콤커피',
    address: '서울특별시 강남구 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://dalkomm.com/event',
    isVerified: true,
  },
  {
    name: '매머드커피',
    address: '서울특별시 마포구 (본사)',
    latitude: '37.5560',
    longitude: '126.9089',
    websiteUrl: 'https://mammothcoffee.co.kr/event',
    isVerified: true,
  },
  {
    name: '드롭탑',
    address: '경기도 성남시 분당구 (본사)',
    latitude: '37.3825',
    longitude: '127.1178',
    websiteUrl: 'https://www.droptop.co.kr/event',
    isVerified: true,
  },
  {
    name: '탐앤탐스',
    address: '서울특별시 강남구 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://www.tomntoms.com/event',
    isVerified: true,
  },
  {
    name: '카페베네',
    address: '서울특별시 강남구 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://www.caffebene.co.kr/event',
    isVerified: true,
  },
  {
    name: '할리스',
    address: '서울특별시 중구 을지로 (본사)',
    latitude: '37.5663',
    longitude: '126.9997',
    websiteUrl: 'https://www.hollys.co.kr/event',
    isVerified: true,
  },
  {
    name: '투썸플레이스',
    address: '서울특별시 강남구 테헤란로 (본사)',
    latitude: '37.5172',
    longitude: '127.0473',
    websiteUrl: 'https://www.twosomeplace.co.kr/event',
    isVerified: true,
  },
  {
    name: '스타벅스',
    address: '서울특별시 중구 을지로 (본사)',
    latitude: '37.5663',
    longitude: '126.9997',
    websiteUrl: 'https://www.starbucks.co.kr/whats_new/eventList.do',
    isVerified: true,
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log(`Seeding ${BRAND_CAFES.length} brand cafes...`);
  for (const cafe of BRAND_CAFES) {
    await db.insert(schema.cafes).values(cafe).onConflictDoNothing();
    console.log(`  ✓ ${cafe.name}`);
  }

  await pool.end();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
