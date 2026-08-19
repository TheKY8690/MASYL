'use client';

import { useState } from 'react';
import { Toast } from '../Toast/Toast';
import {
  nav,
  tabItem,
  tabItemActive,
  tabIcon,
  tabLabel,
} from './BottomNav.css';

type Tab = 'home' | 'map' | 'benefits' | 'my';

interface TabConfig {
  id: Tab;
  icon: string;
  label: string;
  implemented: boolean;
}

const TABS: TabConfig[] = [
  { id: 'home', icon: '⊞', label: '홈', implemented: true },
  { id: 'map', icon: '⊡', label: '지도', implemented: true },
  { id: 'benefits', icon: '◈', label: '혜택', implemented: false },
  { id: 'my', icon: '◉', label: '마이', implemented: false },
];

interface BottomNavProps {
  activeTab: 'home' | 'map';
  onTabChange: (tab: 'home' | 'map') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [showToast, setShowToast] = useState(false);

  const handleTab = (tab: TabConfig) => {
    if (!tab.implemented) {
      if (showToast) return;
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    if (tab.id === 'home' || tab.id === 'map') {
      onTabChange(tab.id);
    }
  };

  const isActive = (tab: TabConfig) =>
    (tab.id === 'home' || tab.id === 'map') && tab.id === activeTab;

  return (
    <>
      <nav className={nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${tabItem}${isActive(tab) ? ` ${tabItemActive}` : ''}`}
            onClick={() => handleTab(tab)}
          >
            <span className={tabIcon}>{tab.icon}</span>
            <span className={tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
      {showToast && <Toast message="추후 개발 예정입니다 🚧" />}
    </>
  );
}
