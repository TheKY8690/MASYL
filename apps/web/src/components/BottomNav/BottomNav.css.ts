import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const nav = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 767px)': {
      display: 'flex',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: vars.color.surface,
      boxShadow: '0 -1px 0 rgba(0,0,0,0.08)',
      zIndex: 100,
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: `0 ${vars.space.sm}`,
    },
  },
});

export const tabItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  padding: `${vars.space.xs} ${vars.space.md}`,
  borderRadius: vars.radius.pill,
  color: vars.color.muted,
  fontSize: '11px',
  fontWeight: '500',
  minWidth: '60px',
  transition: 'all 150ms ease',
});

export const tabItemActive = style({
  backgroundColor: vars.color.accent,
  color: vars.color.surface,
});

export const tabIcon = style({
  fontSize: '20px',
  lineHeight: 1,
});

export const tabLabel = style({
  fontSize: '11px',
  fontWeight: '600',
});
