import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.md,
  paddingBottom: '80px',
});

export const heading = style({
  margin: 0,
  fontSize: '18px',
});

export const ghost = style({
  alignSelf: 'flex-start',
  background: 'transparent',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: `${vars.space.xs} ${vars.space.md}`,
  cursor: 'pointer',
});
