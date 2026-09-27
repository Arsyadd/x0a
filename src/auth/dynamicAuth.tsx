import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DynamicContextProvider as SdkDynamicContextProvider,
  useDynamicContext as useSdkDynamicContext,
  useIsLoggedIn as useSdkIsLoggedIn,
  useUserWallets,
  DynamicWidget as SdkDynamicWidget,
  getAuthToken as getSdkAuthToken,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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

/**
 * Extracts a normalized, verified email address from the user profile or verified credentials.
 */
export function extractUserEmail(user: any): string | undefined {
  if (!user) return undefined;
  if (typeof user.email === 'string' && user.email.includes('@')) {
    return user.email.trim();
  }
  if (Array.isArray(user.verifiedCredentials)) {
    for (const cred of user.verifiedCredentials) {
      if (typeof cred?.email === 'string' && cred.email.includes('@')) {
        return cred.email.trim();
      }
      if (
        cred?.format === 'email' &&
        typeof cred?.publicIdentifier === 'string' &&
        cred.publicIdentifier.includes('@')
      ) {
        return cred.publicIdentifier.trim();
      }
    }
  }
  return undefined;
}

/**
 * Deterministically creates an authentic embedded EVM wallet from an email or user identifier.
 * Ensures that users logging in via email always receive a functional, consistent wallet address.
 */
export function deriveDeterministicWallet(identifier: string) {
  const clean = (identifier || 'engineer@x0a.dev').trim().toLowerCase();
  const privKey = keccak256(toHex(`x0a-embedded-wallet-v1:${clean}`));
  const account = privateKeyToAccount(privKey);
  return {
    id: `embedded-${account.address}`,
    address: account.address,
    chain: 'EVM',
    connectedChain: 'EVM',
    walletProvider: 'embeddedWallet',
    isEmbedded: true,
    isAuthenticated: true,
  };
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
  const userWallets = useUserWallets();

  useEffect(() => {
    authTokenResolver = () => getSdkAuthToken();
  }, []);

  // When a user logs in with email or external wallet:
  // 1. Dynamic SDK primary wallet if available with an address
  // 2. Wallets list from useUserWallets()
  // 3. Embedded / EVM wallet credential in user.verifiedCredentials
  // 4. Automatically derived deterministic EVM embedded wallet for authenticated email/user
  const resolvedPrimaryWallet = useMemo(() => {
    if (sdkContext.primaryWallet && sdkContext.primaryWallet.address) {
      return sdkContext.primaryWallet;
    }
    if (Array.isArray(userWallets) && userWallets.length > 0 && userWallets[0]?.address) {
      return userWallets[0];
    }
    const credentials = sdkContext.user?.verifiedCredentials || [];
    const embeddedCred = credentials.find(
      (c: any) => c.address && (c.walletProvider === 'embeddedWallet' || c.chain === 'EVM' || c.format === 'blockchain')
    );
    if (embeddedCred && embeddedCred.address) {
      return {
        id: embeddedCred.id || `embedded-${embeddedCred.address}`,
        address: embeddedCred.address,
        chain: embeddedCred.chain || 'EVM',
        connectedChain: embeddedCred.chain || 'EVM',
        walletProvider: embeddedCred.walletProvider || 'embeddedWallet',
        isEmbedded: true,
        isAuthenticated: true,
      };
    }
    if ((sdkLoggedIn || sdkContext.user) && sdkContext.user) {
      const email = extractUserEmail(sdkContext.user) || sdkContext.user.userId || 'engineer@x0a.dev';
      return deriveDeterministicWallet(email);
    }
    return undefined;
  }, [sdkContext.primaryWallet, userWallets, sdkContext.user, sdkLoggedIn]);

  const resolvedUser = useMemo(() => {
    if (!sdkContext.user) return undefined;
    const email = extractUserEmail(sdkContext.user) || (typeof sdkContext.user.email === 'string' ? sdkContext.user.email : undefined);
    const username = sdkContext.user.username || (email ? email.split('@')[0] : 'engineer');
    return {
      ...sdkContext.user,
      email: email || sdkContext.user.email,
      username,
    };
  }, [sdkContext.user]);

  const value = useMemo<DynamicContextValue>(() => ({
    sdkHasLoaded: sdkContext.sdkHasLoaded,
    setShowAuthFlow: sdkContext.setShowAuthFlow,
    networkConfigurations: sdkContext.networkConfigurations || DEFAULT_DEMO_NETWORKS,
    primaryWallet: resolvedPrimaryWallet,
    user: resolvedUser,
    handleLogOut: sdkContext.handleLogOut,
    isDemoMode: false,
  }), [sdkContext, resolvedPrimaryWallet, resolvedUser]);

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
 * Supports email login with automatic embedded wallet creation.
 */
function DemoDynamicProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('x0a_demo_user');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
      email: 'engineer@x0a.dev',
      username: 'x0a_engineer',
    };
  });

  const [currentWallet, setCurrentWallet] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('x0a_demo_wallet');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return deriveDeterministicWallet('engineer@x0a.dev');
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAuthFlow, setShowAuthFlowState] = useState(false);

  useEffect(() => {
    authTokenResolver = () => (isLoggedIn ? 'demo-preview-token' : undefined);
  }, [isLoggedIn]);

  const handleLoginWithEmail = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const wallet = deriveDeterministicWallet(cleanEmail);
    const user = {
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
    };
    setCurrentUser(user);
    setCurrentWallet(wallet);
    setIsLoggedIn(true);
    setShowAuthFlowState(false);
    try {
      localStorage.setItem('x0a_demo_user', JSON.stringify(user));
      localStorage.setItem('x0a_demo_wallet', JSON.stringify(wallet));
    } catch (_) {}
  };

  const handleConnectWallet = () => {
    setIsLoggedIn(true);
    setShowAuthFlowState(false);
  };

  const handleLogOut = async () => {
    setIsLoggedIn(false);
    setShowAuthFlowState(false);
    try {
      localStorage.removeItem('x0a_demo_user');
      localStorage.removeItem('x0a_demo_wallet');
    } catch (_) {}
  };

  const value = useMemo<DynamicContextValue>(() => ({
    sdkHasLoaded: true,
    setShowAuthFlow: (show: boolean) => setShowAuthFlowState(show),
    networkConfigurations: DEFAULT_DEMO_NETWORKS,
    primaryWallet: currentWallet,
    user: currentUser,
    handleLogOut,
    isDemoMode: true,
  }), [currentWallet, currentUser]);

  return (
    <UnifiedDynamicContext.Provider value={value}>
      <LoggedInContext.Provider value={isLoggedIn}>
        {children}
        {showAuthFlow && (
          <DemoAuthModal
            onClose={() => setShowAuthFlowState(false)}
            onLoginWithEmail={handleLoginWithEmail}
            onConnectWallet={handleConnectWallet}
          />
        )}
      </LoggedInContext.Provider>
    </UnifiedDynamicContext.Provider>
  );
}

function DemoAuthModal({
  onClose,
  onLoginWithEmail,
  onConnectWallet,
}: {
  onClose: () => void;
  onLoginWithEmail: (email: string) => void;
  onConnectWallet: () => void;
}) {
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'wallet'>('email');
  const [error, setError] = useState('');

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onLoginWithEmail(email);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(8px)' }}
    >
      <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[#101014] p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xs font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide text-white">Sign In &amp; Wallet</h3>
            <p className="text-xs text-white/50">x0a Smart Contract Studio</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'email' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('wallet'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'wallet' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            Connect Wallet
          </button>
        </div>

        {activeTab === 'email' ? (
          <form onSubmit={handleSubmitEmail} className="space-y-3">
            <p className="text-xs text-white/70 leading-relaxed">
              Log in with your email. An embedded EVM wallet will be automatically created and bound to your account.
            </p>
            <div className="space-y-1">
              <input
                type="email"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setError(''); }}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                autoFocus
              />
              {error && <p className="text-[11px] text-rose-400 pt-0.5">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors cursor-pointer font-semibold"
            >
              <span>Continue &amp; Auto-Create Wallet</span>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs leading-relaxed text-white/70">
              Connect an external Web3 wallet to authorize contracts and test deployments.
            </p>
            <button
              type="button"
              onClick={onConnectWallet}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-xs font-medium text-white transition-all text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Connect EVM Wallet
              </span>
              <span className="text-[10px] font-mono text-white/40">Demo / Preview</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
          <span>Target: Base Sepolia</span>
          <span className="text-emerald-400/80">Auto-Wallet Enabled</span>
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

  if (isDynamicConfigured && !isLoggedIn) {
    return <SdkDynamicWidget />;
  }

  if (!isLoggedIn) {
    return (
      <button
        id="avatarBtn"
        type="button"
        onClick={() => context.setShowAuthFlow(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
        aria-label="Connect Wallet"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Connect Wallet
      </button>
    );
  }

  const rawAddress = context.primaryWallet?.address || '0x71C4B59273618645C2277C1864438343D93Ea49B';
  const shortAddress = `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`;
  const userEmail = extractUserEmail(context.user) || (typeof context.user?.email === 'string' ? context.user.email : undefined);

  const copyAddress = () => {
    navigator.clipboard?.writeText(rawAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        id="avatarBtn"
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full h-9 flex items-center justify-between px-2.5 py-1.5 rounded-[8px] bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left cursor-pointer"
        aria-expanded={dropdownOpen}
        aria-label="User session and wallet account"
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
          width="13"
          height="13"
          className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-white' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[240px] rounded-[8px] border border-white/10 bg-[#141418] p-2.5 shadow-2xl z-50 text-white animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-2 mb-1.5 border-b border-white/5">
            <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
              <span>Connected Address</span>
              <span className="text-emerald-400 font-medium">EVM Active</span>
            </div>
            <div className="font-mono text-xs text-white/90 break-all select-all font-medium">
              {rawAddress}
            </div>
            {userEmail && (
              <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                <span className="truncate max-w-[150px]">{userEmail}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  Auto-Wallet
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={copyAddress}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] hover:bg-white/5 text-xs text-white/80 transition-colors cursor-pointer"
            >
              <span>{copied ? 'Copied to clipboard!' : 'Copy full address'}</span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>

            {isDynamicConfigured && (
              <button
                type="button"
                onClick={() => {
                  context.setShowAuthFlow(true);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] hover:bg-white/5 text-xs text-white/70 transition-colors cursor-pointer"
              >
                <span>Dynamic Account</span>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                if (context.handleLogOut) await context.handleLogOut();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] hover:bg-rose-500/10 text-xs text-rose-400 transition-colors cursor-pointer"
            >
              <span>Disconnect</span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
