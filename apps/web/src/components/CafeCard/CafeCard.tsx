import {
  card,
  cardSelected,
  cardHeader,
  cafeInfo,
  logoBox,
  cafeName,
  cafeDistance,
  badge,
  badgeActive,
  badgeQuick,
  badgeHot,
  badgeBest,
  discountRow,
  discountInfo,
  itemName,
  priceRow,
  price,
  originalPrice,
  ctaBtn,
} from './CafeCard.css';

export type CafeBadge = 'active' | 'quick' | 'hot' | 'best';

export interface CafeCardData {
  id: string;
  name: string;
  distance: number;
  item: string;
  priceValue: number;
  originalPriceValue: number;
  badge: CafeBadge;
  logoColor: string;
}

interface CafeCardProps {
  data: CafeCardData;
  selected?: boolean;
  onClick?: () => void;
}

const BADGE_LABEL: Record<CafeBadge, string> = {
  active: '캐치 활성',
  quick: 'QUICK',
  hot: 'HOT',
  best: 'BEST CATCH',
};

const BADGE_STYLE: Record<CafeBadge, string> = {
  active: badgeActive,
  quick: badgeQuick,
  hot: badgeHot,
  best: badgeBest,
};

export function CafeCard({ data, selected, onClick }: CafeCardProps) {
  return (
    <div
      className={`${card}${selected ? ` ${cardSelected}` : ''}`}
      onClick={onClick}
    >
      <div className={cardHeader}>
        <div className={cafeInfo}>
          <div className={logoBox} style={{ backgroundColor: data.logoColor }}>
            {data.name.slice(0, 2)}
          </div>
          <div>
            <div className={cafeName}>{data.name}</div>
            <div className={cafeDistance}>
              <span>↗</span>
              {data.distance}m 거리
            </div>
          </div>
        </div>
        <span className={`${badge} ${BADGE_STYLE[data.badge]}`}>
          {BADGE_LABEL[data.badge]}
        </span>
      </div>

      <div className={discountRow}>
        <div className={discountInfo}>
          <span className={itemName}>{data.item}</span>
          <div className={priceRow}>
            <span className={price}>{data.priceValue.toLocaleString()}원</span>
            <span className={originalPrice}>
              {data.originalPriceValue.toLocaleString()}원
            </span>
          </div>
        </div>
        <button className={ctaBtn}>캐치 할인 예약</button>
      </div>
    </div>
  );
}
