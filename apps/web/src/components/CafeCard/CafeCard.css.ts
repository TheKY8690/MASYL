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

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.md,
});

export const cafeInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
});

export const logoBox = style({
  width: '48px',
  height: '48px',
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: '700',
  color: vars.color.surface,
  flexShrink: 0,
  overflow: 'hidden',
});

export const cafeName = style({
  fontSize: '16px',
  fontWeight: '700',
  color: vars.color.primary,
  marginBottom: '2px',
});

export const cafeDistance = style({
  fontSize: '13px',
  color: vars.color.muted,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const badge = style({
  padding: `3px ${vars.space.sm}`,
  borderRadius: vars.radius.pill,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.3px',
});

export const badgeActive = style({
  backgroundColor: '#E8F8EF',
  color: vars.color.badgeActive,
});

export const badgeQuick = style({
  backgroundColor: '#F2F2F2',
  color: vars.color.badgeQuick,
});

export const badgeHot = style({
  backgroundColor: '#FEF0EE',
  color: vars.color.badgeHot,
});

export const badgeBest = style({
  backgroundColor: '#FDF6E3',
  color: vars.color.badgeBest,
});

export const discountRow = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  padding: `${vars.space.md} ${vars.space.md}`,
  backgroundColor: vars.color.bg,
  borderRadius: vars.radius.md,
  gap: vars.space.md,
  '@media': {
    'screen and (max-width: 400px)': {
      flexWrap: 'wrap',
    },
  },
});

export const discountInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const itemName = style({
  fontSize: '13px',
  color: vars.color.secondary,
});

export const priceRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
});

export const price = style({
  fontSize: '22px',
  fontWeight: '800',
  color: vars.color.primary,
  letterSpacing: '-0.5px',
  '@media': {
    'screen and (max-width: 767px)': {
      fontSize: '18px',
    },
  },
});

export const originalPrice = style({
  fontSize: '13px',
  color: vars.color.muted,
  textDecoration: 'line-through',
});

export const ctaBtn = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.cta,
  color: vars.color.surface,
  fontSize: '13px',
  fontWeight: '700',
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms ease, transform 100ms ease',
  flexShrink: 0,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.ctaHover,
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
  },
});
