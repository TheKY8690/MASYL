import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const panel = style({
  position: 'relative',
  flex: 1,
  backgroundColor: vars.color.mapBg,
  overflow: 'hidden',
});

export const mapContainer = style({
  width: '100%',
  height: '100%',
});

export const locationBtn = style({
  position: 'absolute',
  bottom: vars.space.xl,
  right: vars.space.xl,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: vars.color.surface,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  transition: 'transform 150ms ease',
  zIndex: 10,
  selectors: {
    '&:hover': {
      transform: 'scale(1.08)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
});

export const selectedPanel = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: vars.color.surface,
  borderTopLeftRadius: vars.radius.lg,
  borderTopRightRadius: vars.radius.lg,
  padding: vars.space.lg,
  boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  zIndex: 20,
});

export const selectedName = style({
  fontSize: '15px',
  fontWeight: '700',
  color: vars.color.primary,
});

export const selectedMeta = style({
  fontSize: '13px',
  color: vars.color.muted,
  marginTop: '2px',
});

export const selectedPrice = style({
  fontSize: '15px',
  fontWeight: '800',
  color: vars.color.primary,
  marginTop: '4px',
});

export const bestCatchBadge = style({
  padding: `3px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.badgeBest,
  color: vars.color.surface,
  fontSize: '11px',
  fontWeight: '700',
  marginLeft: 'auto',
  flexShrink: 0,
});

export const catchBtn = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.cta,
  color: vars.color.surface,
  fontSize: '13px',
  fontWeight: '700',
  transition: 'background-color 150ms ease',
  flexShrink: 0,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.ctaHover,
    },
  },
});
