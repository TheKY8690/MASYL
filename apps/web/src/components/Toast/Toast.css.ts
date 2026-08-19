import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const fadeInDown = keyframes({
  from: { opacity: 0, transform: 'translateY(-12px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const toast = style({
  position: 'fixed',
  top: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 200,
  padding: `${vars.space.sm} ${vars.space.lg}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.primary,
  color: vars.color.surface,
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: vars.shadow.toast,
  animation: `${fadeInDown} 200ms ease`,
  whiteSpace: 'nowrap',
});
