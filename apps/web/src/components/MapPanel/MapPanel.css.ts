import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const panel = style({
  position: 'relative',
  flex: 1,
  backgroundColor: vars.color.mapBg,
  overflow: 'hidden',
});

export const mapPlaceholder = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'linear-gradient(135deg, #D4E8C8 0%, #C8DEBA 50%, #BDD4B0 100%)',
});

export const roadH = style({
  position: 'absolute',
  height: '2px',
  backgroundColor: 'rgba(255,255,255,0.5)',
  left: 0,
  right: 0,
});

export const roadV = style({
  position: 'absolute',
  width: '2px',
  backgroundColor: 'rgba(255,255,255,0.5)',
  top: 0,
  bottom: 0,
});

export const radiusCircle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '380px',
  height: '380px',
  borderRadius: '50%',
  backgroundColor: 'rgba(45, 90, 70, 0.12)',
  border: '1.5px solid rgba(45, 90, 70, 0.25)',
  '@media': {
    'screen and (max-width: 767px)': {
      width: '260px',
      height: '260px',
    },
  },
});

export const userMarker = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: vars.color.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.surface,
  fontSize: '18px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  zIndex: 10,
});

export const priceMarker = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: `6px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.surface,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  fontSize: '13px',
  fontWeight: '700',
  color: vars.color.primary,
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease',
  zIndex: 5,
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
  },
});

export const priceMarkerHot = style({
  backgroundColor: vars.color.badgeHot,
  color: vars.color.surface,
});

export const hotChip = style({
  padding: '2px 6px',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.badgeActive,
  color: vars.color.surface,
  fontSize: '10px',
  fontWeight: '700',
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
