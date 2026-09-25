import React, { useState, useEffect, useRef } from 'react';
import './app.css';

interface HomeAppProps {
  onBackToLanding: () => void;
}

export default function HomeApp({ onBackToLanding }: HomeAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProject, setActiveProject] = useState('Yield Vault');
  const [avatarPopOpen, setAvatarPopOpen] = useState(false);
  const [notifPopOpen, setNotifPopOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [composerMode, setComposerMode] = useState<'new' | 'analyze' | 'deployment' | 'import'>('new');
  const [selectedEco, setSelectedEco] = useState('auto');
  const [promptText, setPromptText] = useState('');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [channelNotice, setChannelNotice] = useState('');

  // Customize preferences state
  const [defaultEco, setDefaultEco] = useState('auto');
  const [defaultNet, setDefaultNet] = useState('Testnet');
  const [blockHigh, setBlockHigh] = useState(true);
  const [verifyDepth, setVerifyDepth] = useState('Standard');
  const [savedHintVisible, setSavedHintVisible] = useState(false);
  const [notifEvents, setNotifEvents] = useState<Record<string, boolean>>({
    critical: true,
    wallet: true,
    incident: true,
    build: false,
    deploy: false,
    verify: false,
    authority: false,
    upgrade: false,
    anomaly: false
  });

  // Notifications state
  const [notifs, setNotifs] = useState([
    { id: 'n1', type: 'wallet', project: 'Yield Vault', title: 'Deployment awaiting your signature', text: 'Security gate passed. Approve the Base testnet deployment in your wallet.', mins: 12, unread: true },
    { id: 'n2', type: 'critical', project: 'Liquid Staking Program', title: 'High severity finding', text: '2 findings need review before rebuild: 1 high, 1 medium.', mins: 120, unread: true },
    { id: 'n3', type: 'anomaly', project: 'Perp Router', title: 'Monitoring anomaly cleared', text: 'Oracle price deviation is back in range. No open alerts.', mins: 1440, unread: false },
    { id: 'n4', type: 'verify', project: 'Liquid Staking Program', title: 'Verification failure', text: 'The devnet program hash didn’t match the build artifact. Rebuild to retry.', mins: 1500, unread: false },
    { id: 'n5', type: 'upgrade', project: 'Perp Router', title: 'Upgrade executed', text: 'The new router implementation is live on Arbitrum. Post-upgrade checks passed.', mins: 2880, unread: false },
    { id: 'n6', type: 'deploy', project: 'Object Marketplace', title: 'Deployment succeeded', text: 'Package published to Sui testnet. Monitoring is starting up.', mins: 4320, unread: false },
    { id: 'n7', type: 'build', project: 'Options Vault', title: 'Build or test failure', text: 'A fork test failed and was fixed on auto-fix attempt 2 of 3. Simulation is queued.', mins: 5760, unread: false },
    { id: 'n8', type: 'incident', project: 'Treasury Timelock', title: 'Incident detected', text: 'Anomalous withdrawal flagged. Incident opened with evidence preserved — review before responding.', mins: 8640, unread: true },
    { id: 'n9', type: 'authority', project: 'Treasury Timelock', title: 'Authority change', text: 'The timelock admin moved to a new address. Confirm it was you.', mins: 8700, unread: false }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Filtered notifications
  const visibleNotifs = notifs.filter(n => notifEvents[n.type]);
  const unreadNotifs = visibleNotifs.filter(n => n.unread);
  const displayedNotifs = notifFilter === 'unread' ? unreadNotifs : visibleNotifs;
  const unreadCount = unreadNotifs.length;

  const MODES: Record<string, { ph: string; hint: string; tools: string[] }> = {
    new: { ph: 'Describe the smart contract you want — e.g. an overcollateralized lending market on an EVM L2, with a liquidation keeper and a pausable emergency switch…', hint: 'x0a picks the chain, VM and contract language automatically — or choose an ecosystem above.', tools: [] },
    analyze: { ph: 'Paste a repository URL, or use Source / ZIP below to hand x0a a smart contract project to reconstruct and audit…', hint: 'x0a reconstructs the architecture and threat model before running a full security pass.', tools: ['source', 'zip', 'repo'] },
    deployment: { ph: 'Paste a deployed contract address or program ID, and tell us which chain and network it lives on…', hint: 'x0a discovers on-chain metadata — authorities, dependencies and current state.', tools: ['address'] },
    import: { ph: 'Drop a ZIP, connect a repository, or paste a folder path — x0a picks up the contract’s lifecycle from wherever it left off…', hint: 'Existing tests, configs and prior audits are kept, not discarded.', tools: ['source', 'zip', 'repo'] }
  };

  const PROMPTS = [
    { q: 'Build a lending protocol.', tags: ['EVM', 'Solidity', 'Foundry', 'Fork simulation'] },
    { q: 'Create a Solana staking program.', tags: ['Solana', 'Anchor', 'PDA analysis', 'Local validator'] },
    { q: 'Create a Move-based asset protocol.', tags: ['Move', 'Objects', 'Capabilities'] },
    { q: 'Build a cross-chain treasury.', tags: ['Cross-chain', 'Replay protection', 'Finality assumptions'] },
    { q: 'Create a custom escrow system.', tags: ['Escrow', 'State machine', 'Invariant tests'] },
    { q: 'Create an NFT marketplace.', tags: ['NFT', 'Royalties', 'Access control'] }
  ];

  const [promptIdx, setPromptIdx] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState('');

  // Suggestions typewriter effect
  useEffect(() => {
    let currentIdx = 0;
    let charIdx = 0;
    let isErasing = false;
    let timeoutId: any;

    function tick() {
      const current = PROMPTS[currentIdx].q;
      if (!isErasing) {
        if (charIdx <= current.length) {
          setTypedPrompt(current.slice(0, charIdx));
          charIdx++;
          timeoutId = setTimeout(tick, 45);
        } else {
          timeoutId = setTimeout(() => {
            isErasing = true;
            tick();
          }, 2400);
        }
      } else {
        if (charIdx > 0) {
          setTypedPrompt(current.slice(0, charIdx - 1));
          charIdx -= 2;
          if (charIdx < 0) charIdx = 0;
          timeoutId = setTimeout(tick, 25);
        } else {
          isErasing = false;
          currentIdx = (currentIdx + 1) % PROMPTS.length;
          setPromptIdx(currentIdx);
          timeoutId = setTimeout(tick, 400);
        }
      }
    }

    timeoutId = setTimeout(tick, 600);
    return () => clearTimeout(timeoutId);
  }, []);

  const projects = [
    { title: 'Yield Vault', status: 'Awaiting wallet approval', time: '12m', icon: 'evm' },
    { title: 'Liquid Staking Program', status: '2 findings to review', time: '2h', icon: 'solana' },
    { title: 'Perp Router', status: 'Monitoring active, no alerts', time: '1d', icon: 'evm' },
    { title: 'Object Marketplace', status: 'Verified, monitoring starting', time: '3d', icon: 'sui' },
    { title: 'Options Vault', status: 'Fork simulation queued', time: '4d', icon: 'starknet' },
    { title: 'Treasury Timelock', status: 'Incident opened — anomalous withdrawal', time: '6d', icon: 'cardano' }
  ];

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const focusComposerWithPrompt = (text: string) => {
    setPromptText(text);
    setComposerMode('new');
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => textareaRef.current?.focus(), 300);
  };

  const handleNotificationClick = (item: any) => {
    setNotifs(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setActiveProject(item.project);
    setNotifPopOpen(false);
  };

  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleSavePreferences = () => {
    setSelectedEco(defaultEco);
    setSavedHintVisible(true);
    setTimeout(() => {
      setSavedHintVisible(false);
      setCustomizeOpen(false);
    }, 800);
  };

  const handleResetPreferences = () => {
    setDefaultEco('auto');
    setDefaultNet('Testnet');
    setBlockHigh(true);
    setVerifyDepth('Standard');
    setNotifEvents({
      critical: true,
      wallet: true,
      incident: true,
      build: false,
      deploy: false,
      verify: false,
      authority: false,
      upgrade: false,
      anomaly: false
    });
  };

  const formatAgo = (mins: number) => {
    if (mins < 60) return `${Math.max(1, mins)}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  const currentHint = selectedEco === 'auto'
    ? MODES[composerMode].hint
    : `Targeting ${selectedEco.toUpperCase()} explicitly — x0a still confirms the VM and network.`;

  return (
    <div className="app-scope">
      <div className="glow" aria-hidden="true"><i></i><i></i></div>
      <div className="grain" aria-hidden="true"></div>
      <div className={`scrim ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      <div className={`shell ${sidebarOpen ? 'is-open' : ''}`}>
        {/* ============ Sidebar ============ */}
        <aside className="sidebar" aria-label="Primary">
          <div className="sidebar__head">
            <div className="sidebar__brand" onClick={onBackToLanding} title="Back to landing page">
              <span>x0a</span>
            </div>
            <button className="sidebar__closeMobile" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
              </svg>
            </button>
          </div>

          <div className="sidebar__actions">
            <button
              className="sbtn sbtn--new"
              data-tip="New project"
              onClick={() => {
                setSidebarOpen(false);
                focusComposerWithPrompt('');
              }}
            >
              <span className="sbtn__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="6.8" />
                  <path d="M10 6.8v6.4M6.8 10h6.4" />
                </svg>
              </span>
              <span className="sbtn__label">New project</span>
            </button>

            <label className="sbtn sbtn--search" data-tip="Search">
              <span className="sbtn__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <circle cx="9" cy="9" r="5.4" />
                  <path d="m17 17-3.6-3.6" />
                </svg>
              </span>
              <input
                className="sbtn__input"
                type="text"
                placeholder="Search projects"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search projects"
                autoComplete="off"
              />
            </label>

            <button
              className="sbtn sbtn--customize"
              data-tip="Customize"
              onClick={() => {
                setSidebarOpen(false);
                setCustomizeOpen(true);
              }}
            >
              <span className="sbtn__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 6.2h6.4M12.6 6.2H17" />
                  <circle cx="10.8" cy="6.2" r="1.7" />
                  <path d="M3 10.4h2.4M8.6 10.4H17" />
                  <circle cx="7" cy="10.4" r="1.7" />
                  <path d="M3 14.6h9M14.8 14.6H17" />
                  <circle cx="13.1" cy="14.6" r="1.7" />
                </svg>
              </span>
              <span className="sbtn__label">Customize</span>
            </button>
          </div>

          <hr className="sidebar__rule" />

          <div className="sidebar__projects">
            <div className="sidebar__projectsHead">
              <span>Projects</span>
              <button
                className="sidebar__viewAll"
                onClick={() => {
                  setSidebarOpen(true);
                  const el = document.getElementById('projectList');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View all
              </button>
            </div>

            <ul className="plist" id="projectList">
              {filteredProjects.map((p, i) => (
                <li key={i}>
                  <button
                    className={`plist__item ${activeProject === p.title ? 'is-active' : ''}`}
                    onClick={() => setActiveProject(p.title)}
                  >
                    <span className="plist__icon">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 2 17 10 10 18 3 10Z" />
                      </svg>
                    </span>
                    <span className="plist__body">
                      <b>{p.title}</b>
                      <span>{p.status}</span>
                    </span>
                    <span className="plist__time">{p.time}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={`plist__empty ${filteredProjects.length === 0 ? 'is-visible' : ''}`}>
              No projects match your search.
            </p>
          </div>

          <div className="sidebar__foot">
            <button
              className="sidebar__user"
              onClick={() => setAvatarPopOpen(!avatarPopOpen)}
              aria-haspopup="menu"
              aria-expanded={avatarPopOpen}
            >
              <i>AR</i>
              <span><b>Alex Rivera</b><span>Owner · Personal</span></span>
            </button>
            <button className="sidebar__gear" aria-label="Settings" onClick={() => setCustomizeOpen(true)}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="10" cy="10" r="2.7" />
                <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.9 5.1l-1.4 1.4M6.5 13.5l-1.4 1.4M14.9 14.9l-1.4-1.4M6.5 6.5 5.1 5.1" />
              </svg>
            </button>

            <div className={`pop pop--up ${avatarPopOpen ? 'is-open' : ''}`} role="menu" aria-label="Account">
              <button className="acct__item" role="menuitem" onClick={() => { setAvatarPopOpen(false); onBackToLanding(); }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M2.5 8h11M6.5 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Landing Page
              </button>
              <button className="acct__item" role="menuitem" onClick={() => setAvatarPopOpen(false)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <circle cx="8" cy="5.5" r="2.5" />
                  <path d="M3 13.5c.7-2.7 2.7-4 5-4s4.3 1.3 5 4" />
                </svg>
                Profile
              </button>
              <button className="acct__item" role="menuitem" onClick={() => setAvatarPopOpen(false)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <circle cx="5.5" cy="6" r="2" />
                  <circle cx="11" cy="6" r="2" />
                  <path d="M2 13c.4-2 1.7-3 3.5-3s3.1 1 3.5 3M8.6 10c1.6 0 2.7 1 3 3" />
                </svg>
                Team
              </button>
              <button className="acct__item" role="menuitem" onClick={() => { setAvatarPopOpen(false); setCustomizeOpen(true); }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="2.2" />
                  <path d="M8 2.5v1.6M8 12v1.6M13.5 8h-1.6M4 8H2.5M12 4l-1.1 1.1M5.1 10.9 4 12M12 12l-1.1-1.1M5.1 5.1 4 4" />
                </svg>
                Settings &amp; Customize
              </button>
              <div className="acct__div"></div>
              <button className="acct__item" role="menuitem" onClick={onBackToLanding}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 14H3.5v-12H6M11 11l3-3-3-3M14 8H6" />
                </svg>
                Exit to Landing
              </button>
            </div>
          </div>
        </aside>

        {/* ============ Main Column ============ */}
        <div className="main">
          <header className="topbar">
            <div className="topbar__left">
              <button className="menuBtn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" aria-expanded={sidebarOpen}>
                <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M3.5 6.5h15M3.5 11h15M3.5 15.5h15" />
                </svg>
              </button>
              <div className="topbar__brand" onClick={onBackToLanding} title="Back to landing page">
                <span className="topbar__brand-name">x0a</span>
                <span className="topbar__brand-sep" aria-hidden="true">·</span>
                <p className="crumb">Home</p>
              </div>
            </div>

            <div className="topbar__right">
              <button
                type="button"
                className="btn-ghost"
                onClick={onBackToLanding}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', marginRight: '0.4rem' }}
              >
                Landing
              </button>

              <button
                className="bell"
                type="button"
                data-tip="Notifications"
                data-tip-pos="bottom"
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-haspopup="dialog"
                aria-expanded={notifPopOpen}
                onClick={() => setNotifPopOpen(!notifPopOpen)}
              >
                <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5.4 15.2v-4.8a5.6 5.6 0 0 1 11.2 0v4.8l1.5 1.6H3.9Z" />
                  <path d="M9 19.2a2.2 2.2 0 0 0 4 0" />
                </svg>
                <span className={`bell__badge ${unreadCount > 0 ? 'is-visible' : ''}`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </button>

              <div className={`pop pop--notif ${notifPopOpen ? 'is-open' : ''}`} role="dialog" aria-label="Notifications">
                <div className="notif__head">
                  <h2>Notifications</h2>
                  <button
                    type="button"
                    className="notif__markAll"
                    disabled={unreadCount === 0}
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="notif__tabs">
                  <div className="seg" role="group" aria-label="Filter notifications">
                    <button
                      type="button"
                      aria-pressed={notifFilter === 'all'}
                      onClick={() => setNotifFilter('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      aria-pressed={notifFilter === 'unread'}
                      onClick={() => setNotifFilter('unread')}
                    >
                      Unread<em>{unreadCount ? unreadCount : ''}</em>
                    </button>
                  </div>
                </div>

                <ul className="notif__list" hidden={displayedNotifs.length === 0}>
                  {displayedNotifs.map(n => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={`nitem ${n.unread ? 'is-unread' : ''}`}
                        data-tone={n.type === 'incident' ? 'bad' : n.type === 'deploy' ? 'ok' : 'warn'}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <span className="nitem__icon">
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="10" cy="10" r="7" />
                            <path d="M10 6v5l3 2" />
                          </svg>
                        </span>
                        <span className="nitem__body">
                          <span className="nitem__title">{n.title}</span>
                          <span className="nitem__text">{n.text}</span>
                          <span className="nitem__proj">{n.project}</span>
                        </span>
                        <span className="nitem__side">
                          <span className="nitem__time">{formatAgo(n.mins)}</span>
                          {n.unread && <span className="nitem__dot" aria-hidden="true"></span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={`notif__empty ${displayedNotifs.length === 0 ? 'is-visible' : ''}`}>
                  <span className="notif__emptyIcon">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="10" cy="10" r="6.9" />
                      <path d="m6.9 10.2 2.2 2.2 4-4.4" />
                    </svg>
                  </span>
                  <b>You’re all caught up</b>
                  <p>Nothing unread right now. Earlier alerts are under All.</p>
                  <button type="button" className="btn-ghost" onClick={() => setNotifFilter('all')}>
                    Show all alerts
                  </button>
                </div>

                <div className="notif__foot">
                  <button
                    type="button"
                    className="notif__settings"
                    onClick={() => {
                      setNotifPopOpen(false);
                      setCustomizeOpen(true);
                    }}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M3 6.2h6.4M12.6 6.2H17" />
                      <circle cx="10.8" cy="6.2" r="1.7" />
                      <path d="M3 10.4h2.4M8.6 10.4H17" />
                      <circle cx="7" cy="10.4" r="1.7" />
                      <path d="M3 14.6h9M14.8 14.6H17" />
                      <circle cx="13.1" cy="14.6" r="1.7" />
                    </svg>
                    Notification settings
                    <span>{Object.values(notifEvents).filter(Boolean).length} of 9 events</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="content">
            <div className="home">
              <h1 className="home__title display">
                <span>Describe the smart contract.</span>
                <span>x0a engineers it end to end.</span>
              </h1>
              <p className="home__lede">
                An AI smart contract engineer for every major chain. Specification, threat model, contract code, tests, security review, simulation, wallet approval, deployment, verification and monitoring — one lifecycle, evidence at every gate.
              </p>

              {/* ---- Composer ---- */}
              <div className="composer glass" id="composer" ref={composerRef}>
                <div className="composer__tabs" role="tablist" aria-label="What are we starting">
                  {(['new', 'analyze', 'deployment', 'import'] as const).map(mode => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={composerMode === mode}
                      onClick={() => setComposerMode(mode)}
                    >
                      {mode === 'new' && 'Start new project'}
                      {mode === 'analyze' && 'Analyze existing project'}
                      {mode === 'deployment' && 'Analyze existing deployment'}
                      {mode === 'import' && 'Import project'}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  rows={3}
                  aria-label="Smart contract description"
                  placeholder={MODES[composerMode].ph}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                />

                <div className="composer__row">
                  {(['source', 'zip', 'repo', 'address'] as const).map(tool => {
                    const isVis = MODES[composerMode].tools.includes(tool);
                    return (
                      <button
                        key={tool}
                        className={`tool ${isVis ? 'is-visible' : ''}`}
                        data-tool={tool}
                        data-tip={`Upload ${tool}`}
                        onClick={() => alert(`${tool.toUpperCase()} input option selected.`)}
                      >
                        {tool === 'source' && 'Source'}
                        {tool === 'zip' && 'ZIP'}
                        {tool === 'repo' && 'Repository'}
                        {tool === 'address' && 'Address'}
                      </button>
                    );
                  })}

                  <div className="eco-picker" role="group" aria-label="Ecosystem">
                    {[
                      { id: 'auto', label: 'Auto-detect' },
                      { id: 'evm', label: 'EVM' },
                      { id: 'solana', label: 'Solana' },
                      { id: 'sui', label: 'Sui' },
                      { id: 'aptos', label: 'Aptos' },
                      { id: 'cosmos', label: 'Cosmos' },
                      { id: 'starknet', label: 'Starknet' },
                      { id: 'near', label: 'NEAR' },
                      { id: 'polkadot', label: 'Polkadot' },
                      { id: 'cardano', label: 'Cardano' }
                    ].map(eco => (
                      <button
                        key={eco.id}
                        className="chip"
                        aria-pressed={selectedEco === eco.id}
                        onClick={() => setSelectedEco(eco.id)}
                      >
                        <b>{eco.label}</b>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="composer__foot">
                  <p className="composer__hint">{currentHint}</p>
                  <button
                    className="send"
                    disabled={promptText.trim().length === 0}
                    aria-label="Start project"
                    onClick={() => {
                      alert(`Project initialized with prompt: "${promptText}". Proceeding to specification & threat model generation!`);
                    }}
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10h12M11 5l5 5-5 5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ---- Suggestion strip ---- */}
              <div
                className="suggest"
                role="button"
                tabIndex={0}
                aria-label="Use this example as your prompt"
                onClick={() => focusComposerWithPrompt(PROMPTS[promptIdx].q)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    focusComposerWithPrompt(PROMPTS[promptIdx].q);
                  }
                }}
              >
                <span className="suggest__tag">Try</span>
                <span className="suggest__text">
                  <span>{typedPrompt}</span>
                </span>
                <div className="suggest__chips" aria-hidden="true">
                  <ul className="suggest__set is-on">
                    {PROMPTS[promptIdx].tags.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ---- Recent projects ---- */}
              <section className="recent">
                <div className="recent__head">
                  <h2>Continue where you left off</h2>
                  <button className="recent__all" onClick={() => setSidebarOpen(true)}>View all projects</button>
                </div>
                <div className="recent__grid">
                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 2 17 10 10 18 3 10Z" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">EVM · Base</span>
                      <span className="pcard__lvl">L8 · Full engineering</span>
                    </div>
                    <p className="pcard__title">Yield Vault</p>
                    <p className="pcard__kind">Vault contract · Solidity</p>
                    <p className="pcard__status ok"><i></i>Awaiting wallet approval — security gate passed</p>
                    <div className="pcard__meta"><span>Testnet</span><span>12m ago</span></div>
                  </article>

                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                          <path d="M3 6.5h12M5.5 10h12M3 13.5h12" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">Solana · SVM</span>
                      <span className="pcard__lvl">L8 · Full engineering</span>
                    </div>
                    <p className="pcard__title">Liquid Staking Program</p>
                    <p className="pcard__kind">Staking program · Rust / Anchor</p>
                    <p className="pcard__status warn"><i></i>2 findings to review before rebuild</p>
                    <div className="pcard__meta"><span>Devnet</span><span>2h ago</span></div>
                  </article>

                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 2 17 10 10 18 3 10Z" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">EVM · Arbitrum</span>
                      <span className="pcard__lvl">L8 · Full engineering</span>
                    </div>
                    <p className="pcard__title">Perp Router</p>
                    <p className="pcard__kind">Upgradeable router contracts · Solidity</p>
                    <p className="pcard__status ok"><i></i>Monitoring active, no open alerts</p>
                    <div className="pcard__meta"><span>Mainnet</span><span>1d ago</span></div>
                  </article>

                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 2.4c3 3.9 5.4 7.1 5.4 10a5.4 5.4 0 1 1-10.8 0c0-2.9 2.4-6.1 5.4-10Z" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">Sui · Move</span>
                      <span className="pcard__lvl">L7 · Monitor</span>
                    </div>
                    <p className="pcard__title">Object Marketplace</p>
                    <p className="pcard__kind">Marketplace package · Move</p>
                    <p className="pcard__status ok"><i></i>Verified, monitoring is starting up</p>
                    <div className="pcard__meta"><span>Testnet</span><span>3d ago</span></div>
                  </article>

                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 2 11.9 8.1 18 10 11.9 11.9 10 18 8.1 11.9 2 10 8.1 8.1Z" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">Starknet · Cairo</span>
                      <span className="pcard__lvl">L4 · Simulate</span>
                    </div>
                    <p className="pcard__title">Options Vault</p>
                    <p className="pcard__kind">Vault contract · Cairo</p>
                    <p className="pcard__status warn"><i></i>Fork simulation queued</p>
                    <div className="pcard__meta"><span>Testnet</span><span>4d ago</span></div>
                  </article>

                  <article className="pcard">
                    <div className="pcard__top">
                      <span className="pcard__eco">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                          <circle cx="6.6" cy="7.2" r="2.5" />
                          <circle cx="13.4" cy="7.2" r="2.5" />
                          <circle cx="10" cy="13.6" r="2.5" />
                        </svg>
                      </span>
                      <span className="pcard__eco-name">Cardano · eUTxO</span>
                      <span className="pcard__lvl">L7 · Monitor</span>
                    </div>
                    <p className="pcard__title">Treasury Timelock</p>
                    <p className="pcard__kind">Timelock validator · Aiken</p>
                    <p className="pcard__status bad"><i></i>Incident under review — anomalous withdrawal</p>
                    <div className="pcard__meta"><span>Testnet</span><span>6d ago</span></div>
                  </article>
                </div>
              </section>

              {/* ---- Smart Contract Kinds ---- */}
              <section className="ecostrip ecostrip--kinds" aria-labelledby="kindsLabel">
                <p className="ecostrip__label" id="kindsLabel">Any kind of smart contract</p>
                <div className="ecostrip__list">
                  {[
                    { label: 'Tokens', prompt: 'Build a fungible token with a capped supply, role-based minting and a pause switch.' },
                    { label: 'NFTs', prompt: 'Create an NFT collection with allowlist minting and creator royalties.' },
                    { label: 'Vaults & staking', prompt: 'Build a yield vault that takes deposits, issues shares and streams rewards.' },
                    { label: 'Lending', prompt: 'Build an overcollateralized lending market with liquidations and an oracle price feed.' },
                    { label: 'AMMs & DEXs', prompt: 'Create a constant-product AMM with configurable fees and slippage protection.' },
                    { label: 'Perps & options', prompt: 'Build a perpetuals exchange with an oracle-priced funding rate and liquidations.' },
                    { label: 'Escrow & payments', prompt: 'Create an escrow contract that releases funds on milestones, with a dispute window.' },
                    { label: 'DAOs & governance', prompt: 'Build a DAO with token-weighted voting, a treasury and a timelock.' },
                    { label: 'Marketplaces & auctions', prompt: 'Build a marketplace with English auctions and creator royalties.' },
                    { label: 'Bridges & messaging', prompt: 'Build a cross-chain messaging integration with replay protection and finality checks.' },
                    { label: 'Custom logic', prompt: '' }
                  ].map((kind, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="kind-tag"
                      onClick={() => focusComposerWithPrompt(kind.prompt || 'Design a custom smart contract architecture with specialized invariants and access control.')}
                    >
                      {kind.label}
                    </button>
                  ))}
                </div>
                <p className="ecostrip__note">Tap one to start from an example. These are starting points, not limits — describe any custom on-chain logic and x0a builds it.</p>
              </section>

              {/* ---- Ecosystem strip ---- */}
              <section className="ecostrip">
                <p className="ecostrip__label">Native smart contracts for every major ecosystem</p>
                <div className="ecostrip__list">
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="M10 2 17 10 10 18 3 10Z" /></svg></i>EVM<em>Solidity</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3 6.5h12M5.5 10h12M3 13.5h12" /></svg></i>Solana<em>Rust · Anchor</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="M10 2.4c3 3.9 5.4 7.1 5.4 10a5.4 5.4 0 1 1-10.8 0c0-2.9 2.4-6.1 5.4-10Z" /></svg></i>Sui<em>Move</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 17.3 16.2H2.7Z" /></svg></i>Aptos<em>Move</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><circle cx="10" cy="10" r="1.6" fill="currentColor" /></svg></i>Cosmos<em>CosmWasm</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" aria-hidden="true"><path d="M10 2 11.9 8.1 18 10 11.9 11.9 10 18 8.1 11.9 2 10 8.1 8.1Z" /></svg></i>Starknet<em>Cairo</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M4.2 16V9.2a5.8 5.8 0 0 1 11.6 0V16" /></svg></i>NEAR<em>Rust · WASM</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="10" cy="4.2" r="1.7" fill="currentColor" /></svg></i>Polkadot<em>EVM · PolkaVM</em></span>
                  <span className="eco-tag"><i><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="6.6" cy="7.2" r="2.5" /><circle cx="13.4" cy="7.2" r="2.5" /></svg></i>Cardano<em>Plutus · Aiken</em></span>
                </div>
                <p className="ecostrip__note">And more through the Adapter SDK — Internet Computer, Tezos, Algorand, Hedera, Fuel, Stellar Soroban, TON — new chains, VMs and contract languages plug in without a rewrite of the core lifecycle.</p>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* ============ Customize Modal ============ */}
      <div
        className={`modalScrim ${customizeOpen ? 'is-open' : ''}`}
        onClick={() => setCustomizeOpen(false)}
      ></div>
      <div
        className={`modal ${customizeOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customizeTitle"
      >
        <div className="modal__panel glass" tabIndex={-1}>
          <div className="modal__head">
            <div>
              <h2 id="customizeTitle">Customize x0a</h2>
              <p>Defaults for new projects, your security policy, and how x0a reaches you. Wallet, RPC and team settings live under Settings.</p>
            </div>
            <button className="modal__close" onClick={() => setCustomizeOpen(false)} aria-label="Close customize">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
              </svg>
            </button>
          </div>

          <div className="modal__body">
            <section className="mset">
              <h3>Project defaults</h3>
              <p className="mset__hint">Applied the moment you start a new project from Home — override any of it per project, any time.</p>
              <div className="mset__row">
                <label>Default ecosystem</label>
                <div className="eco-picker" role="group" aria-label="Default ecosystem" style={{ overflowX: 'visible', flexWrap: 'wrap' }}>
                  {['auto', 'evm', 'solana', 'sui', 'aptos', 'cosmos', 'starknet', 'near', 'polkadot', 'cardano'].map(eco => (
                    <button
                      key={eco}
                      type="button"
                      className="chip"
                      aria-pressed={defaultEco === eco}
                      onClick={() => setDefaultEco(eco)}
                    >
                      <b>{eco === 'auto' ? 'Auto-detect' : eco.toUpperCase()}</b>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mset__row">
                <label>Default network</label>
                <div className="seg" role="group" aria-label="Default network">
                  {['Devnet', 'Testnet', 'Mainnet'].map(net => (
                    <button
                      key={net}
                      type="button"
                      aria-pressed={defaultNet === net}
                      onClick={() => setDefaultNet(net)}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="mset">
              <h3>Security &amp; verification policy</h3>
              <p className="mset__hint">The deployment gate is deterministic and sits outside any AI agent. These are the same knobs as the policy engine, scoped to your projects — changes are written to the audit trail.</p>
              <div className="mset__toggleRow">
                <div>
                  <b>Block deployment on HIGH severity findings</b>
                  <span>CRITICAL findings always block deployment — that part isn't configurable. Turning this off still requires an explicit, auditable security exception per finding.</span>
                </div>
                <button
                  type="button"
                  className={`switch ${blockHigh ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={blockHigh}
                  onClick={() => setBlockHigh(!blockHigh)}
                ></button>
              </div>
              <div className="mset__row" style={{ marginTop: '0.9rem' }}>
                <label>Verification depth</label>
                <div className="seg" role="group" aria-label="Verification depth">
                  {['Standard', 'Adaptive'].map(depth => (
                    <button
                      key={depth}
                      type="button"
                      aria-pressed={verifyDepth === depth}
                      onClick={() => setVerifyDepth(depth)}
                    >
                      {depth}
                    </button>
                  ))}
                </div>
                <p className="mset__hint" style={{ margin: '0.6rem 0 0' }}>
                  Adaptive escalates fuzzing, simulation, reviewer agents and approval requirements automatically when risk signals appear — value at risk, upgradeability, oracle dependence, custom cryptography and more. x0a explains why the extra checks were triggered.
                </p>
              </div>
              <div className="mset__info">
                <span>Auto-fix attempts before manual intervention</span>
                <b>3 · fixed</b>
              </div>
            </section>

            <section className="mset" id="notifSection">
              <h3>Notifications</h3>
              <p className="mset__hint">Alerts are delivered in-app for now. Email, Webhook, Discord, Slack and Telegram are coming soon. Choose what's worth interrupting you for.</p>
              <div className="mset__chips" role="group" aria-label="Notification channels">
                <span className="chip is-fixed">In-app</span>
                {['email', 'webhook', 'discord', 'slack', 'telegram'].map(ch => (
                  <button
                    key={ch}
                    type="button"
                    className="chip is-soon"
                    onClick={() => {
                      setChannelNotice(`${ch.toUpperCase()} delivery is coming soon. Alerts stay in-app for now.`);
                      setTimeout(() => setChannelNotice(''), 3000);
                    }}
                  >
                    {ch.charAt(0).toUpperCase() + ch.slice(1)}<em>Soon</em>
                  </button>
                ))}
              </div>
              {channelNotice && <p className="mset__soon">{channelNotice}</p>}
              <ul className="mset__events">
                {[
                  { key: 'critical', label: 'Critical or high security finding' },
                  { key: 'wallet', label: 'Deployment awaiting your signature' },
                  { key: 'incident', label: 'Incident detected' },
                  { key: 'build', label: 'Build or test failure' },
                  { key: 'deploy', label: 'Deployment success' },
                  { key: 'verify', label: 'Verification failure' },
                  { key: 'authority', label: 'Authority change' },
                  { key: 'upgrade', label: 'Upgrade event' },
                  { key: 'anomaly', label: 'Monitoring anomaly' }
                ].map(ev => (
                  <li key={ev.key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!notifEvents[ev.key]}
                        onChange={e => setNotifEvents(prev => ({ ...prev, [ev.key]: e.target.checked }))}
                      />
                      {ev.label}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="modal__foot">
            <button className="btn-ghost" onClick={handleResetPreferences}>Reset to defaults</button>
            <span className={`modal__savedHint ${savedHintVisible ? 'is-visible' : ''}`}>Saved — applies to new projects</span>
            <button className="btn-primary" onClick={handleSavePreferences}>Save preferences</button>
          </div>
        </div>
      </div>
    </div>
  );
}
