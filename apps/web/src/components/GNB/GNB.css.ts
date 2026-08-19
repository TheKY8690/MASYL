import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const gnb = style({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '64px',
  padding: `0 ${vars.space.xl}`,
  backgroundColor: vars.color.surface,
  boxShadow: vars.shadow.gnb,
  '@media': {
    'screen and (max-width: 1023px)': {
      padding: `0 ${vars.space.lg}`,
    },
    'screen and (max-width: 767px)': {
      display: 'none',
    },
  },
});

export const logo = style({
  fontSize: '20px',
  fontWeight: '800',
  color: vars.color.primary,
  letterSpacing: '-0.5px',
  flexShrink: 0,
});

export const logoAccent = style({
  color: vars.color.accent,
});

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  '@media': {
    'screen and (max-width: 1023px)': {
      gap: '2px',
    },
  },
});

export const navItem = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.pill,
  fontSize: '14px',
  fontWeight: '500',
  color: vars.color.secondary,
  transition: 'all 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.bg,
      color: vars.color.primary,
    },
  },
});

export const navItemActive = style({
  backgroundColor: vars.color.primary,
  color: vars.color.surface,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.primary,
      color: vars.color.surface,
    },
  },
});

export const right = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  flexShrink: 0,
});

export const locationChip = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.xs} ${vars.space.md}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.bg,
  fontSize: '13px',
  fontWeight: '500',
  color: vars.color.primary,
  border: `1px solid ${vars.color.border}`,
  transition: 'all 150ms ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.primary,
    },
  },
});

export const locationDot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: vars.color.badgeActive,
  flexShrink: 0,
});

export const profileBtn = style({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: vars.color.primary,
  color: vars.color.surface,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '600',
  flexShrink: 0,
  transition: 'opacity 150ms ease',
  selectors: {
    '&:hover': {
      opacity: 0.85,
    },
  },
});
