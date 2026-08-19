import { bar, left, pin, locationText, changeBtn } from './LocationBar.css';

interface LocationBarProps {
  location: string;
}

export function LocationBar({ location }: LocationBarProps) {
  return (
    <div className={bar}>
      <div className={left}>
        <span className={pin}>📍</span>
        <span className={locationText}>{location}</span>
      </div>
      <button className={changeBtn}>변경</button>
    </div>
  );
}
