import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DynamicContextProvider as SdkDynamicContextProvider,
  useDynamicContext as useSdkDynamicContext,
  useIsLoggedIn as useSdkIsLoggedIn,
  DynamicWidget as SdkDynamicWidget,
  getAuthToken as getSdkAuthToken,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

export { EthereumWalletConnectors };

export interface DynamicContextValue {
  sdkHasLoaded: boolean;
  setShowAuthFlow: (show: boolean) => void;
  networkConfigurations?: Record<string, any[] | undefined>;
  primaryWallet?: any;
  user?: any;
  handleLogOut?: () => Promise<void>;
  isDemoMode?: boolean;
}

const DEFAULT_DEMO_NETWORKS: Record<string, any[]> = {
  EVM: [
    { chainId: 84532, networkId: 84532, name: 'Base Sepolia', vanityName: 'Base Sepolia', isTestnet: true },
    { chainId: 11155111, networkId: 11155111, name: 'Ethereum Sepolia', vanityName: 'Ethereum Sepolia', isTestnet: true },
    { chainId: 421614, networkId: 421614, name: 'Arbitrum Sepolia', vanityName: 'Arbitrum Sepolia', isTestnet: true },
    { chainId: 8453, networkId: 8453, name: 'Base', vanityName: 'Base Mainnet', isTestnet: false },
    { chainId: 1, networkId: 1, name: 'Ethereum', vanityName: 'Ethereum Mainnet', isTestnet: false },
    { chainId: 42161, networkId: 42161, name: 'Arbitrum One', vanityName: 'Arbitrum One', isTestnet: false },
    { chainId: 10, networkId: 10, name: 'OP Mainnet', vanityName: 'Optimism', isTestnet: false },
    { chainId: 137, networkId: 137, name: 'Polygon', vanityName: 'Polygon POS', isTestnet: false },
  ],
  SVM: [
    { chainId: 103, networkId: 103, name: 'Solana Devnet', vanityName: 'Solana Devnet', isTestnet: true },
    { chainId: 101, networkId: 101, name: 'Solana Mainnet', vanityName: 'Solana Mainnet', isTestnet: false },
  ],
  Sui: [
    { chainId: 2, networkId: 2, name: 'Sui Testnet', vanityName: 'Sui Testnet', isTestnet: true },
    { chainId: 1, networkId: 1, name: 'Sui Mainnet', vanityName: 'Sui Mainnet', isTestnet: false },
  ],
  Starknet: [
    { chainId: 'SN_SEPOLIA', networkId: 'SN_SEPOLIA', name: 'Starknet Sepolia', vanityName: 'Starknet Sepolia', isTestnet: true },
    { chainId: 'SN_MAIN', networkId: 'SN_MAIN', name: 'Starknet Mainnet', vanityName: 'Starknet Mainnet', isTestnet: false },
  ],
};

const UnifiedDynamicContext = createContext<DynamicContextValue>({
  sdkHasLoaded: true,
  setShowAuthFlow: () => {},
  networkConfigurations: DEFAULT_DEMO_NETWORKS,
  isDemoMode: true,
});

const LoggedInContext = createContext<boolean>(true);

// Auth token resolver
let authTokenResolver: () => string | undefined = () => 'demo-preview-token';

export function getAuthToken(): string | undefined {
  return authTokenResolver();
}

const rawEnvId = (import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || '').trim();
export const isDynamicConfigured = Boolean(
  rawEnvId &&
  rawEnvId.length > 5 &&
  rawEnvId !== 'undefined' &&
  rawEnvId !== 'null'
);

/**
 * Bridge component for when a real Dynamic environmentId is configured.
 */
function RealDynamicBridge({ children }: { children: React.ReactNode }) {
  const sdkContext = useSdkDynamicContext();
  const sdkLoggedIn = useSdkIsLoggedIn();

  useEffect(() => {
    authTokenResolver = () => getSdkAuthToken();
  }, []);

  const value = useMemo<DynamicContextValue>(() => ({
    sdkHasLoaded: sdkContext.sdkHasLoaded,
    setShowAuthFlow: sdkContext.setShowAuthFlow,
    networkConfigurations: sdkContext.networkConfigurations || DEFAULT_DEMO_NETWORKS,
    primaryWallet: sdkContext.primaryWallet,
    user: sdkContext.user,
    handleLogOut: sdkContext.handleLogOut,
    isDemoMode: false,
  }), [sdkContext]);

  return (
    <UnifiedDynamicContext.Provider value={value}>
      <LoggedInContext.Provider value={sdkLoggedIn}>
        {children}
      </LoggedInContext.Provider>
    </UnifiedDynamicContext.Provider>
  );
}

/**
 * Fallback provider when no Dynamic environmentId is configured.
 * Keeps the application fully interactive, prevents crashes, and enables
 * smart contract specification, exploration, and development.
 */
function DemoDynamicProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuthFlow, setShowAuthFlowState] = useState(false);

  useEffect(() => {
    authTokenResolver = () => (isLoggedIn ? 'demo-preview-token' : undefined);
  }, [isLoggedIn]);

  const value = useMemo<DynamicContextValue>(() => ({
    sdkHasLoaded: true,
    setShowAuthFlow: (show: boolean) => setShowAuthFlowState(show),
    networkConfigurations: DEFAULT_DEMO_NETWORKS,
    primaryWallet: {
      address: '0x71C4B59273618645C2277C1864438343D93Ea49B',
      chain: 'EVM',
    },
    user: {
      email: 'engineer@x0a.dev',
      username: 'x0a_engineer',
    },
    handleLogOut: async () => {
      setIsLoggedIn(false);
    },
    isDemoMode: true,
  }), []);

  return (
    <UnifiedDynamicContext.Provider value={value}>
      <LoggedInContext.Provider value={isLoggedIn}>
        {children}
        {showAuthFlow && (
          <DemoAuthModal
            onClose={() => setShowAuthFlowState(false)}
            onConnect={() => {
              setIsLoggedIn(true);
              setShowAuthFlowState(false);
            }}
          />
        )}
      </LoggedInContext.Provider>
    </UnifiedDynamicContext.Provider>
  );
}

function DemoAuthModal({
  onClose,
  onConnect,
}: {
  onClose: () => void;
  onConnect: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(8px)' }}
    >
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[#101014] p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xs font-mono text-white/40 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide text-white">Connect Wallet</h3>
            <p className="text-xs text-white/50">x0a Smart Contract Studio</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-white/70 mb-5">
          Connect your Web3 wallet to authorize smart contract builds, audits, and deployment pipelines.
        </p>

        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={onConnect}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-xs font-medium text-white transition-all text-left"
          >
            <span className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Connect EVM / Ethereum Wallet
            </span>
            <span className="text-[10px] font-mono text-white/40">Demo / Preview</span>
          </button>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
          <span>Target: Base Sepolia</span>
          <span>EVM Verified</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Universal Dynamic Auth Provider that uses the real Dynamic SDK if configured,
 * or gracefully falls back to the robust Demo provider without throwing missing-environmentId errors.
 */
export function DynamicAuthProvider({ children }: { children: React.ReactNode }) {
  if (isDynamicConfigured) {
    return (
      <SdkDynamicContextProvider
        settings={{
          environmentId: rawEnvId,
          walletConnectors: [EthereumWalletConnectors],
          overrides: {
            evmNetworks: (networks: any[]) => {
              const defaultRpcs: Record<string, string> = {
                '1': 'https://cloudflare-eth.com',
                '11155111': 'https://rpc.sepolia.org',
                '8453': 'https://mainnet.base.org',
                '84532': 'https://sepolia.base.org',
                '42161': 'https://arb1.arbitrum.io/rpc',
                '421614': 'https://sepolia-rollup.arbitrum.io/rpc',
                '10': 'https://mainnet.optimism.io',
                '137': 'https://polygon-rpc.com',
                '11297108109': 'https://palm-mainnet.public.blastapi.io',
              };
              return (networks || []).map((net) => {
                const hasRpc = Array.isArray(net.rpcUrls) && net.rpcUrls.length > 0 && Boolean(net.rpcUrls[0]);
                if (hasRpc) return net;
                const fallback = defaultRpcs[String(net.chainId)] || defaultRpcs[String(net.networkId)] || 'https://cloudflare-eth.com';
                return {
                  ...net,
                  rpcUrls: [fallback],
                };
              });
            },
          },
          cssOverrides: `
            .overlay-card-base__overlay {
              background-color: rgba(0, 0, 0, 0.78) !important;
            }
            .overlay-card-base__content {
              background-color: #101014 !important;
              opacity: 1 !important;
            }
          `,
        }}
      >
        <RealDynamicBridge>
          {children}
        </RealDynamicBridge>
      </SdkDynamicContextProvider>
    );
  }

  return (
    <DemoDynamicProvider>
      {children}
    </DemoDynamicProvider>
  );
}

/**
 * Hook to access Dynamic context uniformly across real and demo modes.
 */
export function useDynamicContext(): DynamicContextValue {
  return useContext(UnifiedDynamicContext);
}

/**
 * Hook to access login state uniformly across real and demo modes.
 */
export function useIsLoggedIn(): boolean {
  return useContext(LoggedInContext);
}

/**
 * Interactive Dynamic Widget component that renders the real widget when Dynamic is configured,
 * or an authentic Web3 connected badge when running in preview mode.
 */
export function DynamicWidget() {
  const isLoggedIn = useIsLoggedIn();
  const context = useDynamicContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  if (isDynamicConfigured) {
    return <SdkDynamicWidget />;
  }

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => context.setShowAuthFlow(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Connect Wallet
      </button>
    );
  }

  const rawAddress = context.primaryWallet?.address || '0x71C4B59273618645C2277C1864438343D93Ea49B';
  const shortAddress = `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard?.writeText(rawAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left"
        aria-expanded={dropdownOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-mono font-medium text-white tracking-tight truncate">
              {shortAddress}
            </span>
            <span className="text-[9px] text-white/40 tracking-wider uppercase font-mono">
              Base Sepolia
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          className={`text-white/40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-white/10 bg-[#141418] p-2.5 shadow-2xl z-50 text-white animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 mb-1.5 border-b border-white/5">
            <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
              <span>Connected Address</span>
              <span className="text-emerald-400 font-medium">EVM Active</span>
            </div>
            <div className="font-mono text-xs text-white/90 break-all select-all">
              {shortAddress}
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={copyAddress}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 text-xs text-white/80 transition-colors"
            >
              <span>{copied ? 'Copied to clipboard!' : 'Copy full address'}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (context.handleLogOut) await context.handleLogOut();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-rose-500/10 text-xs text-rose-400 transition-colors"
            >
              <span>Disconnect</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
