import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html', {
  height: '100%',
});

globalStyle('body', {
  height: '100%',
  backgroundColor: vars.color.bg,
  fontFamily: vars.font.sans,
  color: vars.color.primary,
  lineHeight: '1.5',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('button', {
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  font: 'inherit',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});
