import {
  header,
  hamburger,
  title,
  titleAccent,
  profileBtn,
} from './MobileHeader.css';

interface MobileHeaderProps {
  pageTitle?: string;
  isMapView?: boolean;
}

export function MobileHeader({ pageTitle, isMapView }: MobileHeaderProps) {
  return (
    <div className={header}>
      <button className={hamburger}>≡</button>
      <span className={title}>
        {isMapView ? (
          (pageTitle ?? '지도')
        ) : (
          <>
            마<span className={titleAccent}>실</span>
          </>
        )}
      </span>
      <button className={profileBtn}>Z</button>
    </div>
  );
}
