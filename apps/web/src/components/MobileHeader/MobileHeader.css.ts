import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const header = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px',
      padding: `0 ${vars.space.md}`,
      backgroundColor: vars.color.surface,
      boxShadow: vars.shadow.gnb,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
  },
});

export const hamburger = style({
  fontSize: '20px',
  color: vars.color.primary,
  padding: vars.space.sm,
  borderRadius: vars.radius.sm,
  transition: 'background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.bg,
    },
  },
});

export const title = style({
  fontSize: '18px',
  fontWeight: '800',
  color: vars.color.primary,
  letterSpacing: '-0.5px',
});

export const titleAccent = style({
  color: vars.color.accent,
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
  fontSize: '13px',
  fontWeight: '700',
  flexShrink: 0,
});
