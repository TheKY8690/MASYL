import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const main = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.md,
  background: vars.color.bg,
  padding: vars.space.lg,
});

export const title = style({
  margin: 0,
  fontSize: '28px',
  color: vars.color.accent,
});

export const sub = style({
  margin: `0 0 ${vars.space.md}`,
  color: vars.color.muted,
  fontSize: '14px',
});

export const google = style({
  width: '240px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: '12px 24px',
  background: vars.color.surface,
  color: vars.color.primary,
  fontWeight: 700,
  cursor: 'pointer',
});
