import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    bg: '#F0EDE8',
    surface: '#FFFFFF',
    primary: '#1A1A2E',
    secondary: '#4A4A6A',
    muted: '#8A8A9A',
    border: '#E5E2DC',
    cta: '#4A3728',
    ctaHover: '#3A2A1E',
    badgeHot: '#E74C3C',
    badgeActive: '#27AE60',
    badgeQuick: '#95A5A6',
    badgeBest: '#C8A84B',
    mapBg: '#D8E4D0',
    accent: '#C8A84B',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    card: '16px',
    lg: '20px',
    pill: '999px',
  },
  font: {
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shadow: {
    card: '0 2px 12px rgba(0, 0, 0, 0.06)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
    gnb: '0 1px 0 rgba(0, 0, 0, 0.08)',
    toast: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
});
