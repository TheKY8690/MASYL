'use client';

import {
  nav,
  tabItem,
  tabItemActive,
  tabIcon,
  tabLabel,
} from './BottomNav.css';

export type Tab = 'home' | 'map' | 'benefits' | 'my';

interface TabConfig {
  id: Tab;
  icon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'home', icon: '⊞', label: '홈' },
  { id: 'map', icon: '⊡', label: '지도' },
  { id: 'benefits', icon: '◈', label: '혜택' },
  { id: 'my', icon: '◉', label: '마이' },
];

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className={nav}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${tabItem}${tab.id === activeTab ? ` ${tabItemActive}` : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={tabIcon}>{tab.icon}</span>
          <span className={tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
