import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
});

export const label = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  fontSize: '13px',
  fontWeight: 600,
  color: vars.color.secondary,
});

export const select = style({
  padding: vars.space.sm,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const textarea = style({
  padding: vars.space.sm,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  fontFamily: 'inherit',
});

export const submit = style({
  border: 'none',
  borderRadius: vars.radius.md,
  padding: `${vars.space.sm} ${vars.space.md}`,
  background: vars.color.cta,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
});
