import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const card = style({
  backgroundColor: vars.color.surface,
  borderRadius: vars.radius.card,
  padding: vars.space.lg,
  boxShadow: vars.shadow.card,
  border: `1px solid ${vars.color.border}`,
  cursor: 'pointer',
  transition: 'transform 200ms ease, box-shadow 200ms ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: vars.shadow.cardHover,
    },
  },
});

export const cardSelected = style({
  border: `2px solid ${vars.color.primary}`,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.sm,
});

export const name = style({
  fontSize: '15px',
  fontWeight: '700',
  color: vars.color.primary,
});

export const distanceBadge = style({
  fontSize: '12px',
  color: vars.color.muted,
  backgroundColor: vars.color.bg,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
  flexShrink: 0,
});

export const discountRow = style({
  padding: `${vars.space.sm} 0`,
  cursor: 'pointer',
  borderTop: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  selectors: {
    '&:hover': { backgroundColor: vars.color.bg },
  },
});

export const discountRowSelected = style({
  backgroundColor: vars.color.bg,
});

export const discountTitle = style({
  fontSize: '14px',
  color: vars.color.secondary,
  marginBottom: vars.space.sm,
  lineHeight: '1.4',
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.sm,
  flexWrap: 'wrap',
});

export const valueBadge = style({
  fontSize: '13px',
  fontWeight: '700',
  color: vars.color.surface,
  backgroundColor: vars.color.accent,
  padding: `3px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
});

export const chevron = style({
  fontSize: '11px',
  color: vars.color.muted,
  flexShrink: 0,
});

export const linkBtn = style({
  fontSize: '13px',
  fontWeight: '600',
  color: vars.color.cta,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});
