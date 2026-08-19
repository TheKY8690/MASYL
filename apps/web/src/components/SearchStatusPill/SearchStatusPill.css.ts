import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const pill = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: `${vars.space.xs} ${vars.space.md}`,
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.pill,
  fontSize: '13px',
  color: vars.color.secondary,
  border: `1px solid ${vars.color.border}`,
  alignSelf: 'flex-start',
});

export const dot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: vars.color.badgeActive,
  animation: `${pulse} 1.5s ease-in-out infinite`,
  flexShrink: 0,
});
