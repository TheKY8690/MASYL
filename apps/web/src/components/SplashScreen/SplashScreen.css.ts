import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const letterIn = keyframes({
  from: { opacity: 0, transform: 'translateY(16px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

// 위로 올라가며 사라짐
const titleFade = keyframes({
  '0%': { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
  '30%': { opacity: 0.6, filter: 'blur(1px)', transform: 'translateY(-20px)' },
  '100%': { opacity: 0, filter: 'blur(4px)', transform: 'translateY(-70px)' },
});

// 스트림: 중력 가속 느낌, 컵에 도달 후 더 오래 머물다 사라짐
const streamThrough = keyframes({
  '0%': { top: '-100%' },
  '35%': { top: '0%' },
  '65%': { top: '0%' },
  '100%': { top: '100%' },
});

// 컵 등장 (translateX(-50%) 포함 — cupWrapper의 left:50% 보정)
const cupAppear = keyframes({
  from: { opacity: 0, transform: 'translateX(-50%) translateY(6px)' },
  to: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
});

// 액체 채워짐
const liquidFill = keyframes({
  from: { height: '0%' },
  to: { height: '72%' },
});

const overlayFade = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  backgroundColor: vars.color.bg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 'calc(50vh - 235px)',
  overflow: 'hidden',
});

export const overlayExiting = style({
  animation: `${overlayFade} 500ms ease forwards`,
});

// 전체 씬: title만 in-flow, stream/cup은 absolute
export const scene = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const title = style({
  fontSize: '142px',
  fontWeight: '800',
  letterSpacing: '-4px',
  display: 'flex',
  gap: '4px',
});

export const titleShrinking = style({
  animation: `${titleFade} 600ms ease-in forwards`,
});

export const letterBase = style({
  display: 'inline-block',
  opacity: 0,
});

export const letterMa = style({
  color: vars.color.primary,
  animation: `${letterIn} 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  animationDelay: '0ms',
});

export const letterSil = style({
  color: vars.color.accent,
  animation: `${letterIn} 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  animationDelay: '200ms',
});

// 스트림 래퍼: title 아래 absolute (layout shift 없음)
export const streamWrapper = style({
  position: 'absolute',
  top: '170px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '120px',
  height: '140px',
  overflow: 'hidden',
  clipPath: "path('M 10,0 Q 50,80 54,140 L 66,140 Q 70,80 110,0 Z')",
});

// 스트림 fill: 위에서 아래로 흘러 컵 안으로
// 600ms 딜레이: 텍스트 거의 사라진 후 등장
export const streamFill = style({
  position: 'absolute',
  left: 0,
  right: 0,
  height: '100%',
  background:
    'linear-gradient(to bottom, transparent 0%, rgba(60,25,10,0.92) 25%, rgba(60,25,10,0.92) 100%)',
  animation: `${streamThrough} 900ms ease-in forwards`,
  animationDelay: '400ms',
  top: '-100%',
});

export const cupWrapper = style({
  position: 'absolute',
  top: '310px',
  left: '50%',
  opacity: 0,
  animation: `${cupAppear} 300ms ease forwards`,
  animationDelay: '400ms',
});

export const cup = style({
  width: '200px',
  height: '160px',
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.18) 100%)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1.5px solid rgba(255,255,255,0.40)',
  borderTop: 'none',
  borderBottomLeftRadius: '24px',
  borderBottomRightRadius: '24px',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: [
    'inset 2px 0 0 rgba(255,255,255,0.35)',
    'inset -1px 0 0 rgba(255,255,255,0.15)',
    'inset 0 -1px 0 rgba(255,255,255,0.10)',
    '0 12px 40px rgba(0,0,0,0.18)',
    '0 4px 12px rgba(0,0,0,0.12)',
  ].join(', '),
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '10px',
      width: '3px',
      height: '65%',
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0) 100%)',
      borderRadius: '0 0 3px 3px',
      zIndex: 2,
      pointerEvents: 'none',
    },
  },
});

export const liquid = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 0,
  background:
    'linear-gradient(180deg, rgba(100,50,15,0.55) 0%, rgba(60,25,10,0.88) 25%, rgba(40,15,5,0.95) 100%)',
  animation: `${liquidFill} 700ms ease-out forwards`,
  animationDelay: '715ms',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background:
        'linear-gradient(180deg, rgba(180,100,40,0.5) 0%, rgba(100,50,15,0) 100%)',
      borderRadius: '2px 2px 0 0',
    },
  },
});

export const cupLabelInner = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  gap: '2px',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '-2px',
  pointerEvents: 'none',
  userSelect: 'none',
});

export const cupLabelMa = style({ color: vars.color.primary });
export const cupLabelSil = style({ color: vars.color.accent });

export const handle = style({
  position: 'absolute',
  right: '-34px',
  top: '26px',
  width: '30px',
  height: '60px',
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.06) 100%)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1.5px solid rgba(255,255,255,0.35)',
  borderLeft: 'none',
  borderRadius: '0 22px 22px 0',
  boxShadow: [
    'inset -1px 0 0 rgba(255,255,255,0.20)',
    '4px 4px 12px rgba(0,0,0,0.12)',
  ].join(', '),
});
