import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';

import LandingPage from './LandingPage';
import HomeApp from './HomeApp';
import WorkspacePage from './workspace/WorkspacePage';
import type { ProjectIntake } from './types/projectIntake';

type View = 'landing' | 'app' | 'workspace';

const getViewFromHash = (): View => {
  const hash = window.location.hash;

  if (hash === '#workspace') return 'workspace';
  if (hash === '#app') return 'app';

  return 'landing';
};

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const [view, setView] = useState<View>('landing');

  const [workspacePrompt, setWorkspacePrompt] = useState('');
  const [workspaceRequest, setWorkspaceRequest] = useState<ProjectIntake>({ prompt: '', files: [], links: [] });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeLabelRef = useRef<HTMLSpanElement>(null);
  const pendingViewRef = useRef<View | null>(null);
  const wasLoggedInRef = useRef(isLoggedIn);

  const triggerWipe = (
    label: string,
    callback: () => void
  ) => {
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
      },
    })
      .set(wipe, {
        clipPath: 'inset(100% 0% 0% 0%)',
        pointerEvents: 'auto',
      })

      .to(wipe, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.75,
        ease: 'expo.inOut',
      })

      .fromTo(
        wipeLabel,
        {
          yPercent: 40,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
        },
        '-=.35'
      )

      .add(() => {
        callback();

        if (label === 'x0a') {
          document.body.classList.remove('is-locked');

          if (
            typeof window !== 'undefined' &&
            (window as any).__x0a_setLandingActive
          ) {
            (window as any).__x0a_setLandingActive(true);
          }
        } else {
          if (
            typeof window !== 'undefined' &&
            (window as any).__x0a_setLandingActive
          ) {
            (window as any).__x0a_setLandingActive(false);
          }
        }

        window.scrollTo(0, 0);
      })

      .to(
        wipe,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.85,
          ease: 'expo.inOut',
        },
        '+=.2'
      )

      .set(wipe, {
        pointerEvents: 'none',
      });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const targetView = getViewFromHash();

      if (targetView !== 'landing' && (!sdkHasLoaded || !isLoggedIn)) {
        pendingViewRef.current = targetView;
        if (sdkHasLoaded) setShowAuthFlow(true);
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#landing`);
        setView('landing');
        return;
      }

      if (targetView === view || isTransitioning) {
        return;
      }

      if (targetView === 'app') {
        triggerWipe('Home', () => {
          setView('app');
        });
      }

      if (targetView === 'workspace') {
        triggerWipe('Workspace', () => {
          setView('workspace');
        });
      }

      if (targetView === 'landing') {
        triggerWipe('x0a', () => {
          setView('landing');
        });
      }
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, [view, isTransitioning, isLoggedIn, sdkHasLoaded, setShowAuthFlow]);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    if (!isLoggedIn) {
      if (pendingViewRef.current) setShowAuthFlow(true);
      const requestedView = getViewFromHash();
      if (!wasLoggedInRef.current && requestedView !== 'landing') {
        pendingViewRef.current = requestedView;
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#landing`);
        setShowAuthFlow(true);
      }
      if (view !== 'landing') {
        if (wasLoggedInRef.current) pendingViewRef.current = null;
        else pendingViewRef.current = view;
        setView('landing');
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#landing`);
      }
      wasLoggedInRef.current = false;
      return;
    }

    wasLoggedInRef.current = true;
    const pendingView = pendingViewRef.current;
    if (pendingView && pendingView !== 'landing') {
      pendingViewRef.current = null;
      window.location.hash = pendingView;
      setView(pendingView);
    }
  }, [isLoggedIn, sdkHasLoaded, view]);

  const navigateToApp = () => {
    if (!sdkHasLoaded || !isLoggedIn) {
      pendingViewRef.current = 'app';
      if (sdkHasLoaded) setShowAuthFlow(true);
      return;
    }
    if (view === 'app' || isTransitioning) return;

    window.location.hash = 'app';

    triggerWipe('Home', () => {
      setView('app');
    });
  };

  const navigateToWorkspace = (request?: ProjectIntake) => {
  if (request !== undefined) {
    setWorkspacePrompt(request.prompt);
    setWorkspaceRequest(request);
  }

  if (!sdkHasLoaded || !isLoggedIn) {
    pendingViewRef.current = 'workspace';
    if (sdkHasLoaded) setShowAuthFlow(true);
    return;
  }
  if (view === 'workspace' || isTransitioning) return;

  window.location.hash = 'workspace';

  triggerWipe('Workspace', () => {
    setView('workspace');
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

    {/* Transition wipe */}
    <div
      ref={wipeRef}
      className="app-wipe"
      aria-hidden="true"
    >
      <span
        ref={wipeLabelRef}
        className="app-wipe__label"
      >
        Home
      </span>
    </div>

    {/* Landing */}
    <div
      id="landing-view-root"
      style={{
        display: view === 'landing' ? 'block' : 'none',
      }}
    >
      <LandingPage
        onLaunchApp={navigateToApp}
      />
    </div>

    {/* Home */}
    <div
      id="app-view-root"
      style={{
        display: view === 'app' && isLoggedIn ? 'block' : 'none',
      }}
    >
      {isLoggedIn && view === 'app' && (
        <HomeApp
          onBackToLanding={navigateToLanding}
          onOpenWorkspace={navigateToWorkspace}
        />
      )}
    </div>

    {/* Workspace */}
    <div
      id="workspace-view-root"
      style={{
        display: view === 'workspace' && isLoggedIn ? 'block' : 'none',
      }}
    >
      {isLoggedIn && view === 'workspace' && (
        <WorkspacePage
          key={workspacePrompt}
          initialPrompt={workspacePrompt}
          initialRequest={workspaceRequest}
        />
      )}
    </div>

  </div>
);
}
