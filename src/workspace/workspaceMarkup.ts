export const workspaceMarkup = `
<div aria-hidden="true" class="glow"><i></i><i></i></div>
<div aria-hidden="true" class="grain"></div>
<div class="scrim" id="scrim"></div>
<!-- ============ Pre-workspace intake — Requirement Agent ============ -->
<div aria-label="Project intake" class="onboard" id="onboard" role="dialog">
<div class="onboard__head">
<div class="onboard__brand"><span>x0a</span><em>&middot; New project</em></div>
<span class="onboard__proj" id="onboardProject">New project</span>
<span class="onboard__eco" id="onboardEcosystem">Specification</span>
<div aria-hidden="true" class="onboard__steps" id="onboardSteps"></div>
</div>
<div class="onboard__body">
<div class="onboard__log msgList" id="onboardLog"></div>
</div>
<div class="onboard__foot">
<div class="onboard__foot-inner" id="onboardFootInner">
<div class="qrChips" id="onboardChips"></div>
<form class="onboard__composer" id="onboardForm">
<input autocomplete="off" id="onboardInput" placeholder="Describe a change to the specification&hellip;" type="text"/>
<button aria-label="Send" class="onboard__send" id="onboardSend" type="submit">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 20 20"><path d="M3 10h14M11 4l6 6-6 6"></path></svg>
</button>
</form>
</div>
</div>
</div>
<div class="shell" id="shell">
<!-- ============ Sidebar (identical to Home) ============ -->
<aside aria-label="Primary" class="sidebar" id="sidebar">
<div class="sidebar__head">
<a aria-label="x0a home" class="sidebar__brand" href="x0a-home.html">
<span>x0a</span>
</a>
<button aria-label="Close sidebar" class="sidebar__closeMobile" id="closeSidebarBtn">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 20 20"><path d="m5.5 5.5 9 9M14.5 5.5l-9 9"></path></svg>
</button>
</div>
<div class="sidebar__actions">
<button class="sbtn sbtn--new" data-tip="New project">
<span class="sbtn__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 20 20"><circle cx="10" cy="10" r="6.8"></circle><path d="M10 6.8v6.4M6.8 10h6.4"></path></svg></span>
<span class="sbtn__label">New project</span>
</button>
<label class="sbtn sbtn--search" data-tip="Search" for="sidebarSearch">
<span class="sbtn__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 20 20"><circle cx="9" cy="9" r="5.4"></circle><path d="m17 17-3.6-3.6"></path></svg></span>
<input aria-label="Search projects" autocomplete="off" class="sbtn__input" id="sidebarSearch" placeholder="Search projects" type="text"/>
</label>
<button class="sbtn sbtn--customize" data-tip="Customize">
<span class="sbtn__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 20 20"><path d="M3 6.2h6.4M12.6 6.2H17"></path><circle cx="10.8" cy="6.2" r="1.7"></circle><path d="M3 10.4h2.4M8.6 10.4H17"></path><circle cx="7" cy="10.4" r="1.7"></circle><path d="M3 14.6h9M14.8 14.6H17"></path><circle cx="13.1" cy="14.6" r="1.7"></circle></svg></span>
<span class="sbtn__label">Customize</span>
</button>
</div>
<hr class="sidebar__rule"/>
<div class="sidebar__projects">
<div class="sidebar__projectsHead">
<span>Projects</span>
<a class="sidebar__viewAll" href="#">View all</a>
</div>
<ul class="plist" id="projectList">
<li><button class="plist__item is-active" data-title="Yield Vault">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 20 20"><path d="M10 2 17 10 10 18 3 10Z"></path></svg></span>
<span class="plist__body"><b>Yield Vault</b><span>Awaiting wallet approval</span></span>
<span class="plist__time">12m</span>
</button></li>
<li><button class="plist__item" data-title="Liquid Staking Program">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 20 20"><path d="M3 6.5h12M5.5 10h12M3 13.5h12"></path></svg></span>
<span class="plist__body"><b>Liquid Staking Program</b><span>2 findings to review</span></span>
<span class="plist__time">2h</span>
</button></li>
<li><button class="plist__item" data-title="Perp Router">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 20 20"><path d="M10 2 17 10 10 18 3 10Z"></path></svg></span>
<span class="plist__body"><b>Perp Router</b><span>Monitoring active, no alerts</span></span>
<span class="plist__time">1d</span>
</button></li>
<li><button class="plist__item" data-title="Object Marketplace">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 20 20"><path d="M10 2.4c3 3.9 5.4 7.1 5.4 10a5.4 5.4 0 1 1-10.8 0c0-2.9 2.4-6.1 5.4-10Z"></path></svg></span>
<span class="plist__body"><b>Object Marketplace</b><span>Verified, monitoring starting</span></span>
<span class="plist__time">3d</span>
</button></li>
<li><button class="plist__item" data-title="Options Vault">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.15" viewbox="0 0 20 20"><path d="M10 2 11.9 8.1 18 10 11.9 11.9 10 18 8.1 11.9 2 10 8.1 8.1Z"></path></svg></span>
<span class="plist__body"><b>Options Vault</b><span>Fork simulation queued</span></span>
<span class="plist__time">4d</span>
</button></li>
<li><button class="plist__item" data-title="Treasury Timelock">
<span class="plist__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2" viewbox="0 0 20 20"><circle cx="6.6" cy="7.2" r="2.5"></circle><circle cx="13.4" cy="7.2" r="2.5"></circle><circle cx="10" cy="13.6" r="2.5"></circle></svg></span>
<span class="plist__body"><b>Treasury Timelock</b><span>Incident opened &mdash; anomalous withdrawal</span></span>
<span class="plist__time">6d</span>
</button></li>
</ul>
</div>
<div class="sidebar__foot">
<button aria-controls="avatarPop" aria-expanded="false" aria-haspopup="menu" class="sidebar__user" id="avatarBtn">
<i>AR</i>
<span><b>Alex Rivera</b><span>Owner &middot; Personal</span></span>
</button>
<button aria-label="Settings" class="sidebar__gear">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 20 20"><circle cx="10" cy="10" r="2.7"></circle><path d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.9 5.1l-1.4 1.4M6.5 13.5l-1.4 1.4M14.9 14.9l-1.4-1.4M6.5 6.5 5.1 5.1"></path></svg>
</button>
<div aria-label="Account" class="pop pop--up" id="avatarPop" role="menu">
<a class="acct__item" href="#" role="menuitem"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" viewbox="0 0 16 16"><circle cx="8" cy="5.5" r="2.5"></circle><path d="M3 13.5c.7-2.7 2.7-4 5-4s4.3 1.3 5 4"></path></svg>Profile</a>
<a class="acct__item" href="#" role="menuitem"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" viewbox="0 0 16 16"><circle cx="5.5" cy="6" r="2"></circle><circle cx="11" cy="6" r="2"></circle><path d="M2 13c.4-2 1.7-3 3.5-3s3.1 1 3.5 3M8.6 10c1.6 0 2.7 1 3 3"></path></svg>Team</a>
<a class="acct__item" href="#" role="menuitem"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 16 16"><circle cx="8" cy="8" r="2.2"></circle><path d="M8 2.5v1.6M8 12v1.6M13.5 8h-1.6M4 8H2.5M12 4l-1.1 1.1M5.1 10.9 4 12M12 12l-1.1-1.1M5.1 5.1 4 4"></path></svg>Settings</a>
<div class="acct__div"></div>
<a class="acct__item" href="#" role="menuitem"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 16 16"><path d="M6 14H3.5v-12H6M11 11l3-3-3-3M14 8H6"></path></svg>Sign out</a>
</div>
</div>
</aside>
<!-- ============ Main column ============ -->
<div class="main">
<header class="topbar">
<div class="topbar__left">
<button aria-controls="sidebar" aria-expanded="false" aria-label="Open sidebar" class="menuBtn" id="menuToggle">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 22 22"><path d="M3.5 6.5h15M3.5 11h15M3.5 15.5h15"></path></svg>
</button>
<div class="topbar__brand">
<span class="topbar__brand-name">x0a</span>
<span aria-hidden="true" class="topbar__brand-sep">&middot;</span>
<p class="crumb">Yield Vault<span class="crumb__eco">EVM &middot; Base</span></p>
</div>
</div>
<div class="topbar__right">
<button aria-controls="notifPop" aria-expanded="false" aria-haspopup="dialog" aria-label="Notifications" class="bell" data-tip="Notifications" id="notifBtn" type="button">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 22 22"><path d="M5.4 15.2v-4.8a5.6 5.6 0 0 1 11.2 0v4.8l1.5 1.6H3.9Z"></path><path d="M9 19.2a2.2 2.2 0 0 0 4 0"></path></svg>
<span aria-hidden="true" class="bell__badge" id="notifBadge"></span>
</button>
<div aria-label="Notifications" class="pop pop--notif" id="notifPop" role="dialog">
<div class="notif__head"><h2>Notifications</h2></div>
<ul class="notif__list">
<li class="nitem" data-tone="ok">
<span class="nitem__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="m5 10 3.2 3.2L15 6.5"></path></svg></span>
<span class="nitem__body"><span class="nitem__title">Security gate passed</span><span class="nitem__text">Yield Vault cleared spec, tests, security, simulation and policy.</span></span>
<span class="nitem__time">12m</span>
</li>
<li class="nitem" data-tone="warn">
<span class="nitem__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="M10 3.6 17.5 16H2.5Z"></path><path d="M10 8.2v3.4"></path><circle cx="10" cy="14.1" fill="currentColor" r=".2"></circle></svg></span>
<span class="nitem__body"><span class="nitem__title">Wallet approval requested</span><span class="nitem__text">Deployment to Base Sepolia is ready and waiting on your Safe.</span></span>
<span class="nitem__time">12m</span>
</li>
<li class="nitem">
<span class="nitem__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 20 20"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.5v4l2.6 1.6"></path></svg></span>
<span class="nitem__body"><span class="nitem__title">Fork simulation completed</span><span class="nitem__text">4 scenarios passed on a pinned Base mainnet fork.</span></span>
<span class="nitem__time">1h</span>
</li>
</ul>
</div>
</div>
</header>
<!-- ============ Workspace toolbar ============ -->
<div class="wsToolbar">
<button aria-label="Open explorer" class="wsIconBtn explorerToggle" data-tip="Explorer" id="explorerToggle">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 20 20"><rect height="14" rx="2.5" width="15" x="2.5" y="3"></rect><path d="M8 3v14"></path></svg>
</button>
<div class="wsNav">
<button aria-label="Back" class="wsChevron" disabled=""><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="m12 4-6 6 6 6"></path></svg></button>
<button aria-label="Forward" class="wsChevron" disabled=""><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="m8 4 6 6-6 6"></path></svg></button>
</div>
<div aria-label="Workspace section" class="wsSwitch" id="wsSwitch" role="tablist">
<button aria-selected="true" data-section="workspace" role="tab">Workspace</button>
<button aria-selected="false" data-section="security" role="tab">Security</button>
<button aria-selected="false" data-section="simulation" role="tab">Simulation</button>
<button aria-selected="false" data-section="deployment" role="tab">Deployment</button>
<button aria-selected="false" data-section="monitoring" role="tab">Monitoring</button>
</div>
<div class="wsToolbar__right">
<button class="chip agentAsk" data-tip="Ask x0a to change this contract" data-tip-pos="bottom" id="agentAskBtn" type="button">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="M3.5 15.4V6.1a2.2 2.2 0 0 1 2.2-2.2h8.6a2.2 2.2 0 0 1 2.2 2.2v5.6a2.2 2.2 0 0 1-2.2 2.2H8L4.6 17Z"></path></svg>
<span>Ask agent</span>
</button>
<button class="chip envChip" data-tip="Environment" data-tip-pos="bottom"><span>Testnet</span><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 20 20"><path d="m5.5 8 4.5 4.5L14.5 8"></path></svg></button>
<button class="wsIconBtn" data-tip="Focus mode" data-tip-pos="bottom" id="focusToggle">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 20 20"><path d="M7 3H4a1 1 0 0 0-1 1v3M13 3h3a1 1 0 0 1 1 1v3M7 17H4a1 1 0 0 1-1-1v-3M13 17h3a1 1 0 0 0 1-1v-3"></path></svg>
</button>
<button aria-label="Open details" class="wsIconBtn opsToggle" data-tip="Details" data-tip-pos="bottom" id="opsToggle">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 20 20"><rect height="14" rx="2.5" width="15" x="2.5" y="3"></rect><path d="M12.5 3v14"></path></svg>
</button>
</div>
</div>
<!-- ============ Open document tabs ============ -->
<div class="wsTabs">
<button aria-label="Back to workspace" class="wsTabs__back" data-tip="Back to workspace" data-tip-pos="bottom" id="wsBack">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" viewbox="0 0 20 20"><path d="m11 4-6 6 6 6"></path></svg>
</button>
<div aria-label="Open documents" class="wsTabs__list" id="wsTabsList" role="tablist"></div>
<div class="wsTabs__meta">
<button class="wsIconBtn" id="wsCopyBtn" data-tip="Copy" data-tip-pos="bottom" style="width:30px;height:30px"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><rect height="9.1" rx="1.6" width="9.1" x="6.4" y="6.4"></rect><path d="M11.6 6.4V4.3a1.6 1.6 0 0 0-1.6-1.6H4.3a1.6 1.6 0 0 0-1.6 1.6v5.7a1.6 1.6 0 0 0 1.6 1.6h2.1"></path></svg></button>
<span class="branchBadge"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 20 20"><circle cx="6" cy="5" r="1.6"></circle><circle cx="6" cy="15" r="1.6"></circle><circle cx="14" cy="10" r="1.6"></circle><path d="M6 6.6v6.8M6 8.1c.9 2.1 3.6 2.3 6.1 1.3"></path></svg>spec v3 &middot; locked</span>
</div>
</div>
<!-- ============ Breadcrumb path ============ -->
<div class="wsPath" id="wsPath"><b>yield-vault</b><em>/</em><span>contracts</span><em>/</em><span>VaultCore.sol</span></div>
<!-- ============ Three-pane workspace ============ -->
<div class="workspace" id="workspaceBody">
<div class="scrim" id="wsScrim"></div>
<!-- ---- Explorer (left pane) ---- -->
<aside class="explorer" id="explorer">
<div class="explorer__head">
<span class="explorer__title">YIELD-VAULT</span>
<button aria-label="Close explorer" class="explorer__close" id="explorerClose">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 20 20"><path d="m5.5 5.5 9 9M14.5 5.5l-9 9"></path></svg>
</button>
</div>
<nav class="explorer__scroll" id="etree">
<div class="egroup">
<button aria-expanded="true" class="egroup__head"><svg aria-hidden="true" fill="currentColor" viewbox="0 0 10 10"><path d="M2 3l3 4 3-4Z"></path></svg>Engineering</button>
<ul class="egroup__list">
<li><button class="enode" data-view="specification"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M4 2.5h7l3 3v10H4Z"></path><path d="M11 2.5V6h3"></path></svg></span><span class="enode__label">Specification</span><em>v3</em></button></li>
<li><button class="enode" data-view="threat-model"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M9 2 15 4.4v4.2C15 12.6 12.4 15 9 16 5.6 15 3 12.6 3 8.6V4.4Z"></path></svg></span><span class="enode__label">Threat Model</span></button></li>
<li><button class="enode" data-view="architecture"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><rect height="5" width="5" x="2.5" y="3"></rect><rect height="5" width="5" x="10.5" y="3"></rect><rect height="4.5" width="5" x="6.5" y="10.5"></rect><path d="M5 8v2.5M13 8v2.5M9 8v2.5"></path></svg></span><span class="enode__label">Architecture</span></button></li>
<li><button class="enode" data-view="adrs"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M4 3.5h10M4 7h10M4 10.5h6"></path><path d="M4 14.5h4"></path></svg></span><span class="enode__label">ADRs</span><span class="ecount">4</span></button></li>
<li>
<button class="enode enode--folder is-open" data-toggle="source">
<span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><path d="m6 4 4 5-4 5"></path></svg></span>
<span class="enode__label">Source</span>
</button>
<ul class="efiles">
<li><button class="efile is-active" data-file="VaultCore.sol" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>VaultCore.sol</span></button></li>
<li><button class="efile" data-file="ShareToken.sol" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>ShareToken.sol</span></button></li>
<li><button class="efile" data-file="RewardsDistributor.sol" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>RewardsDistributor.sol</span></button></li>
<li><button class="efile" data-file="interfaces/IVault.sol" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>interfaces/IVault.sol</span></button></li>
<li><button class="efile" data-file="script/Deploy.s.sol" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>script/Deploy.s.sol</span></button></li>
<li><button class="efile" data-file="foundry.toml" data-view="editor"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg><span>foundry.toml</span></button></li>
</ul>
</li>
</ul>
</div>
<div class="egroup">
<button aria-expanded="true" class="egroup__head"><svg aria-hidden="true" fill="currentColor" viewbox="0 0 10 10"><path d="M2 3l3 4 3-4Z"></path></svg>Quality &amp; Security</button>
<ul class="egroup__list">
<li><button class="enode" data-view="dependencies"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M9 2 15 5.5v7L9 16 3 12.5v-7Z"></path><path d="M3 5.5 9 9l6-3.5M9 9v7"></path></svg></span><span class="enode__label">Dependencies</span></button></li>
<li><button class="enode" data-view="builds"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M3 14V8.5l6-4 6 4V14"></path><path d="M7 14v-4h4v4"></path></svg></span><span class="enode__label">Builds</span></button></li>
<li><button class="enode" data-view="tests"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg></span><span class="enode__label">Tests</span><span class="ecount ecount--ok">42/42</span></button></li>
<li><button class="enode" data-view="security"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M9 2 15 4.4v4.2C15 12.6 12.4 15 9 16 5.6 15 3 12.6 3 8.6V4.4Z"></path></svg></span><span class="enode__label">Security</span><span class="ecount ecount--warn">1</span></button></li>
<li><button class="enode" data-view="patches"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M5 9h8M9 5v8"></path><circle cx="9" cy="9" r="6.3"></circle></svg></span><span class="enode__label">Patches</span></button></li>
</ul>
</div>
<div class="egroup">
<button aria-expanded="true" class="egroup__head"><svg aria-hidden="true" fill="currentColor" viewbox="0 0 10 10"><path d="M2 3l3 4 3-4Z"></path></svg>Verification &amp; Ops</button>
<ul class="egroup__list">
<li><button class="enode" data-view="simulations"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M3 14.5 7 8l3 3.5 5-7"></path></svg></span><span class="enode__label">Simulations</span></button></li>
<li><button class="enode" data-view="artifacts"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M3 6.5h12v7H3Z"></path><path d="M3 6.5 9 3l6 3.5"></path></svg></span><span class="enode__label">Artifacts</span></button></li>
<li><button class="enode" data-view="deployments"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M9 2v9M5.5 8 9 11.5 12.5 8"></path><path d="M3.5 13v2h11v-2"></path></svg></span><span class="enode__label">Deployments</span></button></li>
<li><button class="enode" data-view="verification"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewbox="0 0 18 18"><path d="M9 2 15 4.4v4.2C15 12.6 12.4 15 9 16 5.6 15 3 12.6 3 8.6V4.4Z"></path><path d="m6.4 9 1.8 1.8 3.4-3.6"></path></svg></span><span class="enode__label">Verification</span></button></li>
<li><button class="enode" data-view="incidents"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><path d="M9 3.6 15.8 15H2.2Z"></path><path d="M9 7.4v3M9 12.6h.01"></path></svg></span><span class="enode__label">Incidents</span></button></li>
<li><button class="enode" data-view="audit"><span class="enode__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><span class="enode__label">Audit Trail</span></button></li>
</ul>
</div>
</nav>
</aside>
<!-- ---- Center pane ---- -->
<div class="center">
<div class="centerScroll" id="centerScroll">
<!-- Specification -->
<section class="view" id="view-specification">
<div class="view__intro">
<h1 class="view__title">Specification <span class="lockBadge" id="specVersion">Generated from prompt</span></h1>
<p class="view__lede" id="specDescription">Generated from your project request. Refine the prompt to create a new version.</p>
</div>
<div class="fieldGrid" id="specFields">
<div class="field"><dt>Project</dt><dd id="specProject">Waiting for prompt</dd></div>
<div class="field"><dt>Ecosystem</dt><dd id="specEcosystem">&mdash;</dd></div>
<div class="field"><dt>Language &middot; Framework</dt><dd id="specLanguage">&mdash;<span id="specFramework"></span></dd></div>
<div class="field"><dt>Project type</dt><dd id="specKind">&mdash;</dd></div>
<div class="field"><dt>Target platform</dt><dd id="specTargets">&mdash;</dd></div>
<div class="field"><dt>Complexity</dt><dd id="specComplexity">&mdash;</dd></div>
</div>
<div class="docBlock">
<h3>Summary</h3>
<p id="specSummary" style="font-size:.85rem;color:var(--muted);line-height:1.65;max-width:68ch">Your prompt will be turned into a structured specification.</p>
</div>
<div class="docBlock">
<h3>Functional requirements</h3>
<ul class="docList" id="specFunctional"></ul>
</div>
<div class="docBlock">
<h3>Security requirements</h3>
<ul class="docList" id="specSecurity"></ul>
</div>
<div class="docBlock">
<h3>Out of scope</h3>
<ul class="docList" id="specOutOfScope"></ul>
</div>
<div class="docBlock">
<h3>Assumptions to confirm</h3>
<ul class="docList" id="specAssumptions"></ul>
</div>
</section>
<!-- Threat Model -->
<section class="view" id="view-threat-model">
<div class="view__intro">
<h1 class="view__title">Threat Model</h1>
<p class="view__lede">Generated from the locked specification before any code was written. Every finding in Security traces back to one of these entries.</p>
</div>
<div class="threatList">
<div class="threat">
<div class="threat__top"><span class="threat__id">TM-001</span><span class="threat__title">Share-price manipulation via first-deposit donation attack</span><span class="sevBadge sevBadge--high">High</span></div>
<div class="threat__row"><b>Asset</b>Share accounting (convertToShares / convertToAssets)</div>
<div class="threat__row"><b>Mitigation</b>Virtual shares and virtual assets offset (ADR-002)</div>
<div class="threat__row"><b>Status</b><span class="statusTag statusTag--resolved"><i></i>Resolved</span></div>
</div>
<div class="threat">
<div class="threat__top"><span class="threat__id">TM-002</span><span class="threat__title">Reentrancy on withdraw during an external asset transfer</span><span class="sevBadge sevBadge--critical">Critical</span></div>
<div class="threat__row"><b>Asset</b>VaultCore.withdraw</div>
<div class="threat__row"><b>Mitigation</b>Checks-effects-interactions ordering plus a reentrancy guard</div>
<div class="threat__row"><b>Status</b><span class="statusTag statusTag--resolved"><i></i>Resolved</span></div>
</div>
<div class="threat">
<div class="threat__top"><span class="threat__id">TM-003</span><span class="threat__title">Privileged role compromise (guardian or admin key)</span><span class="sevBadge sevBadge--high">High</span></div>
<div class="threat__row"><b>Asset</b>AccessControl roles</div>
<div class="threat__row"><b>Mitigation</b>Admin role held by a 2-of-3 Safe behind a timelock; guardian scoped to pause only</div>
<div class="threat__row"><b>Status</b><span class="statusTag statusTag--accepted"><i></i>Accepted residual risk</span></div>
</div>
<div class="threat">
<div class="threat__top"><span class="threat__id">TM-004</span><span class="threat__title">Stale or manipulated reward accrual input</span><span class="sevBadge sevBadge--medium">Medium</span></div>
<div class="threat__row"><b>Asset</b>RewardsDistributor.notifyReward</div>
<div class="threat__row"><b>Mitigation</b>Caller restricted to VaultCore; strategist reporting reviewed off-chain</div>
<div class="threat__row"><b>Status</b><span class="statusTag statusTag--resolved"><i></i>Resolved</span></div>
</div>
<div class="threat">
<div class="threat__top"><span class="threat__id">TM-005</span><span class="threat__title">Front-running deposits around a reward distribution</span><span class="sevBadge sevBadge--low">Low</span></div>
<div class="threat__row"><b>Asset</b>Deposit / notifyReward ordering</div>
<div class="threat__row"><b>Mitigation</b>None required &mdash; pull accounting bounds the benefit to one block</div>
<div class="threat__row"><b>Status</b><span class="statusTag statusTag--accepted"><i></i>Accepted</span></div>
</div>
</div>
</section>
<!-- Architecture -->
<section class="view" id="view-architecture">
<div class="view__intro">
<h1 class="view__title">Architecture</h1>
<p class="view__lede">Three contracts, one trust boundary at the admin/guardian roles. Native EVM semantics throughout &mdash; no custom VM assumptions.</p>
</div>
<div class="archDiagram">
<div class="archRow"><div class="archBox archBox--dim">Depositor wallet</div></div>
<div class="archArrowDown">&darr; deposit / withdraw</div>
<div class="archRow">
<div class="archBox archBox--dim">Admin Safe &middot; Timelock</div><div class="archArrow">&rarr;</div>
<div class="archBox archBox--accent">VaultCore.sol</div><div class="archArrow">&harr;</div>
<div class="archBox">ShareToken.sol</div>
</div>
<div class="archArrowDown">&darr; notifyReward</div>
<div class="archRow"><div class="archBox">RewardsDistributor.sol</div><div class="archArrow">&rarr;</div><div class="archBox archBox--dim">Depositor claim()</div></div>
<div class="archArrowDown">&varr; off-chain report</div>
<div class="archRow"><div class="archBox archBox--dim">Strategist-operated position</div></div>
</div>
<div class="docBlock">
<h3>Architecture Decision Records</h3>
<div class="adrList">
<div class="adr"><span class="adr__id">ADR-001</span><div style="flex:1"><b>Use an ERC-4626-style accounting model</b><p>Standard interface improves integrator familiarity and tooling support without locking in the upgradeable variant.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-002</span><div style="flex:1"><b>Virtual shares/assets offset instead of a dead-share mint</b><p>Removes the first-depositor donation attack (TM-001) without permanently burning value into an unrecoverable address.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-003</span><div style="flex:1"><b>Pull-based reward distribution</b><p>Depositors claim rewards explicitly; avoids unbounded gas loops from push-based distribution as depositor count grows.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-004</span><div style="flex:1"><b>Separate guardian (pause) from admin (timelocked) roles</b><p>An emergency pause must never wait on a timelock; admin changes to economic parameters should.</p></div><span class="adr__status">Accepted</span></div>
</div>
</div>
</section>
<!-- ADRs -->
<section class="view" id="view-adrs">
<div class="view__intro">
<h1 class="view__title">Architecture Decision Records</h1>
<p class="view__lede">Every ADR links back to a specification requirement and, where relevant, a threat-model entry.</p>
</div>
<div class="adrList">
<div class="adr"><span class="adr__id">ADR-001</span><div style="flex:1"><b>Use an ERC-4626-style accounting model</b><p>Standard interface improves integrator familiarity and tooling support without locking in the upgradeable variant. Linked to FR-01, FR-02.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-002</span><div style="flex:1"><b>Virtual shares/assets offset instead of a dead-share mint</b><p>Removes the first-depositor donation attack without permanently burning value into an unrecoverable address. Linked to SR-01, TM-001.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-003</span><div style="flex:1"><b>Pull-based reward distribution</b><p>Depositors claim rewards explicitly; avoids unbounded gas loops from push-based distribution as depositor count grows. Linked to FR-06.</p></div><span class="adr__status">Accepted</span></div>
<div class="adr"><span class="adr__id">ADR-004</span><div style="flex:1"><b>Separate guardian (pause) from admin (timelocked) roles</b><p>An emergency pause must never wait on a timelock; admin changes to economic parameters should. Linked to SR-03, TM-003.</p></div><span class="adr__status">Accepted</span></div>
</div>
</section>
<!-- Source / Editor -->
<section class="view" id="view-editor">
<div class="codefile is-active" data-file="VaultCore.sol">
<div class="code">
<div class="codeMetaBar"><span>contracts/VaultCore.sol</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="solidity"></div>
</div>
</div>
<div class="codefile" data-file="ShareToken.sol">
<div class="code">
<div class="codeMetaBar"><span>contracts/ShareToken.sol</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="solidity"></div>
</div>
</div>
<div class="codefile" data-file="RewardsDistributor.sol">
<div class="code">
<div class="codeMetaBar"><span>contracts/RewardsDistributor.sol</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="solidity"></div>
</div>
</div>
<div class="codefile" data-file="interfaces/IVault.sol">
<div class="code">
<div class="codeMetaBar"><span>contracts/interfaces/IVault.sol</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="solidity"></div>
</div>
</div>
<div class="codefile" data-file="script/Deploy.s.sol">
<div class="code">
<div class="codeMetaBar"><span>contracts/script/Deploy.s.sol</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="solidity"></div>
</div>
</div>
<div class="codefile" data-file="foundry.toml">
<div class="code">
<div class="codeMetaBar"><span>foundry.toml</span><span class="codeMetaRight"><span class="codeMeta">&mdash; lines</span><button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button><span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span></span></div>
<div class="codeBody" data-lang="toml"></div>
</div>
</div>
</section>
<!-- Raw sources, rendered + syntax highlighted client-side into the .codeBody blocks above -->
<script id="src-VaultCore.sol" type="text/plain">
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ShareToken } from "./ShareToken.sol";
import { IVault } from "./interfaces/IVault.sol";

/// @title VaultCore
/// @notice ERC-4626-style yield vault. Depositors receive ShareToken,
/// a pro-rata claim on vault assets. Yield is credited by an off-chain
/// strategist and streamed out through RewardsDistributor.
/// @dev Spec: yield-vault v3 (locked). Threat model: THREAT-MODEL.md.
contract VaultCore is IVault, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");

    // Virtual shares/assets mitigate the first-depositor donation attack.
    // See ADR-002 and threat-model TM-001.
    uint256 private constant VIRTUAL_SHARES = 1e3;
    uint256 private constant VIRTUAL_ASSETS = 1;

    IERC20 public immutable asset;
    ShareToken public immutable shares;
    address public rewardsDistributor;
    bool public paused;

    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event RewardsDistributorUpdated(address indexed previous, address indexed next);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    error ZeroAddress();
    error ZeroAmount();
    error VaultPaused();
    error InsufficientShares();

    modifier whenNotPaused() {
        if (paused) revert VaultPaused();
        _;
    }

    constructor(address _asset, address admin, address guardian) {
        if (_asset == address(0) || admin == address(0)) revert ZeroAddress();
        asset = IERC20(_asset);
        shares = new ShareToken(address(this));
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GUARDIAN_ROLE, guardian);
    }

    // — Deposits & withdrawals ---------------------------------------

    function deposit(uint256 assets, address receiver)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 sharesOut)
    {
        if (assets == 0) revert ZeroAmount();
        sharesOut = convertToShares(assets);
        asset.safeTransferFrom(msg.sender, address(this), assets);
        shares.mint(receiver, sharesOut);
        emit Deposit(msg.sender, receiver, assets, sharesOut);
    }

    function withdraw(uint256 sharesIn, address receiver, address owner)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 assetsOut)
    {
        if (sharesIn == 0) revert ZeroAmount();
        if (shares.balanceOf(owner) < sharesIn) revert InsufficientShares();
        assetsOut = convertToAssets(sharesIn);
        shares.burn(owner, sharesIn);
        asset.safeTransfer(receiver, assetsOut);
        emit Withdraw(msg.sender, owner, assetsOut, sharesIn);
    }

    // — Accounting -----------------------------------------------------

    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = shares.totalSupply();
        return (assets * (supply + VIRTUAL_SHARES)) / (totalAssets() + VIRTUAL_ASSETS);
    }

    function convertToAssets(uint256 sharesIn) public view returns (uint256) {
        uint256 supply = shares.totalSupply();
        return (sharesIn * (totalAssets() + VIRTUAL_ASSETS)) / (supply + VIRTUAL_SHARES);
    }

    // — Admin (guardian + timelock-gated) -------------------------------

    function setRewardsDistributor(address next) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (next == address(0)) revert ZeroAddress();
        emit RewardsDistributorUpdated(rewardsDistributor, next);
        rewardsDistributor = next;
    }

    function pause() external onlyRole(GUARDIAN_ROLE) {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
          </script>
<script id="src-ShareToken.sol" type="text/plain">
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ShareToken
/// @notice Accounting share for VaultCore depositors. Mint and burn
/// are restricted to the vault that deployed this token.
contract ShareToken is ERC20 {
    address public immutable vault;

    error OnlyVault();

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    constructor(address _vault) ERC20("Yield Vault Share", "yvSHARE") {
        vault = _vault;
    }

    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyVault {
        _burn(from, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
          </script>
<script id="src-RewardsDistributor.sol" type="text/plain">
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title RewardsDistributor
/// @notice Pull-based reward accounting for Yield Vault depositors.
/// @dev See ADR-003 for pull- vs. push-based distribution, and
/// threat-model TM-005 for front-running considerations.
contract RewardsDistributor {
    using SafeERC20 for IERC20;

    IERC20 public immutable rewardToken;
    address public immutable vault;

    uint256 public rewardPerShareStored;
    uint256 public lastUpdate;

    mapping(address => uint256) public rewardPerSharePaid;
    mapping(address => uint256) public rewards;

    error OnlyVault();
    error NothingToClaim();

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    constructor(address _rewardToken, address _vault) {
        rewardToken = IERC20(_rewardToken);
        vault = _vault;
    }

    function notifyReward(uint256 amount, uint256 totalShares) external onlyVault {
        if (totalShares == 0) return;
        rewardPerShareStored += (amount * 1e18) / totalShares;
        lastUpdate = block.timestamp;
    }

    function claim(address account, uint256 accountShares) external returns (uint256 owed) {
        uint256 delta = rewardPerShareStored - rewardPerSharePaid[account];
        owed = (accountShares * delta) / 1e18 + rewards[account];
        if (owed == 0) revert NothingToClaim();
        rewards[account] = 0;
        rewardPerSharePaid[account] = rewardPerShareStored;
        rewardToken.safeTransfer(account, owed);
    }
}
          </script>
<script id="src-interfaces/IVault.sol" type="text/plain">
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IVault
/// @notice Minimal external interface for Yield Vault integrations.
interface IVault {
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed owner, uint256 assets, uint256 shares);

    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function totalAssets() external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
}
          </script>
<script id="src-script/Deploy.s.sol" type="text/plain">
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "forge-std/Script.sol";
import { VaultCore } from "../VaultCore.sol";
import { RewardsDistributor } from "../RewardsDistributor.sol";

/// @notice Foundry deployment script for the Yield Vault system.
/// Broadcasts three contract creations and one initialize call.
/// Requires explicit wallet authorization — see Deployments.
contract Deploy is Script {
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7;

    function run() external {
        address admin = vm.envAddress("SAFE_ADDRESS");
        address guardian = vm.envAddress("GUARDIAN_ADDRESS");

        vm.startBroadcast();

        VaultCore vault = new VaultCore(USDC_BASE_SEPOLIA, admin, guardian);
        RewardsDistributor distributor = new RewardsDistributor(
            USDC_BASE_SEPOLIA,
            address(vault)
        );
        vault.setRewardsDistributor(address(distributor));

        vm.stopBroadcast();
    }
}
          </script>
<script id="src-foundry.toml" type="text/plain">
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.26"
evm_version = "cancun"
optimizer = true
optimizer_runs = 200
fs_permissions = [{ access = "read", path = "./out" }]

[rpc_endpoints]
base_sepolia = "\${BASE_SEPOLIA_RPC_URL}"
base_mainnet = "\${BASE_MAINNET_RPC_URL}"

[etherscan]
base_sepolia = { key = "\${BASESCAN_API_KEY}" }
          </script>
<!-- Dependencies -->
<section class="view" id="view-dependencies">
<div class="view__intro">
<h1 class="view__title">Dependencies</h1>
<p class="view__lede">Resolved and pinned per build. Each dependency is checked against known advisories before it reaches the security gate.</p>
</div>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Package</th><th>Version</th><th>Source</th><th>Audit status</th></tr></thead>
<tbody>
<tr><td>@openzeppelin/contracts</td><td class="mono">5.0.2</td><td class="tblMuted">npm</td><td><span class="statusTag statusTag--resolved"><i></i>No known advisories</span></td></tr>
<tr><td>solmate (ERC-4626 reference)</td><td class="mono">6.7.0</td><td class="tblMuted">npm</td><td><span class="statusTag statusTag--resolved"><i></i>No known advisories</span></td></tr>
<tr><td>forge-std</td><td class="mono">1.9.1</td><td class="tblMuted">git submodule</td><td><span class="tblMuted">Dev dependency only</span></td></tr>
<tr><td>@openzeppelin/contracts-upgradeable</td><td class="mono">&mdash;</td><td class="tblMuted">n/a</td><td><span class="tblMuted">Not used &mdash; vault is non-upgradeable by design</span></td></tr>
</tbody>
</table>
</div>
</section>
<!-- Builds -->
<section class="view" id="view-builds">
<div class="view__intro">
<h1 class="view__title">Builds</h1>
<p class="view__lede">Every build runs in an isolated worker with a pinned toolchain and produces a content-addressed artifact.</p>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;flex-wrap:wrap">
<button class="btn-primary" id="btnRunBuild" type="button" style="padding:.5rem 1rem;font-size:.8rem;font-weight:600">Trigger new build</button>
<span id="buildStatusMsg" style="font-size:.78rem;color:var(--muted)">Compiler: solc 0.8.26 (EVM Cancun)</span>
</div>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Build</th><th>Compiler</th><th>Status</th><th>Duration</th><th>Artifact</th></tr></thead>
<tbody id="buildsTableBody">
<tr><td class="mono">build_8f21c9</td><td class="tblMuted">solc 0.8.26</td><td><span class="statusTag statusTag--resolved"><i></i>Passed</span></td><td class="tblMuted">8.2s</td><td class="mono">0x9ac1f3&hellip;e30e</td></tr>
<tr><td class="mono">build_6b1229</td><td class="tblMuted">solc 0.8.26</td><td><span class="statusTag statusTag--resolved"><i></i>Passed</span></td><td class="tblMuted">7.6s</td><td class="mono">0x44b2a0&hellip;7c19</td></tr>
<tr><td class="mono">build_51ac4d</td><td class="tblMuted">solc 0.8.26</td><td><span class="statusTag statusTag--open"><i></i>Failed &mdash; stack too deep</span></td><td class="tblMuted">4.1s</td><td class="tblMuted">&mdash;</td></tr>
</tbody>
</table>
</div>
</section>
<!-- Tests -->
<section class="view" id="view-tests">
<div class="view__intro">
<h1 class="view__title">Tests</h1>
<p class="view__lede">Unit, integration and fuzz suites all passing. Invariant testing is not yet defined &mdash; flagged honestly rather than assumed.</p>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;flex-wrap:wrap">
<button class="btn-primary" id="btnRunTests" type="button" style="padding:.5rem 1rem;font-size:.8rem;font-weight:600">Run test suite</button>
<span id="testsStatusMsg" style="font-size:.78rem;color:var(--muted)">All test suites passing (Foundry engine)</span>
</div>
<div id="testConsoleLog" style="display:none;background:var(--raised);border:1px solid var(--line);border-radius:12px;padding:.8rem;margin-bottom:1.2rem;font-family:var(--mono);font-size:.74rem;line-height:1.6;max-height:12rem;overflow-y:auto"></div>
<div class="testGrid">
<div class="testCard ok"><b id="testCardUnit">28/28</b><span>Unit tests</span></div>
<div class="testCard ok"><b id="testCardInt">9/9</b><span>Integration tests</span></div>
<div class="testCard ok"><b>5/5</b><span>Fuzz properties &middot; 10,000 runs each</span></div>
<div class="testCard ok" id="testCardInv"><b>4/4</b><span>Invariant tests &middot; Passing</span></div>
<div class="testCard ok"><b>96%</b><span>Line coverage</span></div>
<div class="testCard ok"><b>91%</b><span>Branch coverage</span></div>
</div>
<div class="docBlock">
<h3>Test Verification Summary</h3>
<p style="font-size:.82rem;color:var(--muted);line-height:1.6;max-width:60ch">All tests execute in isolated Foundry runtime instances against Cancun EVM fork. Invariants confirm share-price monotonicity and conservation of assets.</p>
</div>
</section>
<!-- Security -->
<section class="view" id="view-security">
<div class="view__intro">
<h1 class="view__title">Security</h1>
<p class="view__lede">Security analysis scans contract bytecode and AST for known vulnerabilities, reentrancy vectors, and privilege leaks.</p>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;flex-wrap:wrap">
<button class="btn-primary" id="btnRunSecurity" type="button" style="padding:.5rem 1rem;font-size:.8rem;font-weight:600">Run security scan</button>
<span id="securityScanMsg" style="font-size:.78rem;color:var(--muted)">Static analysis &amp; policy engine active</span>
</div>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Severity</th><th>Finding</th><th>Component</th><th>Tool</th><th>Status</th></tr></thead>
<tbody id="securityTableBody">
<tr><td><span class="sevBadge sevBadge--medium">Medium</span></td><td>Missing zero-address check in <span class="mono">setRewardsDistributor</span> path validation</td><td class="mono">VaultCore.sol:118</td><td class="tblMuted">Static analysis</td><td><span class="statusTag statusTag--accepted"><i></i>Accepted</span></td></tr>
<tr><td><span class="sevBadge sevBadge--high">High</span></td><td>First-deposit donation attack could skew share price</td><td class="mono">VaultCore.sol</td><td class="tblMuted">Adversarial review</td><td><span class="statusTag statusTag--resolved"><i></i>Fixed &mdash; patch #2</span></td></tr>
<tr><td><span class="sevBadge sevBadge--low">Low</span></td><td>Unused import increases bytecode size slightly</td><td class="mono">ShareToken.sol</td><td class="tblMuted">Static analysis</td><td><span class="statusTag statusTag--resolved"><i></i>Fixed</span></td></tr>
<tr><td><span class="sevBadge sevBadge--info">Info</span></td><td>Missing NatSpec on an external function</td><td class="mono">interfaces/IVault.sol</td><td class="tblMuted">Static analysis</td><td><span class="statusTag statusTag--accepted"><i></i>Acknowledged</span></td></tr>
</tbody>
</table>
</div>
</section>
<!-- Patches -->
<section class="view" id="view-patches">
<div class="view__intro">
<h1 class="view__title">Patches</h1>
<p class="view__lede">Auto-fix is capped at 3 attempts per validated finding. Every patch is inspectable as a diff before it's accepted.</p>
</div>
<div class="patch">
<div class="patch__head"><b>Patch #1</b><span>Reentrancy guard on withdraw() &mdash; resolves TM-002</span><span class="statusTag statusTag--resolved" id="patch1Status" style="margin-left:auto"><i></i>Applied</span></div>
<div class="diffBlock">
<div class="diffLine diff-rem">- function withdraw(uint256 sharesIn, address receiver, address owner)</div>
<div class="diffLine diff-rem">-     external whenNotPaused returns (uint256 assetsOut) {</div>
<div class="diffLine diff-add">+ function withdraw(uint256 sharesIn, address receiver, address owner)</div>
<div class="diffLine diff-add">+     external nonReentrant whenNotPaused returns (uint256 assetsOut) {</div>
</div>
<div style="margin-top:.6rem;display:flex;gap:.5rem">
<button class="btn-primary btnApplyPatch" id="btnApplyPatch1" data-patch="1" type="button" style="padding:.38rem .8rem;font-size:.74rem">Re-apply Patch #1 to VaultCore.sol</button>
</div>
</div>
<div class="patch">
<div class="patch__head"><b>Patch #2</b><span>Virtual shares/assets offset &mdash; resolves TM-001</span><span class="statusTag statusTag--resolved" id="patch2Status" style="margin-left:auto"><i></i>Applied</span></div>
<div class="diffBlock">
<div class="diffLine diff-rem">- return (assets * supply) / totalAssets();</div>
<div class="diffLine diff-add">+ return (assets * (supply + VIRTUAL_SHARES)) / (totalAssets() + VIRTUAL_ASSETS);</div>
</div>
<div style="margin-top:.6rem;display:flex;gap:.5rem">
<button class="btn-primary btnApplyPatch" id="btnApplyPatch2" data-patch="2" type="button" style="padding:.38rem .8rem;font-size:.74rem">Re-apply Patch #2 to VaultCore.sol</button>
</div>
</div>
<p style="font-size:.76rem;color:var(--muted-2)">2 of 3 automatic attempts used for this build.</p>
</section>
<!-- Simulations -->
<section class="view" id="view-simulations">
<div class="view__intro">
<h1 class="view__title">Simulations</h1>
<p class="view__lede">Every scenario runs on a pinned Base mainnet fork before deployment is ever considered.</p>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;flex-wrap:wrap">
<button class="btn-primary" id="btnRunSimulations" type="button" style="padding:.5rem 1rem;font-size:.8rem;font-weight:600">Re-run fork simulations</button>
<span id="simStatusMsg" style="font-size:.78rem;color:var(--muted)">Base mainnet fork &middot; block 18,442,910</span>
</div>
<div class="simList" id="simList">
<div class="simItem"><i></i><div><b>Deposit &rarr; reward accrual &rarr; withdraw</b><span>Base mainnet fork &middot; block 18,442,910</span></div><div class="simItem__meta">Gas 184,203<br/>2.1s</div></div>
<div class="simItem"><i></i><div><b>Emergency pause mid-withdrawal</b><span>Guardian pauses; withdrawal reverts cleanly</span></div><div class="simItem__meta">Gas 61,004<br/>0.8s</div></div>
<div class="simItem"><i></i><div><b>Malicious donation-attack replay</b><span>Direct asset transfer before first deposit &mdash; attack prevented</span></div><div class="simItem__meta">Gas n/a<br/>1.4s</div></div>
<div class="simItem"><i></i><div><b>Admin key compromise + timelocked recovery</b><span>Simulated role transfer through the timelock path</span></div><div class="simItem__meta">Gas 96,511<br/>1.9s</div></div>
</div>
<p style="font-size:.76rem;color:var(--muted-2);margin-top:1rem" id="simFooter">4 of 4 scenarios passed &middot; environment: Foundry fork, block-pinned</p>
</section>
<!-- Artifacts -->
<section class="view" id="view-artifacts">
<div class="view__intro">
<h1 class="view__title">Artifacts</h1>
<p class="view__lede">Content-addressed and linked to the execution that produced them &mdash; the basis for reproducibility and later verification.</p>
</div>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Artifact</th><th>Type</th><th>Hash</th><th>Execution</th><th>Created</th></tr></thead>
<tbody>
<tr><td>VaultCore.sol</td><td class="tblMuted">Runtime bytecode</td><td class="mono">0x9ac1f3&hellip;e30e</td><td class="mono">exec_8f21c9ab</td><td class="tblMuted">12m ago</td></tr>
<tr><td>VaultCore.sol</td><td class="tblMuted">ABI</td><td class="mono">0x44b2a0&hellip;7c19</td><td class="mono">exec_8f21c9ab</td><td class="tblMuted">12m ago</td></tr>
<tr><td>Source bundle</td><td class="tblMuted">tar.gz</td><td class="mono">sha256:7ad9e1&hellip;</td><td class="mono">exec_8f21c9ab</td><td class="tblMuted">12m ago</td></tr>
<tr><td>Fork simulation report</td><td class="tblMuted">JSON</td><td class="mono">sha256:2b81c4&hellip;</td><td class="mono">exec_88f0ab</td><td class="tblMuted">12h ago</td></tr>
</tbody>
</table>
</div>
</section>
<!-- Deployments -->
<section class="view" id="view-deployments">
<div class="view__intro">
<h1 class="view__title">Deployments</h1>
<p class="view__lede">Deployment cannot be broadcast without an explicit wallet signature. x0a prepares the transaction; it never holds the key that signs it.</p>
</div>
<div class="docBlock">
<h3>Security gate</h3>
<ul class="gateList">
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Specification locked</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Tests<span>42/42</span></li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Security<span>1 accepted exception</span></li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Simulation<span>4/4 scenarios</span></li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Artifact integrity</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Policy</li>
</ul>
</div>
<div class="docBlock" id="pendingDeployCard">
<h3 id="deployCardTitle">Pending deployment</h3>
<div class="fieldGrid">
<div class="field"><dt>Target</dt><dd id="deployTargetText">VaultCore + ShareToken + RewardsDistributor</dd></div>
<div class="field"><dt>Network</dt><dd id="deployNetworkText">Base Sepolia<span>Testnet &middot; chain id 84532</span></dd></div>
<div class="field"><dt>Estimated cost</dt><dd>~0.014 ETH<span>&asymp; $34 at broadcast time</span></dd></div>
<div class="field"><dt>Transaction</dt><dd id="deployTxText">3 creations<span>+ 1 initialize call</span></dd></div>
</div>
<div class="opsActions" style="max-width:24rem;margin-top:1rem">
<button class="btn-ghost" id="deployCancelBtn" type="button">Cancel</button>
<button class="btn-primary" id="deploySignBtn" type="button">Sign &amp; continue</button>
</div>
<p class="opsHint" id="deployStatusHint">Waiting on the connected Safe (2-of-3) &mdash; click "Sign &amp; continue" to simulate real-time broadcast.</p>
</div>
<div class="docBlock">
<h3>History</h3>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Target</th><th>Status</th><th>When</th></tr></thead>
<tbody id="deployHistoryTable">
<tr><td>Local Anvil</td><td><span class="statusTag statusTag--resolved"><i></i>Deployed &amp; verified (dev)</span></td><td class="tblMuted">2d ago</td></tr>
</tbody>
</table>
</div>
</div>
</section>
<!-- Verification -->
<section class="view" id="view-verification">
<div class="view__intro">
<h1 class="view__title">Verification</h1>
<p class="view__lede">Source verification confirms the deployed bytecode matches the reviewed source &mdash; pending until broadcast.</p>
</div>
<div class="fieldGrid">
<div class="field"><dt>Explorer</dt><dd>Basescan<span>Base Sepolia</span></dd></div>
<div class="field"><dt>Strategy</dt><dd>Full source<span>Standard JSON input</span></dd></div>
<div class="field"><dt>Status</dt><dd id="verifStatusField">Pending<span>Awaiting deployment</span></dd></div>
</div>
<div class="docBlock">
<h3>Constructor arguments (preview)</h3>
<div class="tableWrap"><table class="dataTable"><tbody>
<tr><td class="tblMuted">_asset</td><td class="mono">0x036CbD53&hellip;3dCF7</td></tr>
<tr><td class="tblMuted">admin</td><td class="mono">0x8fA2c19B&hellip; (Safe)</td></tr>
<tr><td class="tblMuted">guardian</td><td class="mono">0x51e0&hellip;44Aa</td></tr>
</tbody></table></div>
</div>
</section>
<!-- Incidents -->
<section class="view" id="view-incidents">
<div class="view__intro">
<h1 class="view__title">Incidents &amp; Alerts</h1>
<p class="view__lede">Automated invariant monitors and anomaly detection alert on unauthorized parameter changes or anomalous withdrawals.</p>
</div>
<div id="incidentsContainer">
<div class="emptyState" id="incidentsEmpty">
<span class="emptyState__icon"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 20 20"><circle cx="10" cy="10" r="6.9"></circle><path d="m6.9 10.2 2.2 2.2 4-4.4"></path></svg></span>
<b>No open incidents</b>
<p>Monitoring is active. Anomalies detected in on-chain invariants will open incidents here, each with its own evidence and timeline.</p>
</div>
<div id="incidentsList" style="display:none;flex-direction:column;gap:1rem"></div>
</div>
</section>
<!-- Monitoring -->
<section class="view" id="view-monitoring">
<div class="view__intro">
<h1 class="view__title">Live Monitoring</h1>
<p class="view__lede">Real-time telemetry, transaction event streams, and invariant verification running on Base Sepolia.</p>
</div>
<div id="monitoringActiveView">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;flex-wrap:wrap;gap:.8rem">
<div style="display:flex;align-items:center;gap:.6rem">
<span class="walletDot" style="width:10px;height:10px"></span>
<b style="font-size:.9rem">Live Stream Active</b>
<span class="statusTag statusTag--resolved" id="monBlockTag">Block #18,443,120</span>
</div>
<div style="display:flex;gap:.5rem">
<button class="btn-ghost" id="btnSimulateAnomaly" type="button" style="padding:.38rem .75rem;font-size:.74rem">Simulate Anomaly</button>
<button class="btn-ghost" id="btnTogglePause" type="button" style="padding:.38rem .75rem;font-size:.74rem">Pause Vault</button>
</div>
</div>
<div class="testGrid" style="margin-bottom:1.5rem">
<div class="testCard ok"><b id="monTvl">$1,540,820</b><span>TVL (USDC)</span></div>
<div class="testCard ok"><b id="monSharePrice">1.0428 USDC</b><span>Share Price</span></div>
<div class="testCard ok"><b id="monLatency">22ms</b><span>RPC Latency</span></div>
<div class="testCard ok"><b id="monTxs">142</b><span>24h Transactions</span></div>
</div>
<div class="docBlock">
<h3>Live On-Chain Event Stream (Base Sepolia)</h3>
<div class="tableWrap">
<table class="dataTable">
<thead><tr><th>Time</th><th>Event</th><th>Caller</th><th>Amount</th><th>Status</th></tr></thead>
<tbody id="monTxTable">
<tr><td class="tblMuted">Just now</td><td>Deposit</td><td class="mono">0x8a92&hellip;11</td><td>15,000 USDC</td><td><span class="statusTag statusTag--resolved">Success</span></td></tr>
<tr><td class="tblMuted">14s ago</td><td>Claim</td><td class="mono">0x3f21&hellip;cc</td><td>48.20 USDC</td><td><span class="statusTag statusTag--resolved">Success</span></td></tr>
<tr><td class="tblMuted">42s ago</td><td>Harvest</td><td class="mono">Strategist</td><td>320.00 USDC</td><td><span class="statusTag statusTag--resolved">Success</span></td></tr>
</tbody>
</table>
</div>
</div>
</div>
</section>
<!-- Audit Trail -->
<section class="view" id="view-audit">
<div class="view__intro">
<h1 class="view__title">Audit Trail</h1>
<p class="view__lede">Every action is attributable to an actor, agent or model, with an execution ID linking back to its evidence.</p>
</div>
<div class="auditList">
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Coder Agent</b><p>Generated VaultCore.sol, ShareToken.sol and RewardsDistributor.sol from specification v1.</p><span class="mono">exec_51ac4d1e</span></div><span class="auditItem__time">3d ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Build Worker</b><p>Compiled with solc 0.8.26 in an isolated worker. Result: success.</p><span class="mono">exec_51ad2f90</span></div><span class="auditItem__time">3d ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Security Agent</b><p>Ran static analysis and adversarial review. Found 4 issues &mdash; 1 High, 2 Low, 1 Info.</p><span class="mono">exec_6b12290a</span></div><span class="auditItem__time">2d ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Auto-fix Agent</b><p>Applied patch #1 (reentrancy guard) and patch #2 (donation-attack mitigation). Both accepted.</p><span class="mono">exec_6b19ffa2</span></div><span class="auditItem__time">2d ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="5.5" r="2.5"></circle><path d="M4 15c.9-3.4 3.4-5 5-5s4.1 1.6 5 5"></path></svg></span><div style="flex:1"><b>Alex Rivera &middot; Owner</b><p>Reviewed and locked specification v3.</p><span class="mono">exec_712a44c0</span></div><span class="auditItem__time">1d ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Simulation Worker</b><p>Ran the fork simulation suite &mdash; 4 of 4 scenarios passed.</p><span class="mono">exec_88f0ab31</span></div><span class="auditItem__time">12h ago</span></div>
<div class="auditItem"><span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewbox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span><div style="flex:1"><b>Policy Engine</b><p>Evaluated the security gate &mdash; passed, with one accepted exception on the Medium finding.</p><span class="mono">exec_8f21c9ab</span></div><span class="auditItem__time">12m ago</span></div>
</div>
</section>
</div>
</div>
<!-- ---- Ops pane (right pane) ---- -->
<aside class="ops" id="ops">
<div class="ops__head">
<div aria-label="Details or chat" class="opsTabs" id="opsTabs" role="tablist">
<button aria-selected="true" class="opsTab" data-ops-tab="details" role="tab" type="button">Details</button>
<button aria-selected="false" class="opsTab" data-ops-tab="chat" role="tab" type="button">Chat</button>
</div>
<button aria-label="Close details" class="ops__close" id="opsClose">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" viewbox="0 0 20 20"><path d="m5.5 5.5 9 9M14.5 5.5l-9 9"></path></svg>
</button>
</div>
<div class="ops__scroll" id="opsScroll">
<div id="opsPanelDetails">
<section class="opsCard">
<h3>Ecosystem</h3>
<dl class="opsKV">
<div><dt>Ecosystem</dt><dd>EVM</dd></div>
<div><dt>VM</dt><dd>EVM &middot; Cancun</dd></div>
<div><dt>Language</dt><dd>Solidity ^0.8.26</dd></div>
<div><dt>Framework</dt><dd>Foundry</dd></div>
</dl>
<div aria-label="Environment" class="envRow" id="envRow" role="group">
<button data-env="local">Local</button>
<button data-env="dev">Dev</button>
<button aria-pressed="true" data-env="testnet">Testnet</button>
<button data-env="staging">Staging</button>
<button data-env="mainnet">Mainnet</button>
</div>
<p class="opsNote">Base Sepolia &middot; chain id 84532</p>
</section>
<section class="opsCard">
<h3>Project state</h3>
<ol class="stepper">
<li class="done">Specification</li>
<li class="done">Threat model</li>
<li class="done">Architecture</li>
<li class="done">Code</li>
<li class="done">Build</li>
<li class="done">Test</li>
<li class="done">Security</li>
<li class="done">Adversarial review</li>
<li class="done">Simulation</li>
<li class="done">Policy gate</li>
<li class="current">Wallet approval</li>
<li>Deployment</li>
<li>Verification</li>
<li>Monitoring</li>
</ol>
</section>
<section class="opsCard">
<h3>Security gate</h3>
<ul class="gateList">
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Specification</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Tests</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Security<span>1 exception</span></li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Simulation</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Artifact integrity</li>
<li><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 18 18"><path d="m4 9.5 3 3 7-7"></path></svg>Policy</li>
</ul>
</section>
<section class="opsCard">
<h3>Deployment preview</h3>
<dl class="opsKV">
<div><dt>Target</dt><dd>3 contracts</dd></div>
<div><dt>Network</dt><dd>Base Sepolia</dd></div>
<div><dt>Est. cost</dt><dd>~0.014 ETH</dd></div>
<div><dt>Transaction</dt><dd>3 + 1 call</dd></div>
</dl>
</section>
<section class="opsCard">
<h3>Wallet</h3>
<div class="walletRow">
<span class="walletDot"></span>
<div><b>0x8fA2&hellip;c19B</b><span>Safe (2-of-3) &middot; Base Sepolia</span></div>
</div>
<div class="opsActions">
<button class="btn-ghost" id="opsCancelBtn" type="button">Cancel</button>
<button class="btn-primary" id="opsSignBtn" type="button">Sign &amp; continue</button>
</div>
<p class="opsHint">Signature required from an authorized wallet. x0a never holds your keys.</p>
</section>
<section class="opsCard opsCard--muted">
<h3>Monitoring</h3>
<p class="opsHint">Activates automatically once this deployment is broadcast and verified.</p>
</section>
</div>
<div hidden="" id="opsPanelChat">
<div class="agentChat">
<div class="msgList agentChat__log" id="agentLog"></div>
<div class="agentChat__suggestions" id="agentSuggestions">
<button class="qrChip" data-prompt="Add a withdrawal fee" type="button">Add a withdrawal fee</button>
<button class="qrChip" data-prompt="Make it pausable" type="button">Make it pausable</button>
<button class="qrChip" data-prompt="Add role-based access" type="button">Add role-based access</button>
<button class="qrChip" data-prompt="Explain claimRewards()" type="button">Explain claimRewards()</button>
</div>
<form class="agentChat__composer" id="agentForm">
<textarea id="agentInput" placeholder="Ask x0a to change or add something&hellip;" rows="1"></textarea>
<button aria-label="Send" class="agentChat__send" id="agentSend" type="submit">
<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 20 20"><path d="M3 10h14M11 4l6 6-6 6"></path></svg>
</button>
</form>
</div>
</div>
</div>
</aside>
</div>
<!-- ============ Status bar ============ -->
<div class="statusbar" id="statusbar">
<div class="statusbar__left">
<span id="statusLang">Solidity</span><span class="sep">&middot;</span><span id="statusLines">244 lines</span><span class="sep statusExtra">&middot;</span><span class="statusExtra">UTF-8</span>
<span class="statusPill statusPill--ok">Build passing</span>
<span class="statusPill statusPill--ok">Tests 42/42</span>
</div>
<div class="statusbar__right">
<span class="mono" style="color:var(--muted)">exec_8f21c9ab</span>
<span class="sep">&middot;</span>
<span>Base Sepolia</span>
<span class="branchBadge branchBadge--sm">spec v3 &middot; locked</span>
</div>
</div>
</div>
</div>


`;
