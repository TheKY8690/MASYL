import type { CafeCardData } from '../CafeCard/CafeCard';
import {
  panel,
  mapPlaceholder,
  roadH,
  roadV,
  radiusCircle,
  userMarker,
  priceMarker,
  hotChip,
  locationBtn,
  selectedPanel,
  selectedName,
  selectedMeta,
  selectedPrice,
  bestCatchBadge,
  catchBtn,
} from './MapPanel.css';

interface MapMarker {
  cafeId: string;
  name: string;
  price: number;
  x: number;
  y: number;
  hot?: boolean;
}

const MOCK_MARKERS: MapMarker[] = [
  { cafeId: '1', name: '메가커피', price: 1000, x: 38, y: 42, hot: true },
  { cafeId: '2', name: '컴포즈커피', price: 1200, x: 62, y: 30 },
  { cafeId: '3', name: '빽다방', price: 900, x: 58, y: 65 },
];

const ROADS_H = [20, 40, 55, 70, 85];
const ROADS_V = [20, 35, 50, 65, 80];

interface MapPanelProps {
  selectedCafe?: CafeCardData | null;
  onSelectCafe?: (cafeId: string) => void;
}

export function MapPanel({ selectedCafe, onSelectCafe }: MapPanelProps) {
  return (
    <div className={panel}>
      <div className={mapPlaceholder}>
        {ROADS_H.map((top) => (
          <div key={top} className={roadH} style={{ top: `${top}%` }} />
        ))}
        {ROADS_V.map((left) => (
          <div key={left} className={roadV} style={{ left: `${left}%` }} />
        ))}

        <div className={radiusCircle} />
        <div className={userMarker}>👤</div>

        {MOCK_MARKERS.map((marker) => (
          <button
            key={marker.cafeId}
            className={priceMarker}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            onClick={() => onSelectCafe?.(marker.cafeId)}
          >
            {marker.hot && <span className={hotChip}>HOT</span>}
            {marker.price.toLocaleString()}원
          </button>
        ))}

        <button className={locationBtn} title="내 위치">
          ⊕
        </button>
      </div>

      {selectedCafe && (
        <div className={selectedPanel}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: selectedCafe.logoColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {selectedCafe.name.slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={selectedName}>{selectedCafe.name}</div>
            <div className={selectedMeta}>
              {selectedCafe.distance}m · 도보{' '}
              {Math.ceil(selectedCafe.distance / 80)}분
            </div>
            <div className={selectedPrice}>
              {selectedCafe.item} {selectedCafe.priceValue.toLocaleString()}원{' '}
              <span
                style={{
                  fontSize: 12,
                  color: '#999',
                  textDecoration: 'line-through',
                }}
              >
                {selectedCafe.originalPriceValue.toLocaleString()}원
              </span>
            </div>
          </div>
          <span className={bestCatchBadge}>BEST CATCH</span>
          <button className={catchBtn}>잡기</button>
        </div>
      )}
    </div>
  );
}
