'use client';

import { useState } from 'react';
import { Toast } from '../Toast/Toast';
import {
  gnb,
  logo,
  logoAccent,
  nav,
  navItem,
  navItemActive,
  right,
  locationChip,
  locationDot,
  profileBtn,
} from './GNB.css';

const NAV_ITEMS = [
  { label: '홈', active: true },
  { label: '지도', active: false },
  { label: '혜택', active: false },
  { label: '마이', active: false },
];

export function GNB() {
  const [showToast, setShowToast] = useState(false);

  const handleComingSoon = () => {
    if (showToast) return;
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <header className={gnb}>
        <span className={logo}>
          마<span className={logoAccent}>실</span>
        </span>

        <nav className={nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`${navItem}${item.active ? ` ${navItemActive}` : ''}`}
              onClick={item.active ? undefined : handleComingSoon}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={right}>
          <button className={locationChip}>
            <span className={locationDot} />
            서울시 강남구
          </button>
          <button className={profileBtn}>Z</button>
        </div>
      </header>

      {showToast && <Toast message="추후 개발 예정입니다 🚧" />}
    </>
  );
}
