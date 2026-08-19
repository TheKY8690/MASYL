import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const container = style({
  height: '200px',
  borderRadius: vars.radius.card,
  overflow: 'hidden',
  position: 'relative',
  background: 'linear-gradient(135deg, #D4E8C8 0%, #C8DEBA 50%, #BDD4B0 100%)',
  cursor: 'pointer',
  flexShrink: 0,
  boxShadow: vars.shadow.card,
});

export const roadH = style({
  position: 'absolute',
  height: '1.5px',
  backgroundColor: 'rgba(255,255,255,0.5)',
  left: 0,
  right: 0,
});

export const roadV = style({
  position: 'absolute',
  width: '1.5px',
  backgroundColor: 'rgba(255,255,255,0.5)',
  top: 0,
  bottom: 0,
});

export const radiusCircle = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  backgroundColor: 'rgba(45, 90, 70, 0.12)',
  border: '1.5px solid rgba(45, 90, 70, 0.25)',
});

export const userMarker = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: vars.color.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.surface,
  fontSize: '14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  zIndex: 10,
});

export const priceMarker = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: `4px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.surface,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  fontSize: '12px',
  fontWeight: '700',
  color: vars.color.primary,
  zIndex: 5,
});

export const hotChip = style({
  padding: '1px 4px',
  borderRadius: vars.radius.pill,
  backgroundColor: '#E74C3C',
  color: vars.color.surface,
  fontSize: '9px',
  fontWeight: '700',
});

export const overlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-end',
  padding: vars.space.sm,
  background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 40%)',
});

export const overlayHint = style({
  fontSize: '12px',
  color: vars.color.surface,
  fontWeight: '600',
  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
});
