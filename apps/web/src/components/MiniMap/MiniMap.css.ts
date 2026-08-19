import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const container = style({
  height: '200px',
  borderRadius: vars.radius.card,
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  flexShrink: 0,
  boxShadow: vars.shadow.card,
});

export const mapContainer = style({
  width: '100%',
  height: '100%',
});

export const overlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-end',
  padding: vars.space.sm,
  background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 50%)',
  pointerEvents: 'none',
});

export const overlayHint = style({
  fontSize: '12px',
  color: vars.color.surface,
  fontWeight: '600',
  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
});
