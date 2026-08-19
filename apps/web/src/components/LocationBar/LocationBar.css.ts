import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const bar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.sm} ${vars.space.md}`,
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.card,
  border: `1px solid ${vars.color.border}`,
  boxShadow: vars.shadow.card,
});

export const left = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
});

export const pin = style({
  fontSize: '16px',
});

export const locationText = style({
  fontSize: '15px',
  fontWeight: '600',
  color: vars.color.primary,
});

export const changeBtn = style({
  fontSize: '13px',
  fontWeight: '500',
  color: vars.color.secondary,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  transition: 'background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.bg,
    },
  },
});
