import {
  container,
  roadH,
  roadV,
  radiusCircle,
  userMarker,
  priceMarker,
  hotChip,
  overlay,
  overlayHint,
} from './MiniMap.css';

const ROADS_H = [25, 50, 75];
const ROADS_V = [25, 50, 75];

const MARKERS = [
  { id: '1', price: 1000, x: 35, y: 40, hot: true },
  { id: '2', price: 1200, x: 63, y: 28 },
  { id: '3', price: 900, x: 57, y: 65 },
];

interface MiniMapProps {
  onSelectCafe?: (cafeId: string) => void;
}

export function MiniMap({ onSelectCafe }: MiniMapProps) {
  return (
    <div className={container}>
      {ROADS_H.map((top) => (
        <div key={top} className={roadH} style={{ top: `${top}%` }} />
      ))}
      {ROADS_V.map((left) => (
        <div key={left} className={roadV} style={{ left: `${left}%` }} />
      ))}

      <div className={radiusCircle} />
      <div className={userMarker}>👤</div>

      {MARKERS.map((m) => (
        <button
          key={m.id}
          className={priceMarker}
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
          onClick={() => onSelectCafe?.(m.id)}
        >
          {m.hot && <span className={hotChip}>HOT</span>}
          {m.price.toLocaleString()}원
        </button>
      ))}

      <div className={overlay}>
        <span className={overlayHint}>지도에서 더 보기 →</span>
      </div>
    </div>
  );
}
