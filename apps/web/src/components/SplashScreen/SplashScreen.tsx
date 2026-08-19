'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import {
  overlay,
  overlayExiting,
  scene,
  title,
  titleShrinking,
  letterBase,
  letterMa,
  letterSil,
  streamWrapper,
  streamFill,
  cupWrapper,
  cup,
  cupLabelInner,
  cupLabelMa,
  cupLabelSil,
  liquid,
  handle,
} from './SplashScreen.css';

const STORAGE_KEY = 'masyl_splash_shown';

type Phase = 'idle' | 'visible' | 'shrinking' | 'filling' | 'exiting' | 'done';

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('idle');

  useLayoutEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('done');
      return;
    }
    setPhase('visible');
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const t1 = setTimeout(() => setPhase('shrinking'), 700);
    const t2 = setTimeout(() => setPhase('filling'), 1900);
    const t3 = setTimeout(() => setPhase('exiting'), 2300);
    const t4 = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setPhase('done');
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (phase === 'idle' || phase === 'done') return null;

  const isShrinking =
    phase === 'shrinking' || phase === 'filling' || phase === 'exiting';
  const showStream = isShrinking;
  const showCup = isShrinking;
  const showLiquid = isShrinking;

  return (
    <div
      className={`${overlay}${phase === 'exiting' ? ` ${overlayExiting}` : ''}`}
    >
      <div className={scene}>
        <div className={`${title}${isShrinking ? ` ${titleShrinking}` : ''}`}>
          <span className={`${letterBase} ${letterMa}`}>마</span>
          <span className={`${letterBase} ${letterSil}`}>실</span>
        </div>
        {showStream && (
          <div className={streamWrapper}>
            <div className={streamFill} />
          </div>
        )}
        {showCup && (
          <div className={cupWrapper}>
            <div className={cup}>
              <div className={cupLabelInner}>
                <span className={cupLabelMa}>마</span>
                <span className={cupLabelSil}>실</span>
              </div>
              {showLiquid && <div className={liquid} />}
            </div>
            <div className={handle} />
          </div>
        )}
      </div>
    </div>
  );
}
