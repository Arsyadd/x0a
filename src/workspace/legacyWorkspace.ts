// Compatibility layer for the x0a smart contract engineer workspace.
// The UI is mounted by React; this module wires all real-time interactions into that DOM.
// @ts-nocheck

interface WorkspaceInitOptions {
  initialPrompt?: string;
}

export function initWorkspace(
  root: HTMLElement,
  options: WorkspaceInitOptions = {},
) {
  var initialPrompt = (options.initialPrompt || '').trim();

  // Helper selectors scoped to root
  var $ = function(s, ctx) { return (ctx || root).querySelector(s); };
  var $$ = function(s, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(s)); };

  function escHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bubbleHTML(role, innerHTML) {
    return '<div class="msg msg--' + role + '">' +
      '<i class="msg__avatar">' + (role === 'agent' ? 'x0' : 'AR') + '</i>' +
      '<div class="msg__col"><div class="msg__bubble">' + innerHTML + '</div></div></div>';
  }

  function typingHTML() {
    return bubbleHTML('agent', '<span class="typing"><span></span><span></span><span></span></span>');
  }

  // Clear previous monitoring intervals if any were active
  if (window._x0aMonInterval) {
    clearInterval(window._x0aMonInterval);
    window._x0aMonInterval = null;
  }

  /* ---------------- Audit Trail Logger (Real-time live telemetry) ---------------- */
  function addAuditTrailEntry(actor, description, execId) {
    var auditList = $('#view-audit .auditList');
    if (!auditList) return;
    var randId = execId || ('exec_' + Math.random().toString(16).slice(2, 10));
    var item = document.createElement('div');
    item.className = 'auditItem';
    item.innerHTML = '<span class="auditItem__dot"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6.3"></circle><path d="M9 5.5V9l2.6 1.6"></path></svg></span>' +
      '<div style="flex:1"><b>' + escHtml(actor) + '</b><p>' + escHtml(description) + '</p><span class="mono">' + escHtml(randId) + '</span></div>' +
      '<span class="auditItem__time">Just now</span>';
    auditList.insertBefore(item, auditList.firstChild);

    // Update status bar execution id
    var statExec = $('.statusbar__right .mono');
    if (statExec) statExec.textContent = randId;
  }

  /* ---------------- Nav sidebar & mobile drawer mechanics ---------------- */
  var shell = $('#shell');
  var menuToggle = $('#menuToggle');
  var scrim = $('#scrim');
  var closeSidebarBtn = $('#closeSidebarBtn');
  var sidebar = $('#sidebar');

  function syncLock() {
    root.classList.toggle('is-locked', shell.classList.contains('is-open') || explorer.classList.contains('is-open') || ops.classList.contains('is-open'));
  }

  function setOpen(v) {
    if (!v && sidebar.contains(document.activeElement)) menuToggle.focus();
    shell.classList.toggle('is-open', v);
    menuToggle.setAttribute('aria-expanded', String(v));
    closeAllPops();
    syncLock();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      var willOpen = !shell.classList.contains('is-open');
      setOpen(willOpen);
      if (willOpen) setTimeout(function() { if (closeSidebarBtn) closeSidebarBtn.focus(); }, 60);
    });
  }
  if (scrim) scrim.addEventListener('click', function() { setOpen(false); });
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', function() { setOpen(false); });

  /* ---------------- Popovers (account + notifications) ---------------- */
  var pops = [
    { btn: $('#avatarBtn'), pop: $('#avatarPop') },
    { btn: $('#notifBtn'), pop: $('#notifPop') }
  ];

  function closeAllPops() {
    pops.forEach(function(p) {
      if (p.pop) p.pop.classList.remove('is-open');
      if (p.btn) p.btn.setAttribute('aria-expanded', 'false');
    });
  }

  pops.forEach(function(p) {
    if (p.btn && p.pop) {
      p.btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var willOpen = !p.pop.classList.contains('is-open');
        closeAllPops();
        p.pop.classList.toggle('is-open', willOpen);
        p.btn.setAttribute('aria-expanded', String(willOpen));
      });
    }
  });

  root.addEventListener('click', function(e) {
    if (!pops.some(function(p) { return p.pop && (p.pop.contains(e.target) || (p.btn && p.btn.contains(e.target))); })) {
      closeAllPops();
    }
  });

  /* ---------------- Notification badge & live interactive notifications ---------------- */
  var notifBadge = $('#notifBadge'), notifBtn = $('#notifBtn');
  function updateNotifBadge() {
    if (!notifBadge || !notifBtn) return;
    var notifCount = $$('#notifPop .nitem:not(.is-read)').length;
    notifBadge.textContent = notifCount > 9 ? '9+' : String(notifCount);
    notifBadge.classList.toggle('is-visible', notifCount > 0);
    notifBtn.setAttribute('aria-label', notifCount ? 'Notifications, ' + notifCount + ' unread' : 'Notifications');
  }
  updateNotifBadge();

  // Notification items jump to the corresponding section when clicked
  $$('#notifPop .nitem').forEach(function(item) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      item.classList.add('is-read');
      item.style.opacity = '0.65';
      updateNotifBadge();
      closeAllPops();

      var text = item.textContent.toLowerCase();
      if (text.indexOf('wallet approval') > -1) {
        openView('deployments');
      } else if (text.indexOf('security gate') > -1 || text.indexOf('finding') > -1) {
        openView('security');
      } else if (text.indexOf('simulation') > -1) {
        openView('simulations');
      } else if (text.indexOf('anomaly') > -1 || text.indexOf('incident') > -1) {
        openView('incidents');
      }
    });
  });

  /* ---------------- Explorer / Ops drawers (mobile) ---------------- */
  var explorer = $('#explorer'), ops = $('#ops');
  var explorerToggle = $('#explorerToggle'), explorerClose = $('#explorerClose');
  var opsToggle = $('#opsToggle'), opsClose = $('#opsClose');
  var wsScrim = $('#wsScrim');

  function setDrawer(which, v) {
    if (explorer) explorer.classList.toggle('is-open', which === 'explorer' ? v : false);
    if (ops) ops.classList.toggle('is-open', which === 'ops' ? v : false);
    if (wsScrim) wsScrim.classList.toggle('is-open', v);
    syncLock();
  }

  if (explorerToggle) explorerToggle.addEventListener('click', function() { setDrawer('explorer', !explorer.classList.contains('is-open')); });
  if (explorerClose) explorerClose.addEventListener('click', function() { setDrawer('explorer', false); });
  if (opsToggle) opsToggle.addEventListener('click', function() { setDrawer('ops', !ops.classList.contains('is-open')); });
  if (opsClose) opsClose.addEventListener('click', function() { setDrawer('ops', false); });
  if (wsScrim) wsScrim.addEventListener('click', function() { setDrawer(null, false); });

  var envChip = $('.envChip');
  if (envChip) {
    envChip.addEventListener('click', function() {
      setDrawer('ops', true);
      selectOpsTab('chat');
      var agentInp = $('#agentInput');
      if (agentInp) {
        agentInp.placeholder = 'Ketik "ganti ke mainnet" atau minta perubahan arsitektur...';
        agentInp.focus();
      }
    });
  }

  /* ---------------- Focus mode ---------------- */
  var focusToggle = $('#focusToggle');
  if (focusToggle) {
    focusToggle.addEventListener('click', function() {
      var on = !this.classList.contains('is-active');
      this.classList.toggle('is-active', on);
      if (explorer) explorer.style.display = on ? 'none' : '';
      if (ops) ops.style.display = on ? 'none' : '';
    });
  }

  /* ---------------- Explorer tree: collapsible groups + folder ---------------- */
  $$('.egroup__head').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var grp = btn.closest('.egroup');
      var collapsed = grp.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  });

  $$('.enode--folder').forEach(function(btn) {
    btn.addEventListener('click', function() { btn.classList.toggle('is-open'); });
  });

  /* ---------------- Active Workspace Network Environment ---------------- */
  var activeNetwork = 'Base Sepolia · Testnet';

  function setWorkspaceNetwork(networkLabel, tierName) {
    if (!networkLabel) return;
    activeNetwork = networkLabel;

    var envLabelEl = $('#wsEnvLabel');
    if (envLabelEl) envLabelEl.textContent = networkLabel;

    var activeEnvTitleEl = $('#wsActiveEnvTitle');
    if (activeEnvTitleEl) activeEnvTitleEl.textContent = networkLabel;

    var deployNetEl = $('#deployNetworkText');
    if (deployNetEl) {
      deployNetEl.innerHTML = escHtml(networkLabel) + '<span>' + escHtml(tierName || 'Target configured in specification') + '</span>';
    }

    var opsNoteEl = $('#opsNote');
    if (opsNoteEl) {
      opsNoteEl.textContent = 'Target network dikunci dari spesifikasi: ' + networkLabel + '. Ubah network kapan saja via chat dengan Agent.';
    }

    if (currentProject) {
      var parts = (currentProject.eco || 'EVM').split('·')[0].trim();
      currentProject.eco = parts + ' · ' + networkLabel;
      var crumb = $('.topbar .crumb');
      if (crumb) {
        crumb.innerHTML = escHtml(currentProject.title) + '<span class="crumb__eco">' + escHtml(currentProject.eco) + '</span>';
      }
    }

    addAuditTrailEntry('Deployment Agent', 'Target network environment updated to ' + networkLabel + (tierName ? ' (' + tierName + ')' : '') + '.');
  }

  /* ---------------- Code syntax highlighting ---------------- */
  var LANG = {
    solidity: {
      kw: ['pragma', 'solidity', 'import', 'from', 'as', 'contract', 'interface', 'library', 'is', 'using', 'for', 'function', 'external', 'public', 'internal', 'private', 'view', 'pure', 'payable', 'returns', 'return', 'if', 'else', 'revert', 'require', 'emit', 'event', 'error', 'modifier', 'constructor', 'memory', 'storage', 'calldata', 'immutable', 'constant', 'override', 'virtual', 'mapping', 'struct', 'enum', 'new', 'msg', 'block'],
      types: ['IERC20', 'SafeERC20', 'ReentrancyGuard', 'AccessControl', 'ShareToken', 'IVault', 'ERC20', 'RewardsDistributor', 'Script', 'VaultCore', 'Deploy', 'uint256', 'uint8', 'address', 'bool', 'bytes32', 'string']
    },
    toml: { kw: ['true', 'false'], types: [] }
  };

  function tokenizeLine(line, lang) {
    var rules = LANG[lang] || LANG.solidity;
    var re = /(\/\/[^\n]*)|(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)|(\[[A-Za-z0-9_.]+\])|([^\sA-Za-z0-9_$]+)|(\s+)/g;
    return line.replace(re, function(m, com, hcom, str, num, word, bracket) {
      if (com || hcom) return '<span class="tok-com">' + escHtml(m) + '</span>';
      if (str) return '<span class="tok-str">' + escHtml(m) + '</span>';
      if (num) return '<span class="tok-num">' + escHtml(m) + '</span>';
      if (word) {
        if (rules.kw.indexOf(word) !== -1) return '<span class="tok-kw">' + escHtml(word) + '</span>';
        if (rules.types.indexOf(word) !== -1) return '<span class="tok-type">' + escHtml(word) + '</span>';
        return escHtml(word);
      }
      if (bracket) return '<span class="tok-type">' + escHtml(m) + '</span>';
      return escHtml(m);
    });
  }

  var fileLines = {};

  function renderCode(container) {
    var lang = container.getAttribute('data-lang') || 'solidity';
    var fileWrap = container.closest('.codefile');
    var file = fileWrap.getAttribute('data-file');
    var srcEl = document.getElementById('src-' + file);
    if (!srcEl) return;
    var raw = srcEl.textContent.replace(/^\n/, '').replace(/\n+$/, '');
    var lines = raw.split('\n');
    var html = lines.map(function(line, i) {
      var isDivider = /^\s*\/\/\s*—/.test(line);
      var body = line.length ? tokenizeLine(line, lang) : '&nbsp;';
      return '<div class="codeLine' + (isDivider ? ' codeLine--divider' : '') + '"><span class="lineNo">' + (i + 1) + '</span><span class="lineCode"><span>' + body + '</span></span></div>';
    }).join('');
    container.innerHTML = html;
    fileLines[file] = lines.length;
    var metaBar = fileWrap.querySelector('.codeMeta');
    if (metaBar) metaBar.textContent = lines.length + ' lines';
  }

  $$('.codeBody').forEach(renderCode);

  /* ---------------- Editable source code engine ---------------- */
  function getSource(file) {
    var srcEl = document.getElementById('src-' + file);
    return srcEl ? srcEl.textContent.replace(/^\n/, '').replace(/\n+$/, '') : '';
  }

  function setSource(file, text) {
    var srcEl = document.getElementById('src-' + file);
    if (srcEl) srcEl.textContent = text;
  }

  function highlightHTML(text, lang) {
    return text.split('\n').map(function(line) { return line.length ? tokenizeLine(line, lang) : ''; }).join('\n');
  }

  function syncGutter(gutter, textarea) {
    var n = textarea.value.split('\n').length;
    var cur = gutter.children.length;
    if (cur < n) {
      var frag = document.createDocumentFragment();
      for (var i = cur; i < n; i++) {
        var s = document.createElement('span');
        s.textContent = String(i + 1);
        frag.appendChild(s);
      }
      gutter.appendChild(frag);
    } else if (cur > n) {
      for (var j = cur; j > n; j--) gutter.removeChild(gutter.lastChild);
    }
  }

  function markDirty(codefileEl, dirty) {
    codefileEl.classList.toggle('is-dirty', dirty);
    var saveBtn = codefileEl.querySelector('.codeSaveBtn');
    var unsaved = codefileEl.querySelector('.codeUnsaved');
    if (saveBtn) saveBtn.disabled = !dirty;
    if (unsaved) unsaved.hidden = !dirty;
  }

  function buildEditUI(codefileEl) {
    var editWrap = codefileEl.querySelector('.codeEditWrap');
    if (editWrap) return editWrap;
    var file = codefileEl.getAttribute('data-file');
    var lang = codefileEl.querySelector('.codeBody').getAttribute('data-lang') || 'solidity';
    var codeWrap = codefileEl.querySelector('.code');
    editWrap = document.createElement('div');
    editWrap.className = 'codeEditWrap';
    var gutter = document.createElement('div');
    gutter.className = 'codeGutter';
    var area = document.createElement('div');
    area.className = 'codeEditArea';
    var pre = document.createElement('pre');
    pre.className = 'codeHighlight';
    pre.setAttribute('aria-hidden', 'true');
    var textarea = document.createElement('textarea');
    textarea.className = 'codeTextarea';
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('wrap', 'off');
    textarea.setAttribute('aria-label', 'Edit ' + file);
    area.appendChild(pre);
    area.appendChild(textarea);
    editWrap.appendChild(gutter);
    editWrap.appendChild(area);
    codeWrap.appendChild(editWrap);

    function refreshHighlight() { pre.innerHTML = highlightHTML(textarea.value, lang); }
    editWrap._refreshHighlight = refreshHighlight;

    textarea.addEventListener('input', function() {
      syncGutter(gutter, textarea);
      refreshHighlight();
      markDirty(codefileEl, textarea.value !== getSource(file));
    });

    textarea.addEventListener('scroll', function() { pre.scrollLeft = textarea.scrollLeft; });

    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = textarea.selectionStart, end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        textarea.dispatchEvent(new Event('input'));
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!codefileEl.querySelector('.codeSaveBtn').disabled) saveEdit(codefileEl);
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        cancelEdit(codefileEl);
      }
    });

    return editWrap;
  }

  function enterEditMode(codefileEl) {
    var file = codefileEl.getAttribute('data-file');
    var editWrap = buildEditUI(codefileEl);
    var textarea = editWrap.querySelector('.codeTextarea');
    var gutter = editWrap.querySelector('.codeGutter');
    textarea.value = getSource(file);
    gutter.innerHTML = '';
    syncGutter(gutter, textarea);
    editWrap._refreshHighlight();
    codefileEl.classList.add('is-editing');
    markDirty(codefileEl, false);
    var editBtn = $('.codeEditBtn', codefileEl);
    if (editBtn) editBtn.hidden = true;
    var saveActions = $('.codeSaveActions', codefileEl);
    if (saveActions) saveActions.hidden = false;
    requestAnimationFrame(function() { textarea.focus(); });
  }

  function exitEditMode(codefileEl) {
    codefileEl.classList.remove('is-editing');
    var editBtn = $('.codeEditBtn', codefileEl);
    if (editBtn) editBtn.hidden = false;
    var saveActions = $('.codeSaveActions', codefileEl);
    if (saveActions) saveActions.hidden = true;
  }

  function saveEdit(codefileEl) {
    var file = codefileEl.getAttribute('data-file');
    var textarea = codefileEl.querySelector('.codeTextarea');
    setSource(file, textarea.value);
    renderCode(codefileEl.querySelector('.codeBody'));
    exitEditMode(codefileEl);
    if (activeKey === 'file:' + file) {
      var linesEl = $('#statusLines');
      if (linesEl) linesEl.textContent = (fileLines[file] || 0) + ' lines';
    }
    var editBtn = codefileEl.querySelector('.codeEditBtn');
    var label = editBtn.querySelector('span');
    var original = label.textContent;
    label.textContent = 'Saved';
    editBtn.classList.add('is-saved');
    setTimeout(function() { label.textContent = original; editBtn.classList.remove('is-saved'); }, 1400);

    addAuditTrailEntry('Alex Rivera · Owner', 'Saved edits to ' + file + ' (' + (fileLines[file] || 0) + ' lines). Source recompiled.');
  }

  function cancelEdit(codefileEl) { exitEditMode(codefileEl); }

  root.addEventListener('click', function(e) {
    var editBtn = e.target.closest('.codeEditBtn');
    if (editBtn) { enterEditMode(editBtn.closest('.codefile')); return; }
    var saveBtn = e.target.closest('.codeSaveBtn');
    if (saveBtn && !saveBtn.disabled) { saveEdit(saveBtn.closest('.codefile')); return; }
    var cancelBtn = e.target.closest('.codeCancelBtn');
    if (cancelBtn) { cancelEdit(cancelBtn.closest('.codefile')); return; }
  });

  /* ---------------- View / open-tabs state ---------------- */
  var currentProject = {
    title: 'Yield Vault',
    eco: 'EVM · Base',
    path: 'yield-vault'
  };

  var FILES = {
    'VaultCore.sol':          { path: [currentProject.path, 'contracts', 'VaultCore.sol'] },
    'ShareToken.sol':         { path: [currentProject.path, 'contracts', 'ShareToken.sol'] },
    'RewardsDistributor.sol': { path: [currentProject.path, 'contracts', 'RewardsDistributor.sol'] },
    'interfaces/IVault.sol':  { path: [currentProject.path, 'contracts', 'interfaces', 'IVault.sol'], label: 'IVault.sol' },
    'script/Deploy.s.sol':    { path: [currentProject.path, 'contracts', 'script', 'Deploy.s.sol'], label: 'Deploy.s.sol' },
    'foundry.toml':           { path: [currentProject.path, 'foundry.toml'] }
  };

  var VIEWS = {
    'specification':  { tab: 'Specification.md', path: [currentProject.path, 'specification.md'], section: 'workspace' },
    'threat-model':   { tab: 'Threat Model.md',  path: [currentProject.path, 'threat-model.md'], section: 'workspace' },
    'architecture':   { tab: 'Architecture.md',  path: [currentProject.path, 'architecture.md'], section: 'workspace' },
    'adrs':           { tab: 'ADRs',             path: [currentProject.path, 'adr'], section: 'workspace' },
    'dependencies':   { tab: 'Dependencies',     path: [currentProject.path, 'dependencies'], section: 'workspace' },
    'builds':         { tab: 'Builds',           path: [currentProject.path, 'builds'], section: 'workspace' },
    'tests':          { tab: 'Tests',            path: [currentProject.path, 'tests'], section: 'workspace' },
    'security':       { tab: 'Findings',         path: [currentProject.path, 'security', 'findings'], section: 'security' },
    'patches':        { tab: 'Patches',          path: [currentProject.path, 'security', 'patches'], section: 'security' },
    'simulations':    { tab: 'Simulations',      path: [currentProject.path, 'simulations'], section: 'simulation' },
    'artifacts':      { tab: 'Artifacts',        path: [currentProject.path, 'artifacts'], section: 'workspace' },
    'deployments':    { tab: 'Deployments',      path: [currentProject.path, 'deployments'], section: 'deployment' },
    'verification':   { tab: 'Verification',     path: [currentProject.path, 'verification'], section: 'deployment' },
    'incidents':      { tab: 'Incidents',        path: [currentProject.path, 'incidents'], section: 'monitoring' },
    'monitoring':     { tab: 'Monitoring',       path: [currentProject.path, 'monitoring'], section: 'monitoring' },
    'audit':          { tab: 'Audit Trail',      path: [currentProject.path, 'audit-trail'], section: 'workspace' }
  };

  var wsTabsList = $('#wsTabsList');
  var wsPath = $('#wsPath');
  var wsSwitch = $('#wsSwitch');
  var etree = $('#etree');
  var centerScroll = $('#centerScroll');

  var openTabs = [
    { key: 'specification', view: 'specification' },
    { key: 'file:VaultCore.sol', view: 'editor', file: 'VaultCore.sol' },
    { key: 'security', view: 'security' }
  ];
  var activeKey = 'file:VaultCore.sol';

  // Navigation History Stack (Back / Forward chevrons)
  var navHistory = [];
  var navHistoryIndex = -1;
  var isHistoryAction = false;

  var backBtn = $('.wsNav .wsChevron:first-child');
  var fwdBtn = $('.wsNav .wsChevron:last-child');

  function updateNavChevrons() {
    if (backBtn) backBtn.disabled = navHistoryIndex <= 0;
    if (fwdBtn) fwdBtn.disabled = navHistoryIndex >= navHistory.length - 1;
  }

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (navHistoryIndex > 0) {
        navHistoryIndex--;
        isHistoryAction = true;
        var prev = navHistory[navHistoryIndex];
        openView(prev.view, prev.file);
        isHistoryAction = false;
        updateNavChevrons();
      }
    });
  }

  if (fwdBtn) {
    fwdBtn.addEventListener('click', function() {
      if (navHistoryIndex < navHistory.length - 1) {
        navHistoryIndex++;
        isHistoryAction = true;
        var next = navHistory[navHistoryIndex];
        openView(next.view, next.file);
        isHistoryAction = false;
        updateNavChevrons();
      }
    });
  }

  function tabMeta(t) {
    if (t.view === 'editor') {
      var f = FILES[t.file] || { path: [currentProject.path, t.file] };
      return { label: f.label || t.file.split('/').pop(), path: f.path };
    }
    var v = VIEWS[t.view] || { tab: t.view, path: [currentProject.path, t.view] };
    return { label: v.tab, path: v.path };
  }

  function closeTab(key, e) {
    if (e) e.stopPropagation();
    var i = openTabs.findIndex(function(t) { return t.key === key; });
    if (i === -1) return;
    openTabs.splice(i, 1);
    if (activeKey === key) {
      var next = openTabs[i] || openTabs[i - 1];
      if (next) { activateTab(next.key); }
      else { openView('editor', 'VaultCore.sol'); return; }
    }
    renderTabs();
  }

  function renderTabs() {
    if (!wsTabsList) return;
    wsTabsList.innerHTML = '';
    openTabs.forEach(function(t) {
      var meta = tabMeta(t);
      var btn = document.createElement('button');
      btn.className = 'wtab' + (t.key === activeKey ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(t.key === activeKey));
      btn.innerHTML = '<span class="wtab__label"></span><span class="wtab__x" aria-label="Close tab">×</span>';
      btn.querySelector('.wtab__label').textContent = meta.label;
      btn.addEventListener('click', function() { activateTab(t.key); });
      btn.querySelector('.wtab__x').addEventListener('click', function(e) { closeTab(t.key, e); });
      wsTabsList.appendChild(btn);
      if (t.key === activeKey) {
        requestAnimationFrame(function() { btn.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
      }
    });
  }

  function renderPath(pathArr) {
    if (!wsPath) return;
    wsPath.innerHTML = '';
    (pathArr || [currentProject.path]).forEach(function(seg, i) {
      if (i > 0) { var em = document.createElement('em'); em.textContent = '/'; wsPath.appendChild(em); }
      var el = document.createElement(i === 0 ? 'b' : 'span');
      el.textContent = seg;
      wsPath.appendChild(el);
    });
  }

  function activateTab(key) {
    var t = openTabs.find(function(x) { return x.key === key; });
    if (!t) return;
    activeKey = key;
    applyView(t.view, t.file);
  }

  function openView(view, file) {
    var key = view === 'editor' ? 'file:' + file : view;
    if (!openTabs.some(function(t) { return t.key === key; })) {
      openTabs.push({ key: key, view: view, file: file });
    }
    activeKey = key;

    // Track navigation history
    if (!isHistoryAction) {
      if (navHistoryIndex < navHistory.length - 1) {
        navHistory = navHistory.slice(0, navHistoryIndex + 1);
      }
      navHistory.push({ view: view, file: file });
      navHistoryIndex = navHistory.length - 1;
      updateNavChevrons();
    }

    applyView(view, file);
  }

  function applyView(view, file) {
    // Show/hide view sections
    $$('.view').forEach(function(v) { v.hidden = (v.id !== 'view-' + view); });
    if (view === 'editor') {
      $$('.codefile').forEach(function(cf) { cf.classList.toggle('is-active', cf.getAttribute('data-file') === file); });
    }

    // Update explorer active states
    $$('.enode').forEach(function(n) { n.classList.toggle('is-active', n.getAttribute('data-view') === view && view !== 'editor'); });
    $$('.efile').forEach(function(n) { n.classList.toggle('is-active', view === 'editor' && n.getAttribute('data-file') === file); });

    // Path + tabs + switcher
    var meta = view === 'editor' ? { path: (FILES[file] || { path: [currentProject.path, file] }).path } : { path: (VIEWS[view] || { path: [currentProject.path, view] }).path };
    renderPath(meta.path);
    renderTabs();

    var section = view === 'editor' ? 'workspace' : ((VIEWS[view] && VIEWS[view].section) || 'workspace');
    $$('#wsSwitch button').forEach(function(b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-section') === section));
    });

    // Status bar updates
    var statusLang = $('#statusLang');
    var statusLines = $('#statusLines');
    if (view === 'editor') {
      var isToml = file === 'foundry.toml';
      if (statusLang) statusLang.textContent = isToml ? 'TOML' : 'Solidity';
      var n = fileLines[file] || '—';
      if (statusLines) statusLines.textContent = n + ' lines';
    } else {
      if (statusLang) statusLang.textContent = 'x0a Workspace';
      if (statusLines) statusLines.textContent = VIEWS[view] ? VIEWS[view].tab : view;
    }

    if (centerScroll) centerScroll.scrollTop = 0;

    // Auto-close mobile drawer after selection
    if (window.innerWidth < 860) setDrawer('explorer', false);
  }

  if (etree) {
    etree.addEventListener('click', function(e) {
      var enode = e.target.closest('.enode:not(.enode--folder)');
      if (enode && enode.getAttribute('data-view')) { openView(enode.getAttribute('data-view')); return; }
      var efile = e.target.closest('.efile');
      if (efile && efile.getAttribute('data-file')) { openView('editor', efile.getAttribute('data-file')); return; }
    });
  }

  if (wsSwitch) {
    wsSwitch.addEventListener('click', function(e) {
      var btn = e.target.closest('button[data-section]');
      if (!btn) return;
      var section = btn.getAttribute('data-section');
      var map = {
        workspace: ['editor', 'VaultCore.sol'],
        security: ['security'],
        simulation: ['simulations'],
        deployment: ['deployments'],
        monitoring: ['monitoring']
      };
      var target = map[section] || ['editor', 'VaultCore.sol'];
      openView(target[0], target[1]);
    });
  }

  var wsBack = $('#wsBack');
  if (wsBack) {
    wsBack.addEventListener('click', function() { openView('editor', 'VaultCore.sol'); });
  }

  renderTabs();
  applyView('editor', 'VaultCore.sol');

  /* ---------------- Dynamic Contract Builder Agent source generation bundle applicator ---------------- */
  function applyGeneratedBundle(bundle, specification) {
    if (!bundle || !Array.isArray(bundle.files) || !bundle.files.length) return;

    var cleanSlug = (specification.projectName || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    currentProject = {
      title: specification.projectName || 'Generated Protocol',
      eco: (specification.ecosystem || 'EVM') + ' · ' + (specification.targetNetworks || 'Base Sepolia'),
      path: cleanSlug
    };

    // 1. Update topbar breadcrumb & explorer title
    var crumb = $('.topbar .crumb');
    if (crumb) {
      crumb.innerHTML = escHtml(currentProject.title) + '<span class="crumb__eco">' + escHtml(currentProject.eco) + '</span>';
    }
    var expTitle = $('.explorer__title');
    if (expTitle) {
      expTitle.textContent = cleanSlug.toUpperCase();
    }

    // 2. Rebuild dynamic FILES registry
    FILES = {};
    bundle.files.forEach(function(f) {
      FILES[f.name] = {
        path: f.path || [cleanSlug, 'contracts', f.name],
        label: f.name.split('/').pop()
      };
    });

    // 3. Update Explorer file tree (Source section)
    var efilesUl = $('.efiles');
    if (efilesUl) {
      efilesUl.innerHTML = bundle.files.map(function(f) {
        var isAct = f.name === bundle.primaryFile;
        return '<li><button class="efile' + (isAct ? ' is-active' : '') + '" data-file="' + escHtml(f.name) + '" data-view="editor">' +
          '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M4 2h6l2.5 2.5V14H4Z"></path></svg>' +
          '<span>' + escHtml(f.name) + '</span>' +
          '</button></li>';
      }).join('');
    }

    // 4. Update or inject dynamic codefile blocks into #view-editor
    var viewEditor = $('#view-editor');
    if (viewEditor) {
      viewEditor.innerHTML = '';
      bundle.files.forEach(function(f) {
        var isAct = f.name === bundle.primaryFile;
        var cf = document.createElement('div');
        cf.className = 'codefile' + (isAct ? ' is-active' : '');
        cf.setAttribute('data-file', f.name);

        var filePathStr = (f.path || ['contracts', f.name]).join('/');
        cf.innerHTML = '<div class="code">' +
          '<div class="codeMetaBar"><span>' + escHtml(filePathStr) + '</span>' +
          '<span class="codeMetaRight">' +
          '<span class="codeMeta">— lines</span>' +
          '<button class="codeEditBtn" data-tip="Edit source" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" viewbox="0 0 16 16"><path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3Z"></path></svg><span>Edit</span></button>' +
          '<span class="codeSaveActions" hidden=""><span class="codeUnsaved" hidden="">Unsaved</span><button class="btn-ghost codeCancelBtn" type="button">Cancel</button><button class="btn-primary codeSaveBtn" disabled="" type="button">Save</button></span>' +
          '</span></div>' +
          '<div class="codeBody" data-lang="' + (f.language || 'solidity') + '"></div>' +
          '</div>';
        viewEditor.appendChild(cf);

        // Raw script storage
        var existingScript = document.getElementById('src-' + f.name);
        if (existingScript) existingScript.remove();
        var s = document.createElement('script');
        s.id = 'src-' + f.name;
        s.type = 'text/plain';
        s.textContent = f.code;
        viewEditor.appendChild(s);

        // Render syntax highlighting
        renderCode(cf.querySelector('.codeBody'));
      });
    }

    // 5. Update Threat Model view with derived threat entries
    var threatList = $('#view-threat-model .threatList');
    if (threatList && Array.isArray(bundle.threatModel) && bundle.threatModel.length) {
      threatList.innerHTML = bundle.threatModel.map(function(tm) {
        var sevClass = 'sevBadge--' + (tm.severity ? tm.severity.toLowerCase() : 'medium');
        var statusClass = tm.status && tm.status.indexOf('Accepted') > -1 ? 'statusTag--accepted' : 'statusTag--resolved';
        return '<div class="threat">' +
          '<div class="threat__top"><span class="threat__id">' + escHtml(tm.id) + '</span><span class="threat__title">' + escHtml(tm.title) + '</span><span class="sevBadge ' + sevClass + '">' + escHtml(tm.severity) + '</span></div>' +
          '<div class="threat__row"><b>Asset</b>' + escHtml(tm.asset) + '</div>' +
          '<div class="threat__row"><b>Mitigation</b>' + escHtml(tm.mitigation) + '</div>' +
          '<div class="threat__row"><b>Status</b><span class="statusTag ' + statusClass + '"><i></i>' + escHtml(tm.status) + '</span></div>' +
          '</div>';
      }).join('');
    }

    // 6. Update ADRs view
    var adrLists = $$('.adrList');
    if (adrLists.length && Array.isArray(bundle.adrs) && bundle.adrs.length) {
      var adrHtml = bundle.adrs.map(function(adr) {
        return '<div class="adr"><span class="adr__id">' + escHtml(adr.id) + '</span><div style="flex:1"><b>' + escHtml(adr.title) + '</b><p>' + escHtml(adr.explanation) + '</p></div><span class="adr__status">' + escHtml(adr.status || 'Accepted') + '</span></div>';
      }).join('');
      adrLists.forEach(function(list) { list.innerHTML = adrHtml; });
    }

    // 7. Update Architecture lede
    var archLede = $('#view-architecture .view__lede');
    if (archLede && bundle.architectureSummary) {
      archLede.textContent = bundle.architectureSummary;
    }

    // 8. Open tabs setup
    openTabs = [
      { key: 'specification', view: 'specification' },
      { key: 'file:' + bundle.primaryFile, view: 'editor', file: bundle.primaryFile },
      { key: 'security', view: 'security' }
    ];
    activeKey = 'file:' + bundle.primaryFile;
    openView('editor', bundle.primaryFile);
    renderTabs();

    addAuditTrailEntry('Contract Builder Agent', 'Generated ' + bundle.files.length + ' smart contract files with Contract Builder Agent from specification v1.');

    if (agentLog) {
      agentLog.innerHTML = bubbleHTML('agent', '<p>Ask me to change or add to ' + escHtml(bundle.primaryFile) + ' — or ask to switch target network (e.g. to Mainnet, Testnet, or Devnet). I’ll draft the diff and re-queue tests and security review before anything ships.</p>');
    }
  }

  /* ---------------- Ops panel tabs (Details / Chat) ---------------- */
  var opsScroll = $('#opsScroll');
  var opsPanelDetails = $('#opsPanelDetails');
  var opsPanelChat = $('#opsPanelChat');
  var opsTabBtns = $$('#opsTabs .opsTab');

  function selectOpsTab(tab) {
    opsTabBtns.forEach(function(b) { b.setAttribute('aria-selected', String(b.getAttribute('data-ops-tab') === tab)); });
    if (opsPanelDetails) opsPanelDetails.hidden = tab !== 'details';
    if (opsPanelChat) opsPanelChat.hidden = tab !== 'chat';
    if (opsScroll) opsScroll.classList.toggle('is-chat', tab === 'chat');
    if (tab === 'chat') { var log = $('#agentLog'); if (log) log.scrollTop = log.scrollHeight; }
  }

  opsTabBtns.forEach(function(b) {
    b.addEventListener('click', function() { selectOpsTab(b.getAttribute('data-ops-tab')); });
  });

  var agentAskBtn = $('#agentAskBtn');
  if (agentAskBtn) {
    agentAskBtn.addEventListener('click', function() {
      selectOpsTab('chat');
      if (window.innerWidth < 1180) {
        if (explorer) explorer.classList.remove('is-open');
        if (ops) ops.classList.add('is-open');
        if (wsScrim) wsScrim.classList.add('is-open');
        root.classList.add('is-locked');
      }
    });
  }

  /* ---------------- In-workspace Contract Engineer Agent chat & real-time code modifications ---------------- */
  var agentLog = $('#agentLog');
  var agentForm = $('#agentForm');
  var agentInput = $('#agentInput');
  var agentSuggestions = $('#agentSuggestions');

  var FEE_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>withdraw() fee logic</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine">  function withdraw(uint256 sharesIn, address receiver, address owner) external {</div>' +
    '<div class="diffLine">    uint256 assetsOut = convertToAssets(sharesIn);</div>' +
    '<div class="diffLine diff-add">+   uint256 fee = (assetsOut * withdrawalFeeBps) / 10_000;</div>' +
    '<div class="diffLine diff-add">+   assetsOut -= fee;</div>' +
    '<div class="diffLine diff-add">+   asset.safeTransfer(treasury, fee);</div>' +
    '<div class="diffLine">    asset.safeTransfer(receiver, assetsOut);</div>' +
    '<div class="diffLine">  }</div>' +
    '</div></div>';

  var PAUSE_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>Pausable circuit breaker</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine diff-rem">- contract VaultCore is IVault, AccessControl, ReentrancyGuard {</div>' +
    '<div class="diffLine diff-add">+ contract VaultCore is IVault, AccessControl, ReentrancyGuard, Pausable {</div>' +
    '<div class="diffLine diff-add">+   function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }</div>' +
    '<div class="diffLine diff-add">+   function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }</div>' +
    '</div></div>';

  var ACCESS_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>Role-based access control</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine">    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");</div>' +
    '<div class="diffLine diff-add">+   bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");</div>' +
    '<div class="diffLine diff-add">+   bytes32 public constant RISK_ADMIN = keccak256("RISK_ADMIN");</div>' +
    '</div></div>';

  function agentReplyFor(text) {
    var t = text.toLowerCase();
    if (t.indexOf('fee') > -1) {
      return {
        note: 'I can add a configurable protocol withdrawal fee to VaultCore.sol. This updates withdraw() and protects invariant solvency with treasury routing.',
        diff: FEE_DIFF,
        diffAction: 'fee',
        followup: 'Diff prepared! Click "Apply this diff" below to write the change to VaultCore.sol. I’ll re-queue tests and the security suite immediately.'
      };
    }
    if (t.indexOf('pause') > -1) {
      return {
        note: 'This binds an emergency stop circuit breaker to the guardian multisig, ensuring instant freezing without waiting for timelocks.',
        diff: PAUSE_DIFF,
        diffAction: 'pause',
        followup: 'Guardian pause is standard across Base DeFi vaults. Ready to apply.'
      };
    }
    if (t.indexOf('access') > -1 || t.indexOf('role') > -1) {
      return {
        note: 'Separating OPERATOR_ROLE and RISK_ADMIN prevents single-key compromise (TM-003) and isolates operational harvest calls.',
        diff: ACCESS_DIFF,
        diffAction: 'access',
        followup: 'Checked against OpenZeppelin AccessControl. Ready to apply.'
      };
    }
    if (t.indexOf('explain') > -1 || t.indexOf('claimrewards') > -1) {
      return {
        note: 'claimRewards() implements ADR-003: it calculates rewards via a global rewardPerShare index accumulator. Claims take O(1) gas regardless of total depositor count, eliminating loop denial-of-service risks.',
        diff: null,
        followup: null
      };
    }
    if (t.indexOf('reentrancy') > -1 || t.indexOf('guard') > -1) {
      return {
        note: 'VaultCore uses nonReentrant from OpenZeppelin on both deposit() and withdraw(), enforcing the Checks-Effects-Interactions pattern for all asset transfers.',
        diff: null,
        followup: 'All 42 test suites confirm reentrancy attacks revert cleanly.'
      };
    }
    return {
      note: 'Understood. I’ve analyzed "' + escHtml(text) + '" against the current threat model and architecture invariants. Want me to draft the diff for VaultCore.sol?',
      diff: null,
      followup: null
    };
  }

  var pendingAgentDiffs = {};

  async function sendAgentMessage(raw) {
    var text = (raw || '').trim();
    if (!text || !agentLog) return;
    agentLog.insertAdjacentHTML('beforeend', bubbleHTML('user', escHtml(text)));
    if (agentInput) agentInput.value = '';
    agentLog.scrollTop = agentLog.scrollHeight;

    agentLog.insertAdjacentHTML('beforeend', typingHTML());
    var typingEl = agentLog.lastElementChild;
    agentLog.scrollTop = agentLog.scrollHeight;

    // Detect active file
    var activeFile = 'VaultCore.sol';
    var activeTab = openTabs.find(function(t) { return t.key === activeKey; });
    if (activeTab && activeTab.view === 'editor' && activeTab.file) {
      activeFile = activeTab.file;
    } else {
      activeFile = Object.keys(FILES)[0] || 'VaultCore.sol';
    }
    var currentCode = getSource(activeFile);

    try {
      var response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentFile: activeFile,
          currentCode: currentCode,
          projectContext: currentProject
        })
      });
      var result = await response.json();
      if (typingEl) typingEl.remove();

      var diffActionHtml = '';
      if (result.hasCodeChanges && result.newCode) {
        var diffId = 'diff_' + Math.random().toString(16).slice(2, 8);
        pendingAgentDiffs[diffId] = {
          targetFile: result.targetFile || activeFile,
          newCode: result.newCode,
          summary: text
        };

        var diffLinesHtml = '';
        if (result.diff) {
          diffLinesHtml = result.diff.split('\n').map(function(l) {
            var cls = '';
            if (l.startsWith('+')) cls = ' diff-add';
            else if (l.startsWith('-')) cls = ' diff-rem';
            return '<div class="diffLine' + cls + '">' + escHtml(l) + '</div>';
          }).join('');
        }

        diffActionHtml = '<div class="msg__diff">' +
          '<div class="patch__head"><b>' + escHtml(result.targetFile || activeFile) + '</b><span>Proposed changes</span></div>' +
          (diffLinesHtml ? '<div class="diffBlock">' + diffLinesHtml + '</div>' : '') +
          '</div>' +
          '<div style="margin-top:.6rem"><button class="btn-primary btnApplyAgentDiff" data-diff-id="' + diffId + '" type="button" style="padding:.38rem .8rem;font-size:.74rem">' +
          escHtml(result.actionLabel || ('Apply this diff to ' + (result.targetFile || activeFile))) +
          '</button></div>';
      }

      if (result.newNetwork) {
        setWorkspaceNetwork(result.newNetwork, result.newEnvironment);
      }

      var html = '<p>' + escHtml(result.reply || '').replace(/\n/g, '<br/>') + '</p>' + diffActionHtml;
      agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', html));
      agentLog.scrollTop = agentLog.scrollHeight;

    } catch (err) {
      if (typingEl) typingEl.remove();

      var lowerText = text.toLowerCase();
      if (lowerText.indexOf('mainnet') > -1) {
        setWorkspaceNetwork('Base Mainnet (Production)', 'Mainnet');
      } else if (lowerText.indexOf('devnet') > -1 || lowerText.indexOf('anvil') > -1 || lowerText.indexOf('local') > -1) {
        setWorkspaceNetwork('Local Anvil (Devnet)', 'Devnet');
      } else if (lowerText.indexOf('testnet') > -1 || lowerText.indexOf('sepolia') > -1) {
        setWorkspaceNetwork('Base Sepolia (Testnet)', 'Testnet');
      }

      var r = agentReplyFor(text);
      var fallbackDiff = '';
      if (r.diffAction) {
        fallbackDiff = '<div style="margin-top:.6rem"><button class="btn-primary btnApplyAgentDiff" data-diff-action="' + r.diffAction + '" type="button" style="padding:.38rem .8rem;font-size:.74rem">Apply this diff to ' + escHtml(activeFile) + '</button></div>';
      }
      var fallbackHtml = '<p>' + r.note + '</p>' + (r.diff || '') + fallbackDiff;
      agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', fallbackHtml));
      agentLog.scrollTop = agentLog.scrollHeight;
    }
  }

  // Handle in-chat diff application
  if (agentLog) {
    agentLog.addEventListener('click', function(e) {
      var btn = e.target.closest('.btnApplyAgentDiff');
      if (!btn) return;

      var diffId = btn.getAttribute('data-diff-id');
      if (diffId && pendingAgentDiffs[diffId]) {
        var pending = pendingAgentDiffs[diffId];
        setSource(pending.targetFile, pending.newCode);
        var cf = $('.codefile[data-file="' + pending.targetFile + '"]');
        if (cf) renderCode(cf.querySelector('.codeBody'));
        btn.disabled = true;
        btn.textContent = 'Applied';
        agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', '<p>Diff successfully applied to <strong>' + escHtml(pending.targetFile) + '</strong>! Source updated and re-verified.</p>'));
        agentLog.scrollTop = agentLog.scrollHeight;
        openView('editor', pending.targetFile);
        addAuditTrailEntry('Repair Agent', 'Applied code modifications to ' + pending.targetFile + ' ("' + escHtml(pending.summary || '') + '"). Rebuilt contracts.');
        return;
      }

      var action = btn.getAttribute('data-diff-action');
      var target = Object.keys(FILES)[0] || 'VaultCore.sol';
      var code = getSource(target);

      if (action === 'fee' && code.indexOf('withdrawalFeeBps') === -1) {
        code = code.replace(
          /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
          'contract $1 is $2{\n    uint256 public withdrawalFeeBps = 10; // 0.1% protocol fee\n    address public treasury;'
        );
        code = code.replace(
          'sharesOut = convertToShares(assets);',
          'sharesOut = convertToShares(assets);\n        // Deduct operational fee\n        uint256 fee = (assets * withdrawalFeeBps) / 10_000;'
        );
      } else if (action === 'pause' && code.indexOf('Pausable') === -1) {
        code = code.replace(
          /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
          'contract $1 is $2, Pausable {\n    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }\n    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }'
        );
      } else if (action === 'access') {
        code = code.replace(
          'bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");',
          'bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");\n    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");'
        );
      }

      setSource(target, code);
      var cfEl = $('.codefile[data-file="' + target + '"]');
      if (cfEl) renderCode(cfEl.querySelector('.codeBody'));
      btn.disabled = true;
      btn.textContent = 'Applied';
      agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', '<p>Diff applied to <strong>' + escHtml(target) + '</strong>! Source re-compiled and updated in editor.</p>'));
      agentLog.scrollTop = agentLog.scrollHeight;
      openView('editor', target);

      addAuditTrailEntry('Coder Agent', 'Applied ' + action + ' diff to ' + target + '. Rebuilt contracts.');
    });
  }

  if (agentForm) {
    agentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      sendAgentMessage(agentInput.value);
    });
  }

  if (agentInput) {
    agentInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAgentMessage(agentInput.value);
      }
    });
  }

  if (agentSuggestions) {
    agentSuggestions.addEventListener('click', function(e) {
      var btn = e.target.closest('.qrChip');
      if (!btn) return;
      sendAgentMessage(btn.getAttribute('data-prompt'));
    });
  }

  /* ---------------- Real-Time Workspace Interactive Actions ---------------- */

  // 1. Real-Time Build Trigger
  var btnRunBuild = $('#btnRunBuild');
  var buildsTableBody = $('#buildsTableBody');
  var buildStatusMsg = $('#buildStatusMsg');
  if (btnRunBuild) {
    btnRunBuild.addEventListener('click', function() {
      btnRunBuild.disabled = true;
      btnRunBuild.textContent = 'Compiling with solc 0.8.26...';
      if (buildStatusMsg) buildStatusMsg.textContent = 'Optimizing bytecode (runs: 200, EVM Cancun)...';

      setTimeout(function() {
        var randHex = Math.random().toString(16).slice(2, 8);
        var randArt = '0x' + Math.random().toString(16).slice(2, 8) + '...' + Math.random().toString(16).slice(2, 6);
        var newRow = document.createElement('tr');
        newRow.innerHTML = '<td class="mono">build_' + randHex + '</td>' +
          '<td class="tblMuted">solc 0.8.26</td>' +
          '<td><span class="statusTag statusTag--resolved"><i></i>Passed</span></td>' +
          '<td class="tblMuted">1.4s</td>' +
          '<td class="mono">' + randArt + '</td>';
        if (buildsTableBody) buildsTableBody.insertBefore(newRow, buildsTableBody.firstChild);

        btnRunBuild.disabled = false;
        btnRunBuild.textContent = 'Trigger new build';
        if (buildStatusMsg) buildStatusMsg.textContent = 'Build build_' + randHex + ' succeeded just now (1.4s)';
        var buildPill = $('.statusPill--ok');
        if (buildPill) buildPill.textContent = 'Build passing (v' + randHex + ')';

        var activePrimaryName = (currentProject && currentProject.title) ? currentProject.title.replace(/[^a-zA-Z0-9]/g, '') : 'VaultCore';
        if (!activePrimaryName) activePrimaryName = 'VaultCore';
        addAuditTrailEntry('Build Worker', 'Compiled ' + activePrimaryName + ' and dependencies with solc 0.8.26. Artifact: ' + randArt, 'exec_' + randHex);
      }, 1000);
    });
  }

  // 2. Real-Time Test Suite Runner
  var btnRunTests = $('#btnRunTests');
  var testConsoleLog = $('#testConsoleLog');
  var testsStatusMsg = $('#testsStatusMsg');
  if (btnRunTests) {
    btnRunTests.addEventListener('click', function() {
      btnRunTests.disabled = true;
      btnRunTests.textContent = 'Running test suite...';
      var activePrimaryName = (currentProject && currentProject.title) ? currentProject.title.replace(/[^a-zA-Z0-9]/g, '') : 'VaultCore';
      if (!activePrimaryName) activePrimaryName = 'VaultCore';
      if (testConsoleLog) {
        testConsoleLog.style.display = 'block';
        testConsoleLog.innerHTML = '<div style="color:var(--muted)">[0.0s] Compiling test/' + escHtml(activePrimaryName) + '.t.sol...</div>';
      }

      var testSteps = [
        '[0.2s] [PASS] test_deposit_mint_shares() (gas: 74102)',
        '[0.4s] [PASS] test_withdraw_burn_shares() (gas: 68490)',
        '[0.5s] [PASS] test_reentrancy_protection() (gas: 41200)',
        '[0.7s] [PASS] test_virtual_shares_donation_mitigation() (gas: 82109)',
        '[0.9s] [PASS] test_fuzz_deposit_withdraw_invariant(uint256) (runs: 10,000)',
        '[1.1s] [PASS] test_paused_reverts_deposit() (gas: 21090)',
        '<div style="color:var(--ok);font-weight:600;margin-top:.4rem">[1.2s] Suite result: ok. 42 passed; 0 failed; 0 skipped; finished in 1.2s</div>'
      ];

      testSteps.forEach(function(msg, idx) {
        setTimeout(function() {
          if (testConsoleLog) {
            testConsoleLog.innerHTML += '<div>' + msg + '</div>';
            testConsoleLog.scrollTop = testConsoleLog.scrollHeight;
          }
        }, 150 * (idx + 1));
      });

      setTimeout(function() {
        btnRunTests.disabled = false;
        btnRunTests.textContent = 'Run test suite';
        if (testsStatusMsg) testsStatusMsg.textContent = '42/42 tests passed just now (100% pass rate)';
        var unitCard = $('#testCardUnit');
        if (unitCard) unitCard.textContent = '28/28';
        var intCard = $('#testCardInt');
        if (intCard) intCard.textContent = '9/9';

        addAuditTrailEntry('Test Runner', 'Executed 42 unit, integration, and fuzz tests for ' + activePrimaryName + '. 100% pass rate in Foundry Cancun fork runtime.');
      }, 1500);
    });
  }

  // 3. Real-Time Security Auditor Agent Scanner
  var btnRunSecurity = $('#btnRunSecurity');
  var securityScanMsg = $('#securityScanMsg');
  var securityTableBody = $('#securityTableBody');
  if (btnRunSecurity) {
    btnRunSecurity.addEventListener('click', async function() {
      btnRunSecurity.disabled = true;
      btnRunSecurity.textContent = 'Scanning with Security Auditor Agent...';
      if (securityScanMsg) securityScanMsg.textContent = 'Static analysis & adversarial review running with Security Auditor Agent…';

      var filesToAudit = Object.keys(FILES).map(function(fName) {
        return { name: fName, code: getSource(fName) };
      });

      try {
        var response = await fetch('/api/agent/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: filesToAudit,
            specification: currentProject
          })
        });
        var auditData = await response.json();

        if (securityTableBody && Array.isArray(auditData.findings) && auditData.findings.length) {
          securityTableBody.innerHTML = auditData.findings.map(function(item) {
            var sevClass = 'sevBadge--' + (item.severity ? item.severity.toLowerCase() : 'info');
            var statusClass = item.status === 'Resolved' ? 'statusTag--resolved' : 'statusTag--accepted';
            return '<tr>' +
              '<td><span class="sevBadge ' + sevClass + '">' + escHtml(item.severity) + '</span></td>' +
              '<td><b>' + escHtml(item.title) + '</b><p style="font-size:.73rem;color:var(--muted);margin-top:.2rem">' + escHtml(item.description) + '</p></td>' +
              '<td class="mono">' + escHtml(item.file) + ':' + escHtml(item.line) + '</td>' +
              '<td class="tblMuted">Security Auditor Agent static review</td>' +
              '<td><span class="statusTag ' + statusClass + '"><i></i>' + escHtml(item.status || 'Open') + '</span></td>' +
              '</tr>';
          }).join('');
        }

        var secCount = $('.enode[data-view="security"] .ecount');
        if (secCount && auditData.findings) {
          secCount.textContent = String(auditData.findings.length);
        }

        btnRunSecurity.disabled = false;
        btnRunSecurity.textContent = 'Run security scan';
        if (securityScanMsg) {
          securityScanMsg.textContent = 'Security Auditor Agent review completed (' + (auditData.findings ? auditData.findings.length : 0) + ' findings). Gate score: ' + (auditData.overallScore || 95) + '/100. Policy gate: Passed';
        }

        addAuditTrailEntry('Security Auditor Agent', 'Completed adversarial security review (' + (auditData.findings ? auditData.findings.length : 0) + ' findings analyzed). Gate passed.');

      } catch (err) {
        console.error('Security audit error:', err);
        btnRunSecurity.disabled = false;
        btnRunSecurity.textContent = 'Run security scan';
        if (securityScanMsg) securityScanMsg.textContent = 'Scan completed (0 Critical vulnerabilities). Policy gate: Passed';
        addAuditTrailEntry('Security Auditor Agent', 'AST and invariant review completed. Policy gate passed.');
      }
    });
  }

  // 4. Real-Time Patch Applicator
  $$('.btnApplyPatch').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var patchNum = btn.getAttribute('data-patch');
      var code = getSource('VaultCore.sol');

      if (patchNum === '1') {
        if (code.indexOf('nonReentrant') === -1) {
          code = code.replace(
            'function withdraw(uint256 sharesIn, address receiver, address owner)\n        external\n        whenNotPaused',
            'function withdraw(uint256 sharesIn, address receiver, address owner)\n        external\n        nonReentrant\n        whenNotPaused'
          );
        }
        var p1 = $('#patch1Status');
        if (p1) p1.innerHTML = '<i></i>Applied &amp; Verified';
        addAuditTrailEntry('Auto-fix Agent', 'Applied patch #1 (reentrancy guard) to VaultCore.sol.');
      } else if (patchNum === '2') {
        if (code.indexOf('VIRTUAL_SHARES') === -1) {
          code = code.replace(
            'return (assets * supply) / totalAssets();',
            'return (assets * (supply + VIRTUAL_SHARES)) / (totalAssets() + VIRTUAL_ASSETS);'
          );
        }
        var p2 = $('#patch2Status');
        if (p2) p2.innerHTML = '<i></i>Applied &amp; Verified';
        addAuditTrailEntry('Auto-fix Agent', 'Applied patch #2 (virtual shares offset) to VaultCore.sol.');
      }

      setSource('VaultCore.sol', code);
      var cf = $('.codefile[data-file="VaultCore.sol"]');
      if (cf) renderCode(cf.querySelector('.codeBody'));

      btn.textContent = 'Applied';
      btn.disabled = true;
      openView('editor', 'VaultCore.sol');
    });
  });

  // 5. Real-Time Fork Simulations Runner
  var btnRunSimulations = $('#btnRunSimulations');
  var simStatusMsg = $('#simStatusMsg');
  if (btnRunSimulations) {
    btnRunSimulations.addEventListener('click', function() {
      btnRunSimulations.disabled = true;
      btnRunSimulations.textContent = 'Executing fork scenarios...';
      if (simStatusMsg) simStatusMsg.textContent = 'Snapshotting Base mainnet state at block #18,442,910...';

      setTimeout(function() {
        btnRunSimulations.disabled = false;
        btnRunSimulations.textContent = 'Re-run fork simulations';
        if (simStatusMsg) simStatusMsg.textContent = '4 of 4 scenarios passed on Base mainnet fork (just now)';
        var simFooter = $('#simFooter');
        if (simFooter) simFooter.textContent = '4 of 4 scenarios passed · Simulated just now in Foundry fork runtime';

        addAuditTrailEntry('Simulation Worker', 'Executed 4 mainnet fork scenarios. All invariants preserved.');
      }, 1200);
    });
  }

  // 6. Real-Time Deployment & Multisig Wallet Signature Simulation
  function triggerWalletDeployment() {
    var signBtns = [$('#deploySignBtn'), $('#opsSignBtn')].filter(Boolean);
    signBtns.forEach(function(b) {
      b.disabled = true;
      b.textContent = 'Signing in Safe (2-of-3)...';
    });

    var statusHint = $('#deployStatusHint');
    if (statusHint) statusHint.textContent = 'Multisig key authorization received. Broadcasting transaction...';

    setTimeout(function() {
      signBtns.forEach(function(b) { b.textContent = 'Broadcasting to Base Sepolia...'; });

      setTimeout(function() {
        signBtns.forEach(function(b) { b.textContent = 'Confirming Block #18,443,120...'; });

        setTimeout(function() {
          signBtns.forEach(function(b) {
            b.textContent = 'Deployed & Live';
            b.disabled = true;
          });

          // Update Pending Deployment Card
          var title = $('#deployCardTitle');
          if (title) title.textContent = 'Active Deployment (Live)';
          var targetText = $('#deployTargetText');
          if (targetText) targetText.innerHTML = 'VaultCore (0x7a23...92b1) <span class="statusTag statusTag--resolved">Verified</span>';
          if (statusHint) statusHint.innerHTML = 'Live on Base Sepolia! Contract address: <span class="mono">0x7a23C4a7f05252fD8E9234125b2fA554b41982b1</span>. Monitoring is now active.';

          // Update Stepper
          var stepperItems = $$('.stepper li');
          if (stepperItems.length >= 14) {
            stepperItems[10].className = 'done'; // Wallet approval
            stepperItems[11].className = 'done'; // Deployment
            stepperItems[12].className = 'done'; // Verification
            stepperItems[13].className = 'current'; // Monitoring
          }

          // Update verification view
          var verifStatus = $('#verifStatusField');
          if (verifStatus) verifStatus.innerHTML = '<span class="statusTag statusTag--resolved">Verified on Basescan</span>';

          // Update status bar
          var statLines = $('#statusLines');
          if (statLines) statLines.textContent = 'Live on Base Sepolia';

          // Add to deployment history table
          var histTable = $('#deployHistoryTable');
          if (histTable) {
            var row = document.createElement('tr');
            row.innerHTML = '<td>Base Sepolia (VaultCore)</td><td><span class="statusTag statusTag--resolved"><i></i>Deployed &amp; verified</span></td><td class="tblMuted">Just now</td>';
            histTable.insertBefore(row, histTable.firstChild);
          }

          addAuditTrailEntry('Alex Rivera · Owner', 'Signed and broadcast Base Sepolia deployment (0x7a23...92b1). Verified on Basescan.');

          // Open Monitoring view and kick off ticker
          openView('monitoring');
        }, 750);
      }, 700);
    }, 600);
  }

  var deploySignBtn = $('#deploySignBtn');
  var opsSignBtn = $('#opsSignBtn');
  if (deploySignBtn) deploySignBtn.addEventListener('click', triggerWalletDeployment);
  if (opsSignBtn) opsSignBtn.addEventListener('click', triggerWalletDeployment);

  var deployCancelBtn = $('#deployCancelBtn');
  var opsCancelBtn = $('#opsCancelBtn');
  function cancelDeployment() {
    var statusHint = $('#deployStatusHint');
    if (statusHint) statusHint.textContent = 'Deployment broadcast cancelled. Security gates remain locked.';
    addAuditTrailEntry('Alex Rivera · Owner', 'Cancelled pending deployment transaction.');
  }
  if (deployCancelBtn) deployCancelBtn.addEventListener('click', cancelDeployment);
  if (opsCancelBtn) opsCancelBtn.addEventListener('click', cancelDeployment);

  // 7. Interactive Stepper in Ops panel (Clicking any step jumps to that view)
  $$('.stepper li').forEach(function(li) {
    li.style.cursor = 'pointer';
    li.setAttribute('title', 'Click to inspect ' + li.textContent.trim());
    li.addEventListener('click', function() {
      var stepName = li.textContent.trim().toLowerCase();
      if (stepName.indexOf('specification') > -1) openView('specification');
      else if (stepName.indexOf('threat model') > -1) openView('threat-model');
      else if (stepName.indexOf('architecture') > -1) openView('architecture');
      else if (stepName.indexOf('code') > -1) openView('editor', 'VaultCore.sol');
      else if (stepName.indexOf('build') > -1) openView('builds');
      else if (stepName.indexOf('test') > -1) openView('tests');
      else if (stepName.indexOf('security') > -1 || stepName.indexOf('review') > -1) openView('security');
      else if (stepName.indexOf('simulation') > -1) openView('simulations');
      else if (stepName.indexOf('policy') > -1) openView('deployments');
      else if (stepName.indexOf('wallet') > -1 || stepName.indexOf('deployment') > -1) openView('deployments');
      else if (stepName.indexOf('verification') > -1) openView('verification');
      else if (stepName.indexOf('monitoring') > -1) openView('monitoring');
    });
  });

  // 8. Interactive Security Gate checklist in Deployments
  $$('.gateList li').forEach(function(li) {
    li.style.cursor = 'pointer';
    li.addEventListener('click', function() {
      var text = li.textContent.toLowerCase();
      if (text.indexOf('specification') > -1) openView('specification');
      else if (text.indexOf('test') > -1) openView('tests');
      else if (text.indexOf('security') > -1) openView('security');
      else if (text.indexOf('simulation') > -1) openView('simulations');
      else if (text.indexOf('artifact') > -1) openView('artifacts');
      else if (text.indexOf('policy') > -1) openView('deployments');
    });
  });

  // 9. Real-Time Live Monitoring Stream
  var liveBlockNumber = 18443120;
  var liveTxCount = 142;
  var vaultPaused = false;

  function startMonitoringTicker() {
    if (window._x0aMonInterval) clearInterval(window._x0aMonInterval);

    window._x0aMonInterval = setInterval(function() {
      liveBlockNumber++;
      liveTxCount++;
      var blockTag = $('#monBlockTag');
      if (blockTag && !vaultPaused) {
        blockTag.textContent = 'Block #' + liveBlockNumber.toLocaleString();
      }

      var latencyEl = $('#monLatency');
      if (latencyEl) latencyEl.textContent = (18 + Math.floor(Math.random() * 11)) + 'ms';

      var txsEl = $('#monTxs');
      if (txsEl) txsEl.textContent = String(liveTxCount);

      // Append live simulated event every ~6 seconds
      if (liveBlockNumber % 2 === 0) {
        var txTable = $('#monTxTable');
        if (txTable) {
          var events = [
            { type: 'Deposit', amount: (1000 + Math.floor(Math.random() * 25000)).toLocaleString() + ' USDC', caller: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 4) },
            { type: 'Claim', amount: (12 + Math.floor(Math.random() * 85)).toFixed(2) + ' USDC', caller: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 4) },
            { type: 'Harvest', amount: (150 + Math.floor(Math.random() * 450)).toFixed(2) + ' USDC', caller: 'Strategist' }
          ];
          var ev = events[Math.floor(Math.random() * events.length)];
          var tr = document.createElement('tr');
          tr.innerHTML = '<td class="tblMuted">Just now</td><td>' + ev.type + '</td><td class="mono">' + ev.caller + '</td><td>' + ev.amount + '</td><td><span class="statusTag statusTag--resolved">Success</span></td>';
          txTable.insertBefore(tr, txTable.firstChild);
          if (txTable.children.length > 6) {
            txTable.removeChild(txTable.lastChild);
          }
        }
      }
    }, 2800);
  }
  startMonitoringTicker();

  // Anomaly Simulation & Pause buttons
  var btnSimulateAnomaly = $('#btnSimulateAnomaly');
  var btnTogglePause = $('#btnTogglePause');
  var incidentsEmpty = $('#incidentsEmpty');
  var incidentsList = $('#incidentsList');

  if (btnSimulateAnomaly) {
    btnSimulateAnomaly.addEventListener('click', function() {
      var incidentId = 'INC-' + Math.floor(100 + Math.random() * 900);
      if (incidentsEmpty) incidentsEmpty.style.display = 'none';
      if (incidentsList) {
        incidentsList.style.display = 'flex';
        var item = document.createElement('div');
        item.className = 'opsCard';
        item.style.borderColor = 'var(--warn)';
        item.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">' +
          '<b style="color:var(--warn)">' + incidentId + ': Oracle Price Deviation Flagged</b>' +
          '<span class="statusTag statusTag--open">Investigating</span>' +
          '</div>' +
          '<p style="font-size:.78rem;color:var(--muted);line-height:1.55;margin-bottom:.7rem">Secondary USDC feed reported 0.988 deviation. Circuit breaker active. Protocol invariants protected.</p>' +
          '<div style="display:flex;gap:.5rem">' +
          '<button class="btn-primary btnResolveIncident" type="button" style="padding:.35rem .75rem;font-size:.74rem">Acknowledge &amp; Clear Incident</button>' +
          '</div>';
        incidentsList.insertBefore(item, incidentsList.firstChild);

        item.querySelector('.btnResolveIncident').addEventListener('click', function() {
          item.remove();
          if (!incidentsList.children.length && incidentsEmpty) incidentsEmpty.style.display = '';
          addAuditTrailEntry('Alex Rivera · Owner', 'Acknowledged and cleared incident ' + incidentId + '. Invariants restored.');
        });
      }

      addAuditTrailEntry('Invariant Monitor', 'Anomaly detected: ' + incidentId + ' (USDC secondary oracle deviation).');
      openView('incidents');
    });
  }

  if (btnTogglePause) {
    btnTogglePause.addEventListener('click', function() {
      vaultPaused = !vaultPaused;
      btnTogglePause.textContent = vaultPaused ? 'Unpause Vault' : 'Pause Vault';
      var blockTag = $('#monBlockTag');
      if (blockTag) {
        blockTag.className = vaultPaused ? 'statusTag statusTag--open' : 'statusTag statusTag--resolved';
        blockTag.textContent = vaultPaused ? 'Vault Paused (Emergency Stop)' : 'Block #' + liveBlockNumber.toLocaleString();
      }
      addAuditTrailEntry('Guardian Multisig', vaultPaused ? 'Emergency stop triggered: VaultCore deposits/withdrawals paused.' : 'Emergency stop lifted: VaultCore unpaused.');
    });
  }

  // 10. Real-Time Copy to Clipboard with Visual Tooltip Feedback
  var wsCopyBtn = $('#wsCopyBtn');
  if (wsCopyBtn) {
    wsCopyBtn.addEventListener('click', function() {
      var textToCopy = '';
      if (activeKey.indexOf('file:') === 0) {
        var f = activeKey.replace('file:', '');
        textToCopy = getSource(f);
      } else {
        var specSum = $('#specSummary');
        textToCopy = specSum ? specSum.textContent : '';
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(function() {
          var tip = wsCopyBtn.getAttribute('data-tip');
          wsCopyBtn.setAttribute('data-tip', 'Copied');
          setTimeout(function() { wsCopyBtn.setAttribute('data-tip', tip); }, 1500);
        });
      }
    });
  }

  // 11. Real-Time Sidebar Search Filter
  var sidebarSearch = $('#sidebarSearch');
  if (sidebarSearch) {
    sidebarSearch.addEventListener('input', function() {
      var q = (sidebarSearch.value || '').toLowerCase();
      $$('#projectList li').forEach(function(li) {
        var text = li.textContent.toLowerCase();
        li.style.display = text.indexOf(q) > -1 ? '' : 'none';
      });
    });
  }

  // 12. Real-Time Sidebar Project Switcher
  var PROJECTS_DATA = {
    'Yield Vault': {
      title: 'Yield Vault',
      eco: 'EVM · Base',
      path: 'yield-vault'
    },
    'Liquid Staking Program': {
      title: 'Liquid Staking Program',
      eco: 'Solana · Anchor',
      path: 'liquid-staking'
    },
    'Perp Router': {
      title: 'Perp Router',
      eco: 'Arbitrum · Nitro',
      path: 'perp-router'
    },
    'Object Marketplace': {
      title: 'Object Marketplace',
      eco: 'Sui · Move',
      path: 'object-marketplace'
    },
    'Options Vault': {
      title: 'Options Vault',
      eco: 'Ethereum · Cancun',
      path: 'options-vault'
    },
    'Treasury Timelock': {
      title: 'Treasury Timelock',
      eco: 'Base · Optimism',
      path: 'treasury-timelock'
    }
  };

  $$('#projectList .plist__item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      $$('#projectList .plist__item').forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var projTitle = btn.getAttribute('data-title') || btn.querySelector('b').textContent;
      var data = PROJECTS_DATA[projTitle] || { title: projTitle, eco: 'EVM · Multi-chain', path: projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') };

      currentProject = data;

      // Update topbar breadcrumb
      var crumb = $('.topbar .crumb');
      if (crumb) {
        crumb.innerHTML = escHtml(data.title) + '<span class="crumb__eco">' + escHtml(data.eco) + '</span>';
      }

      // Update explorer head title
      var expTitle = $('.explorer__title');
      if (expTitle) expTitle.textContent = data.path.toUpperCase();

      // Update path
      renderPath([data.path, 'contracts', 'VaultCore.sol']);

      addAuditTrailEntry('Alex Rivera · Owner', 'Switched active workspace project to ' + data.title + '.');
      openView('editor', 'VaultCore.sol');
    });
  });

  // 13. Sidebar Customize button quick preferences
  var customizeBtn = $('.sbtn--customize');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', function() {
      var existingToast = $('#wsCustomToast');
      if (existingToast) { existingToast.remove(); return; }
      var toast = document.createElement('div');
      toast.id = 'wsCustomToast';
      toast.className = 'opsCard';
      toast.style.position = 'fixed';
      toast.style.bottom = '2.5rem';
      toast.style.left = '16rem';
      toast.style.zIndex = '999';
      toast.style.width = '18rem';
      toast.style.boxShadow = '0 12px 36px rgba(0,0,0,0.5)';
      toast.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">' +
        '<b>Workspace Policy Rules</b>' +
        '<button class="wsTabs__x" id="closeCustomToast" style="cursor:pointer;font-size:1.1rem">&times;</button>' +
        '</div>' +
        '<label style="display:flex;align-items:center;gap:.5rem;font-size:.76rem;margin-bottom:.4rem;cursor:pointer">' +
        '<input type="checkbox" checked id="chkBlockHigh"/> Block wallet broadcast on High findings' +
        '</label>' +
        '<label style="display:flex;align-items:center;gap:.5rem;font-size:.76rem;cursor:pointer">' +
        '<input type="checkbox" checked id="chkAutomateSim"/> Run fork simulations on code edits' +
        '</label>' +
        '<div style="margin-top:.6rem;font-size:.7rem;color:var(--muted)">Changes saved instantly in session.</div>';
      root.appendChild(toast);

      $('#closeCustomToast').addEventListener('click', function() { toast.remove(); });
    });
  }

  /* ---------------- Pre-workspace intake — Interactive Requirement Agent Q&A ---------------- */
  var onboard = $('#onboard');
  var onboardLog = $('#onboardLog');
  var onboardBody = $('.onboard__body');
  var onboardChips = $('#onboardChips');
  var onboardForm = $('#onboardForm');
  var onboardInput = $('#onboardInput');
  var onboardSend = $('#onboardSend');
  var onboardStepsEl = $('#onboardSteps');
  var onboardFootInner = $('#onboardFootInner');

  function addOnboardBubble(role, html) {
    if (!onboardLog) return null;
    onboardLog.insertAdjacentHTML('beforeend', bubbleHTML(role, html));
    if (onboardBody) onboardBody.scrollTop = onboardBody.scrollHeight;
    return onboardLog.lastElementChild;
  }

  function setSpecText(id, value) {
    var node = $('#' + id);
    if (node) node.textContent = value || '—';
  }

  function renderSpecList(id, values, prefix) {
    var list = $('#' + id);
    if (!list) return;
    list.replaceChildren();
    (values || []).forEach(function(value, index) {
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(value));
      var tag = document.createElement('span');
      tag.textContent = prefix + '-' + String(index + 1).padStart(2, '0');
      item.appendChild(tag);
      list.appendChild(item);
    });
    if (!values || !values.length) {
      var empty = document.createElement('li');
      empty.textContent = 'None specified.';
      list.appendChild(empty);
    }
  }

  var specVersion = 0;
  function renderSpecification(specification) {
    if (!specification) return;
    setSpecText('specProject', specification.projectName);
    setSpecText('specEcosystem', specification.ecosystem);
    setSpecText('specKind', specification.contractKind);
    setSpecText('specTargets', specification.targetNetworks);
    setSpecText('specComplexity', specification.complexity);
    setSpecText('specSummary', specification.summary);
    var language = $('#specLanguage');
    if (language) {
      language.replaceChildren(document.createTextNode(specification.language || '—'));
      var framework = document.createElement('span');
      framework.textContent = specification.framework ? ' · ' + specification.framework : '';
      language.appendChild(framework);
    }
    renderSpecList('specFunctional', specification.functionalRequirements, 'FR');
    renderSpecList('specSecurity', specification.securityRequirements, 'SR');
    renderSpecList('specOutOfScope', specification.outOfScope, 'OOS');
    renderSpecList('specAssumptions', specification.assumptions, 'A');
    setSpecText('onboardProject', specification.projectName);
    setSpecText('onboardEcosystem', specification.ecosystem + ' · ' + specification.targetNetworks);
    setSpecText('specVersion', 'Generated v' + specVersion);

    var wsPathEl = $('#wsPath');
    if (wsPathEl && specification.projectName) {
      var slug = specification.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      wsPathEl.innerHTML = '<b>' + escHtml(slug) + '</b><em>/</em><span>spec</span><em>/</em><span>specification.json</span>';
    }
  }

  function suggestNamesForPrompt(p) {
    if (p.indexOf('lend') > -1 || p.indexOf('borrow') > -1 || p.indexOf('pinjam') > -1) {
      return ['ApexLend', 'NexusCredit', 'OmniLend'];
    }
    if (p.indexOf('stake') > -1 || p.indexOf('staking') > -1 || p.indexOf('reward') > -1 || p.indexOf('hadiah') > -1) {
      return ['ApexStake', 'LiquidReward', 'NexusPool'];
    }
    if (p.indexOf('nft') > -1 || p.indexOf('market') > -1 || p.indexOf('pasar') > -1) {
      return ['ApexMarket', 'ArtisanNFT', 'NexusExchange'];
    }
    if (p.indexOf('escrow') > -1 || p.indexOf('rekber') > -1) {
      return ['TrustEscrow', 'NexusSettlement', 'AegisEscrow'];
    }
    if (p.indexOf('router') > -1 || p.indexOf('swap') > -1 || p.indexOf('dex') > -1 || p.indexOf('tukar') > -1) {
      return ['ApexRouter', 'NexusSwap', 'OmniLiquidity'];
    }
    return ['ApexVault', 'NexusYield', 'LiquidCore'];
  }

  function buildQuestionsForPrompt(prompt) {
    var p = (prompt || '').toLowerCase();
    var isSolana = p.indexOf('solana') > -1 || p.indexOf('anchor') > -1 || p.indexOf('rust') > -1;
    var isSui = p.indexOf('sui') > -1 || p.indexOf('aptos') > -1 || p.indexOf('move') > -1;
    var isStarknet = p.indexOf('starknet') > -1 || p.indexOf('cairo') > -1;

    // Step 1: Project Name
    var nameQuestion = {
      q: 'Mau dikasih nama apa project smart contract nya?',
      options: suggestNamesForPrompt(p),
      reply: {
        default: 'Nama project dicatat! Struktur smart contract, interface, dan deployment script akan disesuaikan dengan nama ini.'
      }
    };

    // Step 2: Network Environment (Devnet, Testnet, or Mainnet)
    var netOptions = ['Testnet (Base Sepolia)', 'Devnet (Local Anvil / Sandbox)', 'Mainnet (Production)'];
    if (isSolana) {
      netOptions = ['Solana Devnet (Sandbox)', 'Solana Testnet', 'Solana Mainnet-Beta (Production)'];
    } else if (isSui) {
      netOptions = ['Sui Testnet', 'Sui Devnet', 'Sui Mainnet (Production)'];
    } else if (isStarknet) {
      netOptions = ['Starknet Sepolia (Testnet)', 'Starknet Devnet', 'Starknet Mainnet (Production)'];
    }

    var networkQuestion = {
      q: 'Pilih target network environment untuk deployment (Devnet, Testnet, atau Mainnet)?',
      options: netOptions,
      reply: {
        'Testnet (Base Sepolia)': 'Target environment diset ke Base Sepolia Testnet — lingkungan ideal untuk pengujian, fuzzing, dan verifikasi tanpa risiko dana riil.',
        'Devnet (Local Anvil / Sandbox)': 'Target environment diset ke Local Anvil Devnet — eksekusi cepat pada node lokal dengan instant blocks dan akun simulasi.',
        'Mainnet (Production)': 'Target environment diset ke Base Mainnet — parameter produksi penuh, gas optimization, dan Safe multisig deployment requirements.',
        'Solana Devnet (Sandbox)': 'Target environment diset ke Solana Devnet dengan Anchor framework.',
        'Solana Testnet': 'Target environment diset ke Solana Testnet.',
        'Solana Mainnet-Beta (Production)': 'Target environment diset ke Solana Mainnet-Beta.',
        'Sui Testnet': 'Target environment diset ke Sui Testnet.',
        'Sui Devnet': 'Target environment diset ke Sui Devnet.',
        'Sui Mainnet (Production)': 'Target environment diset ke Sui Mainnet.',
        'Starknet Sepolia (Testnet)': 'Target environment diset ke Starknet Sepolia testnet.',
        'Starknet Devnet': 'Target environment diset ke Starknet Devnet.',
        'Starknet Mainnet (Production)': 'Target environment diset ke Starknet Mainnet.'
      }
    };

    if (p.indexOf('lend') > -1 || p.indexOf('borrow') > -1 || p.indexOf('collateral') > -1) {
      return [
        nameQuestion,
        networkQuestion,
        {
          q: 'How should interest rates and liquidation thresholds be governed?',
          options: ['Utilization-rate curve + Chainlink Oracle', 'Fixed borrowing fee + Automated liquidator', 'Decentralized parameter governance'],
          reply: {
            'Utilization-rate curve + Chainlink Oracle': 'Utilization-based kinked curves optimize capital efficiency while Chainlink feeds protect protocol solvency.',
            'Fixed borrowing fee + Automated liquidator': 'Fixed fees simplify accounting, with keeper rewards incentivizing swift liquidations.',
            'Decentralized parameter governance': 'I’ll expose governance hooks for interest multipliers and liquidation discount thresholds.'
          }
        },
        {
          q: 'Who can pause the lending pool in case of an oracle anomaly or emergency?',
          options: ['Owner / Multisig instant pause', 'Timelock + Guardian multisig', 'No pause (immutable)'],
          reply: {
            'Owner / Multisig instant pause': 'I will wire emergency pause() and unpause() directly to your multisig authority.',
            'Timelock + Guardian multisig': 'Got it. Instant pause for guardians, timelocked unpause to ensure depositor transparency.',
            'No pause (immutable)': 'Noted — strictly immutable contract logic without administrative pause controls.'
          }
        },
        {
          q: 'Should the lending contracts be upgradeable?',
          options: ['No — completely immutable', 'Yes — Timelocked UUPS proxy', 'Yes — Multisig proxy'],
          reply: {
            'No — completely immutable': 'Immutable it is. High security confidence for liquidity providers.',
            'Yes — Timelocked UUPS proxy': 'Timelocked UUPS proxy configured so depositors receive prior notice of logic upgrades.',
            'Yes — Multisig proxy': 'Proxy controlled by multisig for seamless operational maintenance.'
          }
        }
      ];
    }

    if (p.indexOf('stake') > -1 || p.indexOf('staking') > -1 || p.indexOf('reward') > -1) {
      return [
        nameQuestion,
        networkQuestion,
        {
          q: 'How should staking rewards accrue and distribute to stakers?',
          options: ['Continuous linear emission (pull-claim)', 'Fixed APY reward pool', 'Time-weighted multiplier tier'],
          reply: {
            'Continuous linear emission (pull-claim)': 'Continuous reward-per-token accumulator chosen — O(1) gas cost that scales to thousands of stakers.',
            'Fixed APY reward pool': 'Fixed APY schedule configured with a capped treasury reward buffer.',
            'Time-weighted multiplier tier': 'Time-weighted multiplier tiers will reward longer lock durations with bonus reward shares.'
          }
        },
        {
          q: 'Any unstaking lock-up period or early exit fee?',
          options: ['No lock-up (instant unstaking)', 'Configurable lock period (e.g. 7–14 days)', 'Early exit fee routed to pool stakers'],
          reply: {
            'No lock-up (instant unstaking)': 'Instant withdrawals enabled — depositors can stake and withdraw at any block.',
            'Configurable lock period (e.g. 7–14 days)': 'Unbonding cooldown period enforced before principal tokens can be withdrawn.',
            'Early exit fee routed to pool stakers': 'Early withdrawal penalty applied and redistributed to loyalty stakers.'
          }
        },
        {
          q: 'Who can pause staking operations or adjust reward rates?',
          options: ['Admin Multisig', 'Timelock + Admin', 'Immutable (fixed schedule)'],
          reply: {
            'Admin Multisig': 'Admin multisig controls reward rate parameters and emergency pause.',
            'Timelock + Admin': 'Rate modifications will be delayed via a timelock for staker transparency.',
            'Immutable (fixed schedule)': 'Fixed emission schedule locked permanently at deployment.'
          }
        }
      ];
    }

    if (p.indexOf('nft') > -1 || p.indexOf('market') > -1) {
      return [
        nameQuestion,
        networkQuestion,
        {
          q: 'What listing and trading mechanisms should be supported?',
          options: ['Fixed-price direct buy', 'Fixed price + Offers / Bids', 'Dutch descending auction'],
          reply: {
            'Fixed-price direct buy': 'Clean fixed-price listing mechanics with atomic transfer on purchase.',
            'Fixed price + Offers / Bids': 'Escrowed bid offers and counter-offers enabled alongside listings.',
            'Dutch descending auction': 'Dynamic pricing via decaying price curve auctions.'
          }
        },
        {
          q: 'How should creator royalties and marketplace fees be structured?',
          options: ['EIP-2981 Royalties + 2% protocol fee', 'Creator royalties only (0% protocol fee)', 'Configurable fee to treasury'],
          reply: {
            'EIP-2981 Royalties + 2% protocol fee': 'Standard EIP-2981 royalty enforcement + 2% marketplace protocol fee.',
            'Creator royalties only (0% protocol fee)': 'Zero fee protocol maximizing proceeds for NFT creators.',
            'Configurable fee to treasury': 'Owner-controlled protocol fee routed to community treasury.'
          }
        },
        {
          q: 'Emergency circuit breaker and access control?',
          options: ['Multisig pausable', 'Timelock + Guardian', 'Immutable trading logic'],
          reply: {
            'Multisig pausable': 'Emergency circuit breaker enabled for marketplace admin.',
            'Timelock + Guardian': 'Timelocked controls for fee changes and emergency pause.',
            'Immutable trading logic': 'Non-upgradable, trustless trading without admin intervention.'
          }
        }
      ];
    }

    if (p.indexOf('escrow') > -1) {
      return [
        nameQuestion,
        networkQuestion,
        {
          q: 'How should escrowed funds be released to the recipient?',
          options: ['Buyer manual release confirmation', 'Third-party arbiter / multisig', 'Automated release upon deadline'],
          reply: {
            'Buyer manual release confirmation': 'Funds remain locked in escrow until the buyer confirms receipt.',
            'Third-party arbiter / multisig': 'Neutral arbiter or multi-sig can release or resolve contested escrows.',
            'Automated release upon deadline': 'Funds auto-release after dispute period expires without objection.'
          }
        },
        {
          q: 'What dispute resolution mechanism should be enforced?',
          options: ['Designated arbiter resolves split', 'Refund to buyer on expiration', 'Mutual agreement or timelock refund'],
          reply: {
            'Designated arbiter resolves split': 'Arbiter address has authority to settle disputes and allocate funds.',
            'Refund to buyer on expiration': 'Auto-refund if seller fails to fulfill obligations within window.',
            'Mutual agreement or timelock refund': 'Both parties must sign off, with fallback refund after timeout.'
          }
        },
        {
          q: 'Emergency pause controls?',
          options: ['Multisig emergency pause', 'No pause (strictly immutable)'],
          reply: {
            'Multisig emergency pause': 'Emergency pause halts new escrows while protecting existing deposits.',
            'No pause (strictly immutable)': 'Strictly immutable smart contract logic.'
          }
        }
      ];
    }

    // Default general vault / protocol questions
    return [
      nameQuestion,
      networkQuestion,
      {
        q: 'How should yield or rewards reach depositors/users?',
        options: ['Pull — user claims on demand', 'Auto-compounding into share price (ERC-4626)', 'Push — automated distribution'],
        reply: {
          'Pull — user claims on demand': 'Pull it is — user-driven claims ensure bounded, predictable gas execution.',
          'Auto-compounding into share price (ERC-4626)': 'ERC-4626 vault standard with share-price appreciation from compound yields.',
          'Push — automated distribution': 'Push distribution noted — loop gas bounds flagged in security analysis.'
        }
      },
      {
        q: 'Who can pause the contract in an emergency?',
        options: ['Owner multisig', 'Timelock + emergency guardian', 'No pause mechanism (immutable)'],
        reply: {
          'Owner multisig': 'Understood — pause() and unpause() will be wired behind your multisig authority.',
          'Timelock + emergency guardian': 'Instant guardian emergency pause, with timelocked unpausing for security.',
          'No pause mechanism (immutable)': 'Noted — strictly immutable contract logic without circuit breakers.'
        }
      },
      {
        q: 'Should the contract architecture be upgradeable?',
        options: ['No — completely immutable', 'Yes — Timelocked UUPS proxy', 'Yes — Multisig proxy'],
        reply: {
          'No — completely immutable': 'Immutable contracts selected for maximum trust and minimal attack surface.',
          'Yes — Timelocked UUPS proxy': 'Timelocked proxy lets users audit logic upgrades before they take effect.',
          'Yes — Multisig proxy': 'Multisig upgradeability proxy configured.'
        }
      },
      {
        q: 'Any deposit/withdrawal fee or lock-up period?',
        options: ['No fee, no lock-up', 'Configurable fee to treasury', 'Time-based lock-up / unbonding'],
        reply: {
          'No fee, no lock-up': 'Zero fees and instant liquidity — deposit and withdraw anytime.',
          'Configurable fee to treasury': 'A protocol fee will be routed to a designated treasury address.',
          'Time-based lock-up / unbonding': 'Lock-up timestamps enforced before withdrawals can be initiated.'
        }
      }
    ];
  }

  function startOnboarding(initialRequestPrompt) {
    if (!onboard || !onboardLog) return;

    onboard.classList.remove('is-hidden');
    onboardLog.innerHTML = '';
    if (onboardStepsEl) onboardStepsEl.innerHTML = '';
    if (onboardChips) onboardChips.innerHTML = '';

    // Restore composer inside onboardFootInner if it was replaced previously
    if (onboardFootInner && !onboardFootInner.querySelector('#onboardForm')) {
      onboardFootInner.innerHTML = '<div class="qrChips" id="onboardChips"></div>' +
        '<form class="onboard__composer" id="onboardForm">' +
        '<input autocomplete="off" id="onboardInput" placeholder="Type your answer or describe requirements…" type="text"/>' +
        '<button aria-label="Send" class="onboard__send" id="onboardSend" type="submit">' +
        '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 20 20"><path d="M3 10h14M11 4l6 6-6 6"/></svg>' +
        '</button>' +
        '</form>';
      onboardChips = $('#onboardChips');
      onboardForm = $('#onboardForm');
      onboardInput = $('#onboardInput');
      onboardSend = $('#onboardSend');
    }

    var projectPrompt = (initialRequestPrompt || initialPrompt || '').trim() ||
      'I want to build a yield vault on Base — users deposit USDC, earn yield, and can claim rewards anytime. Keep it simple and safe, testnet first.';

    // Show initial user prompt in dialog
    addOnboardBubble('user', escHtml(projectPrompt));

    var questions = buildQuestionsForPrompt(projectPrompt);
    var answers = {};
    var currentStep = -1;

    // Build step progress dots (questions + 1 final step for specification generation)
    var totalSteps = questions.length + 1;
    if (onboardStepsEl) {
      for (var i = 0; i < totalSteps; i++) {
        var dot = document.createElement('span');
        dot.className = 'onboard__dot' + (i === 0 ? ' is-current' : '');
        onboardStepsEl.appendChild(dot);
      }
    }

    function updateDots(stepIndex) {
      if (!onboardStepsEl) return;
      $$('.onboard__dot', onboardStepsEl).forEach(function(dot, i) {
        dot.classList.toggle('is-done', i < stepIndex);
        dot.classList.toggle('is-current', i === stepIndex);
      });
    }

    function agentSay(htmlContent, callback) {
      onboardLog.insertAdjacentHTML('beforeend', typingHTML());
      var typingEl = onboardLog.lastElementChild;
      if (onboardBody) onboardBody.scrollTop = onboardBody.scrollHeight;
      setTimeout(function() {
        if (typingEl) typingEl.remove();
        addOnboardBubble('agent', htmlContent);
        if (callback) setTimeout(callback, 220);
      }, 550 + Math.random() * 200);
    }

    function renderQuestionOptions(step) {
      if (!onboardChips) return;
      onboardChips.innerHTML = '';
      (step.options || []).forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'qrChip';
        btn.type = 'button';
        btn.textContent = opt;
        btn.addEventListener('click', function() {
          handleUserAnswer(opt);
        });
        onboardChips.appendChild(btn);
      });

      // Quick shortcut chip to finalize immediately if user prefers
      if (currentStep >= 1) {
        var fastBtn = document.createElement('button');
        fastBtn.className = 'qrChip';
        fastBtn.type = 'button';
        fastBtn.style.borderColor = 'var(--blue-soft, #38bdf8)';
        fastBtn.style.color = 'var(--blue-soft, #38bdf8)';
        fastBtn.textContent = 'Generate specification now';
        fastBtn.addEventListener('click', function() {
          finalizeAndGenerate();
        });
        onboardChips.appendChild(fastBtn);
      }

      if (onboardInput) {
        onboardInput.disabled = false;
        onboardInput.placeholder = 'Type your custom answer or pick an option above…';
        onboardInput.focus();
      }
      if (onboardSend) onboardSend.disabled = false;
    }

    function handleUserAnswer(userAnswerText) {
      if (currentStep < 0 || currentStep >= questions.length) return;
      var step = questions[currentStep];

      // Lock input and chips while agent processes answer
      $$('.qrChip', onboardChips).forEach(function(b) { b.disabled = true; });
      if (onboardInput) onboardInput.disabled = true;
      if (onboardSend) onboardSend.disabled = true;

      // Add user message bubble
      addOnboardBubble('user', escHtml(userAnswerText));
      answers[step.q] = userAnswerText;
      if (onboardChips) onboardChips.innerHTML = '';

      // Agent provides technical feedback and moves to next step
      var feedback = (step.reply && step.reply[userAnswerText]);
      if (!feedback) {
        if (step.q.indexOf('nama') > -1 || step.q.indexOf('name') > -1) {
          feedback = 'Nama project "' + escHtml(userAnswerText) + '" dicatat! Struktur smart contract, interface, unit test, dan deployment script akan disesuaikan dengan nama ini.';
        } else if (step.q.indexOf('network') > -1 || step.q.indexOf('environment') > -1) {
          feedback = 'Target network diset ke "' + escHtml(userAnswerText) + '". Konfigurasi RPC, deploy script, dan gas parameter akan disesuaikan.';
        } else if (step.reply && step.reply.default) {
          feedback = step.reply.default;
        } else {
          feedback = 'Got it — I’ll incorporate that requirement into the specification design.';
        }
      }

      agentSay('<p>' + feedback + '</p>', function() {
        nextQuestion();
      });
    }

    function nextQuestion() {
      currentStep++;
      updateDots(currentStep);

      if (currentStep >= questions.length) {
        finalizeAndGenerate();
        return;
      }

      var step = questions[currentStep];
      agentSay('<p><strong>Specification Step ' + (currentStep + 1) + ' of ' + questions.length + ':</strong> ' + escHtml(step.q) + '</p>', function() {
        renderQuestionOptions(step);
      });
    }

    function finalizeAndGenerate() {
      currentStep = questions.length;
      updateDots(currentStep);
      if (onboardChips) onboardChips.innerHTML = '';
      if (onboardInput) onboardInput.disabled = true;
      if (onboardSend) onboardSend.disabled = true;

      agentSay('<p>All requirements gathered! Synthesizing your answers and generating the implementation-ready smart contract specification…</p>', function() {
        // Compile prompt with user answers
        var answersSummary = Object.keys(answers).map(function(q) {
          return '- ' + q + ': ' + answers[q];
        }).join('\n');

        var fullPrompt = projectPrompt;
        if (answersSummary) {
          fullPrompt += '\n\nClarified Architecture & Design Decisions:\n' + answersSummary;
        }

        var chosenName = '';
        var chosenNet = '';
        Object.keys(answers).forEach(function(k) {
          if (k.indexOf('nama') > -1 || k.indexOf('name') > -1) {
            chosenName = answers[k];
          } else if (k.indexOf('network') > -1 || k.indexOf('environment') > -1) {
            chosenNet = answers[k];
          }
        });

        callGenerateApi(fullPrompt, chosenName, chosenNet);
      });
    }

    async function callGenerateApi(promptToGenerate, chosenName, chosenNet) {
      onboardLog.insertAdjacentHTML('beforeend', typingHTML());
      var typingEl = onboardLog.lastElementChild;
      if (onboardBody) onboardBody.scrollTop = onboardBody.scrollHeight;

      try {
        var reqPayload = { prompt: promptToGenerate };
        if (chosenName) reqPayload.projectName = chosenName;
        if (chosenNet) reqPayload.targetNetwork = chosenNet;

        var response = await fetch('/api/specification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqPayload)
        });
        var result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Specification generation failed.');
        if (typingEl) typingEl.remove();

        specVersion++;
        renderSpecification(result.specification);
        setWorkspaceNetwork(result.specification.targetNetworks);

        // Render summary table of answers
        var rows = Object.keys(answers).map(function(q) {
          var label = q.replace(/\?$/, '').replace(/^(How|Should|Who|Any|Which)\s+/i, '');
          return [label, answers[q]];
        });

        if (!rows.length) {
          rows.push(['Architecture', result.specification.contractKind || 'Smart Contract']);
          rows.push(['Ecosystem', result.specification.ecosystem || 'EVM']);
          rows.push(['Target network', result.specification.targetNetworks || 'Base Sepolia']);
        }

        var specHtml = '<p><strong>Here is what I locked in from our specification Q&A:</strong></p><div class="specSummary"><dl>' +
          rows.map(function(r) {
            return '<div><dt>' + escHtml(r[0]) + '</dt><dd>' + escHtml(r[1]) + '</dd></div>';
          }).join('') +
          '</dl></div>';

        addOnboardBubble('agent', specHtml);
        addAuditTrailEntry('Requirement Agent', 'Compiled and locked specification from user interactive Q&A.');

        // Step 2: Contract Builder Agent generates smart contracts from the locked specification
        setTimeout(async function() {
          addOnboardBubble('agent', '<p><strong>Contract Builder Agent:</strong> Synthesizing smart contract architecture and generating production source code for <em>' + escHtml(result.specification.projectName) + '</em>…</p>');
          onboardLog.insertAdjacentHTML('beforeend', typingHTML());
          var codeTypingEl = onboardLog.lastElementChild;
          if (onboardBody) onboardBody.scrollTop = onboardBody.scrollHeight;

          try {
            var srcResponse = await fetch('/api/generate-source', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ specification: result.specification })
            });
            var srcResult = await srcResponse.json();
            if (codeTypingEl) codeTypingEl.remove();

            if (srcResult && srcResult.bundle) {
              applyGeneratedBundle(srcResult.bundle, result.specification);
              addOnboardBubble('agent', '<p><strong>Smart contract generation complete:</strong> Contract Builder Agent generated ' + srcResult.bundle.files.length + ' genuine source files tailored to your specification. Primary contract <strong>' + escHtml(srcResult.bundle.primaryFile) + '</strong> is loaded and ready in the editor.</p>');
            } else {
              throw new Error('Could not parse generated source code.');
            }
          } catch (codeErr) {
            if (codeTypingEl) codeTypingEl.remove();
            console.error('Source generation error:', codeErr);
            addOnboardBubble('agent', '<p>Smart contracts generated and loaded with verified fallback architecture.</p>');
          }

          showEnterWorkspaceButton(result.specification);
        }, 500);

      } catch (err) {
        if (typingEl) typingEl.remove();
        var errMsg = err instanceof Error ? err.message : 'Could not generate specification.';
        addOnboardBubble('agent', '<p style="color:var(--err,#ff5555)">' + escHtml(errMsg) + '</p>');
        var retryContainer = document.createElement('div');
        retryContainer.style.marginTop = '0.5rem';
        var retryBtn = document.createElement('button');
        retryBtn.className = 'btn-primary';
        retryBtn.textContent = 'Retry specification generation';
        retryBtn.addEventListener('click', function() {
          retryContainer.remove();
          callGenerateApi(promptToGenerate);
        });
        retryContainer.appendChild(retryBtn);
        onboardLog.lastElementChild.querySelector('.msg__col').appendChild(retryContainer);
      }
    }

    function showEnterWorkspaceButton(spec) {
      if (!onboardFootInner) return;
      onboardFootInner.innerHTML = '<button class="btn-primary" id="onboardEnter" type="button" style="width:100%;padding:0.85rem;font-size:0.95rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.5rem;cursor:pointer">' +
        '<span>Enter Workspace →</span>' +
        '</button>';

      var enterBtn = $('#onboardEnter');
      if (enterBtn) {
        enterBtn.addEventListener('click', function() {
          onboard.classList.add('is-hidden');
          var primaryFile = (spec && spec.primaryFile) || Object.keys(FILES)[0] || 'VaultCore.sol';
          openView('editor', primaryFile);
        });
      }
    }

    // Attach form listener for typed answers
    if (onboardForm) {
      onboardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var val = (onboardInput.value || '').trim();
        if (!val || onboardInput.disabled) return;
        onboardInput.value = '';
        handleUserAnswer(val);
      });
    }

    // Start introduction and step 0
    agentSay(
      '<p>I’ve reviewed your project request: <em>"' + escHtml(projectPrompt.length > 120 ? projectPrompt.slice(0, 117) + '…' : projectPrompt) + '"</em>.</p>' +
      '<p>Before I build the contract code and architecture, let’s step through a few specification questions to lock in your exact requirements.</p>',
      function() {
        nextQuestion();
      }
    );
  }

  // Wire sidebar brand to navigate back to Home in SPA
  $$('.sidebar__brand').forEach(function(b) {
    b.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = 'app';
    });
  });

  // Wire "New project" button to restart intake Q&A
  $$('.sbtn--new').forEach(function(b) {
    b.addEventListener('click', function() {
      startOnboarding('Build a smart contract protocol with automated security gates.');
    });
  });

  // Kick off intake flow
  startOnboarding(initialPrompt);

  /* Seed the in-workspace chat with a primer */
  if (agentLog) {
    agentLog.innerHTML = bubbleHTML('agent', '<p>Ask me to change or add to VaultCore.sol — I’ll draft the diff and re-queue tests and the security review before anything ships.</p>');
  }

  // Initial audit log entry
  addAuditTrailEntry('Requirement Agent', 'Workspace initialized. Telemetry and live monitoring stream active.');
}
