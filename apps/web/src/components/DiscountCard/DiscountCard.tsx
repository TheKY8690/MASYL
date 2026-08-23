'use client';

import { useState } from 'react';
import type { NearbyDiscountItem } from '../../services/discount.service';
import {
  card,
  cardSelected,
  header,
  name,
  distanceBadge,
  chevron,
  discountRow,
  discountRowSelected,
  discountTitle,
  footer,
  valueBadge,
  linkBtn,
} from './DiscountCard.css';

export interface DiscountGroup {
  key: string;
  displayName: string;
  distance?: number;
  cafeLatitude?: string | null;
  cafeLongitude?: string | null;
  discounts: NearbyDiscountItem[];
}

interface Props {
  group: DiscountGroup;
  selectedDiscountId: string | null;
  onSelect: (id: string) => void;
}

export function DiscountCard({ group, selectedDiscountId, onSelect }: Props) {
  const isSingle = group.discounts.length === 1;
  const [isOpen, setIsOpen] = useState(false);
  const isGroupSelected = group.discounts.some(
    (d) => d.id === selectedDiscountId,
  );
  const listVisible = isSingle || isOpen || isGroupSelected;

  return (
    <div className={`${card}${isGroupSelected ? ` ${cardSelected}` : ''}`}>
      <div
        className={header}
        onClick={() =>
          isSingle
            ? onSelect(group.discounts[0].id)
            : setIsOpen((prev) => !prev)
        }
        role="button"
        style={{ cursor: 'pointer' }}
      >
        <span className={name}>{group.displayName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {group.distance != null && (
            <span className={distanceBadge}>
              {group.distance < 1000
                ? `${group.distance}m`
                : `${(group.distance / 1000).toFixed(1)}km`}
            </span>
          )}
          {!isSingle && (
            <span className={chevron}>{listVisible ? '▲' : '▼'}</span>
          )}
        </div>
      </div>
      {listVisible &&
        group.discounts.map((d) => (
          <div
            key={d.id}
            className={`${discountRow}${d.id === selectedDiscountId ? ` ${discountRowSelected}` : ''}`}
            onClick={() => onSelect(d.id)}
            role="button"
          >
            <div className={discountTitle}>{d.title}</div>
            <div className={footer}>
              <span className={valueBadge}>{d.discountValue}</span>
              {d.eventUrl && (
                <a
                  className={linkBtn}
                  href={d.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  자세히 보기 →
                </a>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
