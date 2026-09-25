import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import LandingPage from './LandingPage';
import HomeApp from './HomeApp';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>(() => {
    return window.location.hash === '#app' ? 'app' : 'landing';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeLabelRef = useRef<HTMLSpanElement>(null);

  const triggerWipe = (label: string, callback: () => void) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const wipe = wipeRef.current;
    const wipeLabel = wipeLabelRef.current;
    if (!wipe || !wipeLabel) {
      callback();
      setIsTransitioning(false);
      return;
    }

    wipeLabel.textContent = label;

    gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
      }
    })
      .set(wipe, { clipPath: 'inset(100% 0% 0% 0%)', pointerEvents: 'auto' })
      .to(wipe, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' })
      .fromTo(wipeLabel, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=.35')
      .add(() => {
        callback();
        const nextTarget = label === 'Home' ? 'app' : 'landing';
        if (nextTarget === 'landing') {
          document.body.classList.remove('is-locked');
          if (typeof window !== 'undefined' && (window as any).__x0a_setLandingActive) {
            (window as any).__x0a_setLandingActive(true);
          }
        } else {
          if (typeof window !== 'undefined' && (window as any).__x0a_setLandingActive) {
            (window as any).__x0a_setLandingActive(false);
          }
        }
        window.scrollTo(0, 0);
      })
      .to(wipe, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.inOut' }, '+=.2')
      .set(wipe, { pointerEvents: 'none' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const targetView = window.location.hash === '#app' ? 'app' : 'landing';
      if (targetView !== view && !isTransitioning) {
        if (targetView === 'app') {
          triggerWipe('Home', () => setView('app'));
        } else {
          triggerWipe('x0a', () => setView('landing'));
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [view, isTransitioning]);

  const navigateToApp = () => {
    if (view === 'app' || isTransitioning) return;
    window.location.hash = 'app';
    triggerWipe('Home', () => {
      setView('app');
    });
  };

  const navigateToLanding = () => {
    if (view === 'landing' || isTransitioning) return;
    window.location.hash = 'landing';
    triggerWipe('x0a', () => {
      setView('landing');
    });
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Blue transition wipe (identical to landing navbar transition) */}
      <div ref={wipeRef} className="app-wipe" aria-hidden="true">
        <span ref={wipeLabelRef} className="app-wipe__label">Home</span>
      </div>

      <div
        id="landing-view-root"
        style={{
          display: view === 'landing' ? 'block' : 'none',
        }}
      >
        <LandingPage onLaunchApp={navigateToApp} />
      </div>

      <div
        id="app-view-root"
        style={{
          display: view === 'app' ? 'block' : 'none',
        }}
      >
        <HomeApp onBackToLanding={navigateToLanding} />
      </div>
    </div>
  );
}

