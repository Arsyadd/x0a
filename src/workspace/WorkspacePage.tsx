import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from '../auth/dynamicAuth.tsx';
import { workspaceMarkup } from './workspaceMarkup';
import { initWorkspace } from './legacyWorkspace';
import type { DynamicNetworkOption, ProjectIntake } from '../types/projectIntake';
import './workspace.css';

interface WorkspacePageProps {
  initialPrompt?: string;
  initialRequest?: ProjectIntake;
  onNavigateHome?: () => void;
}

function getHumanChainName(name: string, ecosystem: string, chainId: string) {
  let chainName = name.trim();
  let previousName = '';
  while (chainName !== previousName) {
    previousName = chainName;
    chainName = chainName
      .replace(/[\s(]*\b(?:sepolia|testnet|mainnet|devnet)\b[\s)]*$/i, '')
      .replace(/[\s\-–—:]+$/, '')
      .trim();
  }

  return chainName || `${ecosystem.toUpperCase()} · ${chainId}`;
}

export default function WorkspacePage({
  initialPrompt = '',
  initialRequest,
  onNavigateHome,
}: WorkspacePageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [authContainer, setAuthContainer] = useState<HTMLElement | null>(null);
  const {
    networkConfigurations,
    sdkHasLoaded,
    primaryWallet,
    user,
    handleLogOut,
    setShowAuthFlow,
  } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const dynamicNetworks = useMemo<DynamicNetworkOption[]>(() => {
    if (!sdkHasLoaded || !networkConfigurations) return [];
    return Object.entries(networkConfigurations).flatMap(([ecosystem, networks]) =>
      (networks || []).map(network => ({
        id: `${ecosystem}:${network.chainId}:${network.networkId}`,
        ecosystem,
        networkName: network.vanityName || network.name,
        chain: String(network.chainId),
        chainName: getHumanChainName(network.name, ecosystem, String(network.chainId)),
        chainId: String(network.chainId),
        networkId: String(network.networkId),
        isTestnet: Boolean(network.isTestnet),
      })),
    );
  }, [networkConfigurations, sdkHasLoaded]);

  const resolvedRequest = useMemo<ProjectIntake>(() => ({
    ...(initialRequest || { prompt: initialPrompt, files: [], links: [] }),
    prompt: initialRequest?.prompt || initialPrompt,
    files: initialRequest?.files || [],
    links: initialRequest?.links || [],
    dynamicNetworks,
  }), [dynamicNetworks, initialPrompt, initialRequest]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reset markup to clean state before initializing
    root.innerHTML = workspaceMarkup;

    initWorkspace(root, {
      initialPrompt: initialPrompt.trim(),
      initialRequest: resolvedRequest,
      onNavigateHome,
      wallet: primaryWallet ? {
        address: primaryWallet.address,
        chain: primaryWallet.chain || 'EVM',
      } : undefined,
      user: user ? {
        email: user.email,
        username: user.username,
      } : undefined,
      isLoggedIn,
      onLogOut: handleLogOut,
      onConnectWallet: () => setShowAuthFlow(true),
    });

    const sidebarAuthTarget = root.querySelector('#sidebar-dynamic-widget') as HTMLElement | null;
    if (sidebarAuthTarget) {
      setAuthContainer(sidebarAuthTarget);
    }

    return undefined;
  }, [
    initialPrompt,
    resolvedRequest,
    onNavigateHome,
    isLoggedIn,
    primaryWallet,
    user,
    handleLogOut,
    setShowAuthFlow,
  ]);

  return (
    <div className="x0a-workspace-host">
      <div
        ref={rootRef}
        className="x0a-workspace-root"
        dangerouslySetInnerHTML={{
          __html: workspaceMarkup,
        }}
      />
      {authContainer && createPortal(<DynamicWidget />, authContainer)}
    </div>
  );
}
