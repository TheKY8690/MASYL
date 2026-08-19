import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const layout = style({
  display: 'flex',
  height: 'calc(100vh - 64px)',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'none',
    },
  },
});

export const leftPanel = style({
  width: '420px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.lg,
  overflowY: 'auto',
  backgroundColor: vars.color.bg,
  '@media': {
    'screen and (max-width: 1023px)': {
      width: '320px',
    },
  },
});

export const mobileHomeView = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: vars.space.md,
      padding: vars.space.md,
      overflowY: 'auto',
      backgroundColor: vars.color.bg,
      minHeight: 'calc(100vh - 56px)',
      paddingBottom: '80px',
    },
  },
});

export const mobileMapView = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      position: 'relative',
    },
  },
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const sectionTitle = style({
  fontSize: '18px',
  fontWeight: '800',
  color: vars.color.primary,
});

export const sectionSub = style({
  fontSize: '13px',
  color: vars.color.muted,
  marginTop: '2px',
});

export const filterBtn = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.xs} ${vars.space.md}`,
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  fontSize: '13px',
  fontWeight: '500',
  color: vars.color.secondary,
  transition: 'all 150ms ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.primary,
      color: vars.color.primary,
    },
  },
});

export const cardList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
});
