import type { DiscountGroup } from '../lib/groupDiscounts';

export function DiscountList({
  groups,
  selectedId,
  onSelect,
}: {
  groups: DiscountGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (groups.length === 0) {
    return <p className="empty">할인이 존재하지 않습니다.</p>;
  }

  return (
    <ul className="card-list">
      {groups.map((group) => (
        <li key={group.key} className="card">
          <div className="card-head">
            <strong>{group.displayName}</strong>
            {group.distance != null && (
              <span className="badge">
                {group.distance < 1000
                  ? `${group.distance}m`
                  : `${(group.distance / 1000).toFixed(1)}km`}
              </span>
            )}
          </div>
          {group.discounts.map((d) => (
            <button
              key={d.id}
              type="button"
              className={
                d.id === selectedId ? 'discount-row selected' : 'discount-row'
              }
              onClick={() => onSelect(d.id)}
            >
              <span className="discount-title">{d.title}</span>
              <span className="value">{d.discountValue}</span>
            </button>
          ))}
        </li>
      ))}
    </ul>
  );
}
