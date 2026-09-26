// Compatibility layer for the original x0a workspace interactions.
// The UI is mounted by React; this module wires the original interactions into that DOM.
// @ts-nocheck

interface WorkspaceInitOptions {
  initialPrompt?: string;
}

export function initWorkspace(
  root: HTMLElement,
  options: WorkspaceInitOptions = {},
) {
  var initialPrompt = (options.initialPrompt || '').trim();
  var $ = function(s,ctx){ return (ctx||root).querySelector(s); };
  var $$ = function(s,ctx){ return Array.prototype.slice.call((ctx||root).querySelectorAll(s)); };


  var $ = function(s,ctx){ return (ctx||root).querySelector(s); };
  var $$ = function(s,ctx){ return Array.prototype.slice.call((ctx||root).querySelectorAll(s)); };

  /* ---------------- Nav sidebar (identical mechanics to Home) ---------------- */
  var shell = $('#shell');
  var menuToggle = $('#menuToggle');
  var scrim = $('#scrim');
  var closeSidebarBtn = $('#closeSidebarBtn');
  var sidebar = $('#sidebar');

  function syncLock(){
    root.classList.toggle('is-locked', shell.classList.contains('is-open') || explorer.classList.contains('is-open') || ops.classList.contains('is-open'));
  }
  function setOpen(v){
    if (!v && sidebar.contains(document.activeElement)) menuToggle.focus();
    shell.classList.toggle('is-open', v);
    menuToggle.setAttribute('aria-expanded', String(v));
    closeAllPops();
    syncLock();
  }
  menuToggle.addEventListener('click', function(){
    var willOpen = !shell.classList.contains('is-open');
    setOpen(willOpen);
    if (willOpen) setTimeout(function(){ closeSidebarBtn.focus(); }, 60);
  });
  scrim.addEventListener('click', function(){ setOpen(false); });
  closeSidebarBtn.addEventListener('click', function(){ setOpen(false); });

  /* ---------------- Popovers (account + notifications) ---------------- */
  var pops = [
    { btn: $('#avatarBtn'), pop: $('#avatarPop') },
    { btn: $('#notifBtn'), pop: $('#notifPop') }
  ];
  function closeAllPops(){
    pops.forEach(function(p){ p.pop.classList.remove('is-open'); p.btn.setAttribute('aria-expanded','false'); });
  }
  pops.forEach(function(p){
    p.btn.addEventListener('click', function(e){
      e.stopPropagation();
      var willOpen = !p.pop.classList.contains('is-open');
      closeAllPops();
      p.pop.classList.toggle('is-open', willOpen);
      p.btn.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', function(e){
    if (!pops.some(function(p){ return p.pop.contains(e.target) || p.btn.contains(e.target); })) closeAllPops();
  });

  /* ---------------- Notification badge (same pill style/behavior as Home) ---------------- */
  var notifBadge = $('#notifBadge'), notifBtn = $('#notifBtn');
  var notifCount = $$('#notifPop .nitem').length;
  notifBadge.textContent = notifCount > 9 ? '9+' : String(notifCount);
  notifBadge.classList.toggle('is-visible', notifCount > 0);
  notifBtn.setAttribute('aria-label', notifCount ? 'Notifications, ' + notifCount + ' unread' : 'Notifications');

  /* ---------------- Explorer / Ops drawers (mobile) ---------------- */
  var explorer = $('#explorer'), ops = $('#ops');
  var explorerToggle = $('#explorerToggle'), explorerClose = $('#explorerClose');
  var opsToggle = $('#opsToggle'), opsClose = $('#opsClose');
  var wsScrim = $('#wsScrim');

  function setDrawer(which, v){
    explorer.classList.toggle('is-open', which === 'explorer' ? v : false);
    ops.classList.toggle('is-open', which === 'ops' ? v : false);
    wsScrim.classList.toggle('is-open', v);
    syncLock();
  }
  explorerToggle.addEventListener('click', function(){ setDrawer('explorer', !explorer.classList.contains('is-open')); });
  explorerClose.addEventListener('click', function(){ setDrawer('explorer', false); });
  opsToggle.addEventListener('click', function(){ setDrawer('ops', !ops.classList.contains('is-open')); });
  opsClose.addEventListener('click', function(){ setDrawer('ops', false); });
  wsScrim.addEventListener('click', function(){ setDrawer(null, false); });
  $('.envChip').addEventListener('click', function(){ setDrawer('ops', true); });

  /* ---------------- Focus mode ---------------- */
  $('#focusToggle').addEventListener('click', function(){
    var on = !this.classList.contains('is-active');
    this.classList.toggle('is-active', on);
    explorer.style.display = on ? 'none' : '';
    ops.style.display = on ? 'none' : '';
  });

  /* ---------------- Explorer tree: collapsible groups + folder ---------------- */
  $$('.egroup__head').forEach(function(btn){
    btn.addEventListener('click', function(){
      var grp = btn.closest('.egroup');
      var collapsed = grp.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  });
  $$('.enode--folder').forEach(function(btn){
    btn.addEventListener('click', function(){ btn.classList.toggle('is-open'); });
  });

  /* ---------------- Environment selector (Details pane) ---------------- */
  $$('#envRow button').forEach(function(btn){
    btn.addEventListener('click', function(){
      $$('#envRow button').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      $('.envChip span').textContent = btn.textContent;
    });
  });

  /* ---------------- Code syntax highlighting ---------------- */
  var LANG = {
    solidity: {
      kw: ['pragma','solidity','import','from','as','contract','interface','library','is','using','for','function','external','public','internal','private','view','pure','payable','returns','return','if','else','revert','require','emit','event','error','modifier','constructor','memory','storage','calldata','immutable','constant','override','virtual','mapping','struct','enum','new','msg','block'],
      types: ['IERC20','SafeERC20','ReentrancyGuard','AccessControl','ShareToken','IVault','ERC20','RewardsDistributor','Script','VaultCore','Deploy','uint256','uint8','address','bool','bytes32','string']
    },
    toml: { kw: ['true','false'], types: [] }
  };
  function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function tokenizeLine(line, lang){
    var rules = LANG[lang] || LANG.solidity;
    var re = /(\/\/[^\n]*)|(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)|(\[[A-Za-z0-9_.]+\])|([^\sA-Za-z0-9_$]+)|(\s+)/g;
    return line.replace(re, function(m, com, hcom, str, num, word, bracket){
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
  function renderCode(container){
    var lang = container.getAttribute('data-lang') || 'solidity';
    var fileWrap = container.closest('.codefile');
    var file = fileWrap.getAttribute('data-file');
    var srcEl = document.getElementById('src-' + file);
    if (!srcEl) return;
    var raw = srcEl.textContent.replace(/^\n/, '').replace(/\n+$/, '');
    var lines = raw.split('\n');
    var html = lines.map(function(line, i){
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

  /* ---------------- Editable source ----------------
     Read-only view (.codeBody, syntax highlighted) and edit view
     (.codeEditWrap: line-number gutter + a highlighted <pre> with a
     transparent, fully-overlapping <textarea> on top of it) live side
     by side inside each .codefile; only one is shown at a time via
     the .is-editing class. The textarea is what's actually typed
     into (it owns the caret/selection/undo stack) — its text is
     invisible, and on every keystroke the same tokenizeLine() used
     for the read-only view re-renders the coloured <pre> underneath,
     so what you're editing still reads as highlighted code instead
     of flat text. Saving writes the textarea's value back into the
     hidden <script type="text/plain" id="src-*"> tag that renderCode()
     reads from, then re-renders the read-only highlighted view — so
     the rest of the app (status bar, tab line-counts, etc.) keeps
     working unchanged. Nothing is sent anywhere; it only lives in
     this page until it's reloaded. */
  function getSource(file){
    var srcEl = document.getElementById('src-' + file);
    return srcEl ? srcEl.textContent.replace(/^\n/, '').replace(/\n+$/, '') : '';
  }
  function setSource(file, text){
    var srcEl = document.getElementById('src-' + file);
    if (srcEl) srcEl.textContent = text;
  }
  function highlightHTML(text, lang){
    return text.split('\n').map(function(line){ return line.length ? tokenizeLine(line, lang) : ''; }).join('\n');
  }
  function syncGutter(gutter, textarea){
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
  function markDirty(codefileEl, dirty){
    codefileEl.classList.toggle('is-dirty', dirty);
    var saveBtn = codefileEl.querySelector('.codeSaveBtn');
    var unsaved = codefileEl.querySelector('.codeUnsaved');
    if (saveBtn) saveBtn.disabled = !dirty;
    if (unsaved) unsaved.hidden = !dirty;
  }
  function buildEditUI(codefileEl){
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

    function refreshHighlight(){ pre.innerHTML = highlightHTML(textarea.value, lang); }
    editWrap._refreshHighlight = refreshHighlight;

    textarea.addEventListener('input', function(){
      syncGutter(gutter, textarea);
      refreshHighlight();
      markDirty(codefileEl, textarea.value !== getSource(file));
    });
    textarea.addEventListener('scroll', function(){ pre.scrollLeft = textarea.scrollLeft; });
    textarea.addEventListener('keydown', function(e){
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
  function enterEditMode(codefileEl){
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
    $('.codeEditBtn', codefileEl).hidden = true;
    $('.codeSaveActions', codefileEl).hidden = false;
    requestAnimationFrame(function(){ textarea.focus(); });
  }
  function exitEditMode(codefileEl){
    codefileEl.classList.remove('is-editing');
    $('.codeEditBtn', codefileEl).hidden = false;
    $('.codeSaveActions', codefileEl).hidden = true;
  }
  function saveEdit(codefileEl){
    var file = codefileEl.getAttribute('data-file');
    var textarea = codefileEl.querySelector('.codeTextarea');
    setSource(file, textarea.value);
    renderCode(codefileEl.querySelector('.codeBody'));
    exitEditMode(codefileEl);
    if (activeKey === 'file:' + file) $('#statusLines').textContent = (fileLines[file] || 0) + ' lines';
    var editBtn = codefileEl.querySelector('.codeEditBtn');
    var label = editBtn.querySelector('span');
    var original = label.textContent;
    label.textContent = 'Saved';
    editBtn.classList.add('is-saved');
    setTimeout(function(){ label.textContent = original; editBtn.classList.remove('is-saved'); }, 1400);
  }
  function cancelEdit(codefileEl){ exitEditMode(codefileEl); }

  document.addEventListener('click', function(e){
    var editBtn = e.target.closest('.codeEditBtn');
    if (editBtn) { enterEditMode(editBtn.closest('.codefile')); return; }
    var saveBtn = e.target.closest('.codeSaveBtn');
    if (saveBtn && !saveBtn.disabled) { saveEdit(saveBtn.closest('.codefile')); return; }
    var cancelBtn = e.target.closest('.codeCancelBtn');
    if (cancelBtn) { cancelEdit(cancelBtn.closest('.codefile')); return; }
  });

  /* ---------------- View / open-tabs state ---------------- */
  var FILES = {
    'VaultCore.sol':            { path: ['yield-vault','contracts','VaultCore.sol'] },
    'ShareToken.sol':           { path: ['yield-vault','contracts','ShareToken.sol'] },
    'RewardsDistributor.sol':   { path: ['yield-vault','contracts','RewardsDistributor.sol'] },
    'interfaces/IVault.sol':    { path: ['yield-vault','contracts','interfaces','IVault.sol'], label: 'IVault.sol' },
    'script/Deploy.s.sol':      { path: ['yield-vault','contracts','script','Deploy.s.sol'], label: 'Deploy.s.sol' },
    'foundry.toml':             { path: ['yield-vault','foundry.toml'] }
  };
  var VIEWS = {
    'specification':  { tab: 'Specification.md', path: ['yield-vault','specification.md'], section:'workspace' },
    'threat-model':   { tab: 'Threat Model.md',  path: ['yield-vault','threat-model.md'], section:'workspace' },
    'architecture':   { tab: 'Architecture.md',  path: ['yield-vault','architecture.md'], section:'workspace' },
    'adrs':           { tab: 'ADRs',             path: ['yield-vault','adr'], section:'workspace' },
    'dependencies':   { tab: 'Dependencies',     path: ['yield-vault','dependencies'], section:'workspace' },
    'builds':         { tab: 'Builds',           path: ['yield-vault','builds'], section:'workspace' },
    'tests':          { tab: 'Tests',            path: ['yield-vault','tests'], section:'workspace' },
    'security':       { tab: 'Findings',         path: ['yield-vault','security','findings'], section:'security' },
    'patches':        { tab: 'Patches',          path: ['yield-vault','security','patches'], section:'security' },
    'simulations':    { tab: 'Simulations',      path: ['yield-vault','simulations'], section:'simulation' },
    'artifacts':      { tab: 'Artifacts',        path: ['yield-vault','artifacts'], section:'workspace' },
    'deployments':    { tab: 'Deployments',      path: ['yield-vault','deployments'], section:'deployment' },
    'verification':   { tab: 'Verification',     path: ['yield-vault','verification'], section:'deployment' },
    'incidents':      { tab: 'Incidents',        path: ['yield-vault','incidents'], section:'monitoring' },
    'monitoring':     { tab: 'Monitoring',       path: ['yield-vault','monitoring'], section:'monitoring' },
    'audit':          { tab: 'Audit Trail',      path: ['yield-vault','audit-trail'], section:'workspace' }
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

  function tabMeta(t){
    if (t.view === 'editor') {
      var f = FILES[t.file];
      return { label: f.label || t.file.split('/').pop(), path: f.path };
    }
    var v = VIEWS[t.view];
    return { label: v.tab, path: v.path };
  }

  function closeTab(key, e){
    if (e) e.stopPropagation();
    var i = openTabs.findIndex(function(t){ return t.key === key; });
    if (i === -1) return;
    openTabs.splice(i, 1);
    if (activeKey === key) {
      var next = openTabs[i] || openTabs[i - 1];
      if (next) { activateTab(next.key); }
      else { openView('editor', 'VaultCore.sol'); return; }
    }
    renderTabs();
  }

  function renderTabs(){
    wsTabsList.innerHTML = '';
    openTabs.forEach(function(t){
      var meta = tabMeta(t);
      var btn = document.createElement('button');
      btn.className = 'wtab' + (t.key === activeKey ? ' is-active' : '');
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', String(t.key === activeKey));
      btn.innerHTML = '<span class="wtab__label"></span><span class="wtab__x" aria-label="Close tab">×</span>';
      btn.querySelector('.wtab__label').textContent = meta.label;
      btn.addEventListener('click', function(){ activateTab(t.key); });
      btn.querySelector('.wtab__x').addEventListener('click', function(e){ closeTab(t.key, e); });
      wsTabsList.appendChild(btn);
      if (t.key === activeKey) { requestAnimationFrame(function(){ btn.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }); }
    });
  }

  function renderPath(pathArr){
    wsPath.innerHTML = '';
    pathArr.forEach(function(seg, i){
      if (i > 0) { var em = document.createElement('em'); em.textContent = '/'; wsPath.appendChild(em); }
      var el = document.createElement(i === 0 ? 'b' : 'span');
      el.textContent = seg;
      wsPath.appendChild(el);
    });
  }

  function activateTab(key){
    var t = openTabs.find(function(x){ return x.key === key; });
    if (!t) return;
    activeKey = key;
    applyView(t.view, t.file);
  }

  function openView(view, file){
    var key = view === 'editor' ? 'file:' + file : view;
    if (!openTabs.some(function(t){ return t.key === key; })) {
      openTabs.push({ key: key, view: view, file: file });
    }
    activeKey = key;
    applyView(view, file);
  }

  function applyView(view, file){
    // Panels
    $$('.view').forEach(function(v){ v.hidden = (v.id !== 'view-' + view); });
    if (view === 'editor') {
      $$('.codefile').forEach(function(cf){ cf.classList.toggle('is-active', cf.getAttribute('data-file') === file); });
    }

    // Explorer active states
    $$('.enode').forEach(function(n){ n.classList.toggle('is-active', n.getAttribute('data-view') === view && view !== 'editor'); });
    $$('.efile').forEach(function(n){ n.classList.toggle('is-active', view === 'editor' && n.getAttribute('data-file') === file); });

    // Path + tabs + switcher
    var meta = view === 'editor' ? { path: FILES[file].path } : { path: VIEWS[view].path };
    renderPath(meta.path);
    renderTabs();

    var section = view === 'editor' ? 'workspace' : (VIEWS[view].section || 'workspace');
    $$('#wsSwitch button').forEach(function(b){ b.setAttribute('aria-selected', String(b.getAttribute('data-section') === section)); });

    // Status bar
    if (view === 'editor') {
      var isToml = file === 'foundry.toml';
      $('#statusLang').textContent = isToml ? 'TOML' : 'Solidity';
      var n = fileLines[file] || '—';
      $('#statusLines').textContent = n + ' lines';
    } else {
      $('#statusLang').textContent = 'x0a Workspace';
      $('#statusLines').textContent = VIEWS[view].tab;
    }

    centerScroll.scrollTop = 0;
    // Auto-close mobile drawers after a selection
    if (window.innerWidth < 860) setDrawer('explorer', false);
  }

  etree.addEventListener('click', function(e){
    var enode = e.target.closest('.enode:not(.enode--folder)');
    if (enode) { openView(enode.getAttribute('data-view')); return; }
    var efile = e.target.closest('.efile');
    if (efile) { openView('editor', efile.getAttribute('data-file')); return; }
  });

  wsSwitch.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-section]');
    if (!btn) return;
    var section = btn.getAttribute('data-section');
    var map = { workspace: ['editor','VaultCore.sol'], security: ['security'], simulation: ['simulations'], deployment: ['deployments'], monitoring: ['monitoring'] };
    var target = map[section];
    openView(target[0], target[1]);
  });

  $('#wsBack').addEventListener('click', function(){ openView('editor', 'VaultCore.sol'); });

  renderTabs();
  applyView('editor', 'VaultCore.sol');

  /* ---------------- Escape closes the topmost open overlay ---------------- */
  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    var openPop = $('.pop.is-open');
    if (openPop) { closeAllPops(); return; }
    if (ops.classList.contains('is-open')) { setDrawer('ops', false); return; }
    if (explorer.classList.contains('is-open') && window.innerWidth < 860) { setDrawer('explorer', false); return; }
    if (shell.classList.contains('is-open')) { setOpen(false); return; }
  });



  var $ = function(s,ctx){ return (ctx||root).querySelector(s); };
  var $$ = function(s,ctx){ return Array.prototype.slice.call((ctx||root).querySelectorAll(s)); };

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function bubbleHTML(role, innerHTML){
    return '<div class="msg msg--' + role + '">' +
      '<i class="msg__avatar">' + (role === 'agent' ? 'x0' : 'AR') + '</i>' +
      '<div class="msg__col"><div class="msg__bubble">' + innerHTML + '</div></div></div>';
  }
  function typingHTML(){
    return bubbleHTML('agent', '<span class="typing"><span></span><span></span><span></span></span>');
  }

  /* ---------------- Ops panel: Details / Chat tabs ---------------- */
  var opsScroll = $('#opsScroll');
  var opsPanelDetails = $('#opsPanelDetails');
  var opsPanelChat = $('#opsPanelChat');
  var opsTabBtns = $$('#opsTabs .opsTab');

  function selectOpsTab(tab){
    opsTabBtns.forEach(function(b){ b.setAttribute('aria-selected', String(b.getAttribute('data-ops-tab') === tab)); });
    opsPanelDetails.hidden = tab !== 'details';
    opsPanelChat.hidden = tab !== 'chat';
    opsScroll.classList.toggle('is-chat', tab === 'chat');
    if (tab === 'chat') { var log = $('#agentLog'); if (log) log.scrollTop = log.scrollHeight; }
  }
  opsTabBtns.forEach(function(b){
    b.addEventListener('click', function(){ selectOpsTab(b.getAttribute('data-ops-tab')); });
  });

  var agentAskBtn = $('#agentAskBtn');
  if (agentAskBtn) {
    agentAskBtn.addEventListener('click', function(){
      selectOpsTab('chat');
      // Below the breakpoint the ops panel is a drawer — open it.
      // At desktop widths it's already a static pane, so just switch tabs.
      if (window.innerWidth < 1180) {
        var ops = $('#ops'), explorer = $('#explorer'), wsScrim = $('#wsScrim');
        if (explorer) explorer.classList.remove('is-open');
        if (ops) ops.classList.add('is-open');
        if (wsScrim) wsScrim.classList.add('is-open');
        root.classList.add('is-locked');
      }
    });
  }

  /* ---------------- In-workspace agent chat ---------------- */
  var agentLog = $('#agentLog');
  var agentForm = $('#agentForm');
  var agentInput = $('#agentInput');
  var agentSuggestions = $('#agentSuggestions');

  var FEE_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>withdraw()</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine">  function withdraw(uint256 shares) external {</div>' +
    '<div class="diffLine">    uint256 amount = _convertToAssets(shares);</div>' +
    '<div class="diffLine diff-add">+   uint256 fee = (amount * withdrawalFeeBps) / 10_000;</div>' +
    '<div class="diffLine diff-add">+   amount -= fee;</div>' +
    '<div class="diffLine diff-add">+   asset.safeTransfer(treasury, fee);</div>' +
    '<div class="diffLine">    asset.safeTransfer(msg.sender, amount);</div>' +
    '<div class="diffLine">    _burn(msg.sender, shares);</div>' +
    '<div class="diffLine">  }</div>' +
    '</div></div>';

  var PAUSE_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>contract header</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine diff-rem">- contract VaultCore is ERC4626 {</div>' +
    '<div class="diffLine diff-add">+ contract VaultCore is ERC4626, Pausable {</div>' +
    '<div class="diffLine">    function withdraw(uint256 shares) external</div>' +
    '<div class="diffLine diff-add">+   whenNotPaused</div>' +
    '<div class="diffLine">  { ... }</div>' +
    '<div class="diffLine diff-add">+ function pause() external onlyOwner { _pause(); }</div>' +
    '<div class="diffLine diff-add">+ function unpause() external onlyOwner { _unpause(); }</div>' +
    '</div></div>';

  var ACCESS_DIFF = '<div class="msg__diff"><div class="patch__head"><b>VaultCore.sol</b><span>access control</span></div>' +
    '<div class="diffBlock">' +
    '<div class="diffLine diff-rem">- contract VaultCore is ERC4626, Ownable {</div>' +
    '<div class="diffLine diff-add">+ contract VaultCore is ERC4626, AccessControl {</div>' +
    '<div class="diffLine diff-add">+ bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");</div>' +
    '<div class="diffLine diff-rem">-   function setCap(uint256 cap) external onlyOwner</div>' +
    '<div class="diffLine diff-add">+   function setCap(uint256 cap) external onlyRole(OPERATOR_ROLE)</div>' +
    '</div></div>';

  function agentReplyFor(text){
    var t = text.toLowerCase();
    if (t.indexOf('fee') > -1) {
      return {
        note: 'I can add that. This touches withdraw() and the accounting invariants, so I\u2019ll re-run the security suite once it\u2019s in.',
        diff: FEE_DIFF,
        followup: 'Queued for the Tester &amp; Security Agent. I\u2019ll surface this in Security once the re-review clears \u2014 nothing ships until you approve the wallet signature.'
      };
    }
    if (t.indexOf('pause') > -1) {
      return {
        note: 'This adds an emergency stop that only the owner multisig can trigger.',
        diff: PAUSE_DIFF,
        followup: 'Re-running the security suite now \u2014 I\u2019ll flag it if the new pause path changes any existing findings.'
      };
    }
    if (t.indexOf('access') > -1 || t.indexOf('role') > -1) {
      return {
        note: 'This replaces the single-owner pattern with role-based access, so you can delegate operational actions without handing over full control.',
        diff: ACCESS_DIFF,
        followup: 'I\u2019ll re-check every place the old onlyOwner checks were load-bearing before this ships.'
      };
    }
    if (t.indexOf('explain') > -1 || t.indexOf('claimrewards') > -1) {
      return {
        note: 'claimRewards() tracks a running reward-per-share index. On claim, it pays out the index delta since your last claim, times your share balance \u2014 no loops, so gas doesn\u2019t grow with depositor count. That\u2019s the pull-based model from ADR-003.',
        diff: null,
        followup: null
      };
    }
    return {
      note: 'Got it \u2014 I\u2019ll fold that into the next revision. Want me to draft it now, or wait until you\u2019ve listed everything you\u2019d like changed?',
      diff: null,
      followup: null
    };
  }

  function sendAgentMessage(raw){
    var text = (raw || '').trim();
    if (!text) return;
    agentLog.insertAdjacentHTML('beforeend', bubbleHTML('user', escapeHtml(text)));
    agentInput.value = '';
    agentLog.scrollTop = agentLog.scrollHeight;

    agentLog.insertAdjacentHTML('beforeend', typingHTML());
    var typingEl = agentLog.lastElementChild;
    agentLog.scrollTop = agentLog.scrollHeight;

    setTimeout(function(){
      typingEl.remove();
      var r = agentReplyFor(text);
      var html = '<p>' + r.note + '</p>' + (r.diff || '');
      agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', html));
      agentLog.scrollTop = agentLog.scrollHeight;
      if (r.followup) {
        setTimeout(function(){
          agentLog.insertAdjacentHTML('beforeend', bubbleHTML('agent', '<p>' + r.followup + '</p>'));
          agentLog.scrollTop = agentLog.scrollHeight;
        }, 550);
      }
    }, 850);
  }

  if (agentForm) {
    agentForm.addEventListener('submit', function(e){
      e.preventDefault();
      sendAgentMessage(agentInput.value);
    });
  }
  if (agentInput) {
    agentInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAgentMessage(agentInput.value);
      }
    });
  }
  if (agentSuggestions) {
    agentSuggestions.addEventListener('click', function(e){
      var btn = e.target.closest('.qrChip');
      if (!btn) return;
      sendAgentMessage(btn.getAttribute('data-prompt'));
    });
  }

  /* ---------------- Pre-workspace intake (Requirement Agent) ---------------- */
  var onboard = $('#onboard');
  var onboardLog = $('#onboardLog');
  var onboardBody = $('.onboard__body');
  var onboardChips = $('#onboardChips');
  var onboardForm = $('#onboardForm');
  var onboardInput = $('#onboardInput');
  var onboardSend = $('#onboardSend');
  var onboardStepsEl = $('#onboardSteps');
  var onboardFootInner = $('#onboardFootInner');

  var QUESTIONS = [
    {
      q: 'How should rewards reach depositors?',
      options: ['Pull \u2014 user claims', 'Push \u2014 auto-distributed', 'Not sure, you decide'],
      reply: {
        'Pull \u2014 user claims': 'Pull it is. Depositors call claim() themselves, so gas stays bounded no matter how many depositors join \u2014 I\u2019ll write that into ADR-003.',
        'Push \u2014 auto-distributed': 'Noted \u2014 push distribution loops over every depositor on-chain, which gets expensive as the vault grows. I\u2019ll flag this as a cost tradeoff in the threat model.',
        'Not sure, you decide': 'I\u2019ll default to pull-based \u2014 it scales better and is the safer default for a vault holding real funds.'
      }
    },
    {
      q: 'Should the vault contract be upgradeable?',
      options: ['No \u2014 immutable', 'Yes, timelocked', 'Yes, plain proxy'],
      reply: {
        'No \u2014 immutable': 'Immutable it is. Usually the safer default for a vault holding user funds \u2014 a bug means a new deployment and migration, not a silent logic swap.',
        'Yes, timelocked': 'Got it \u2014 I\u2019ll put a timelock in front of any upgrade path, so depositors get advance notice before logic changes.',
        'Yes, plain proxy': 'Noted. I\u2019ll flag the upgrade key as a standing trust assumption in the threat model \u2014 whoever holds it can change the vault\u2019s logic.'
      }
    },
    {
      q: 'Who can pause the vault in an emergency?',
      options: ['Owner multisig', 'Timelock + multisig', 'No pause mechanism'],
      reply: {
        'Owner multisig': 'Understood \u2014 I\u2019ll wire pause() and unpause() behind your multisig.',
        'Timelock + multisig': 'Got it. Pausing is usually urgent, so I\u2019d keep the pause itself instant and only timelock the unpause.',
        'No pause mechanism': 'Noted \u2014 no circuit breaker. I\u2019ll make sure the security review weighs this explicitly before the policy gate.'
      }
    },
    {
      q: 'Any withdrawal fee or lock-up period?',
      options: ['No fee, no lock-up', 'Add a withdrawal fee', 'Add a lock-up period'],
      reply: {
        'No fee, no lock-up': 'Simple withdrawals it is \u2014 deposit and leave whenever you like.',
        'Add a withdrawal fee': 'I\u2019ll add an immutable fee routed to a treasury address, applied on withdraw().',
        'Add a lock-up period': 'I\u2019ll add a per-deposit timestamp and block withdrawals until it matures.'
      }
    },
    {
      q: 'Which network should I target first?',
      options: ['Base Sepolia (testnet)', 'Ethereum Sepolia', 'Ask before each deployment'],
      reply: {
        'Base Sepolia (testnet)': 'Base Sepolia it is. Nothing reaches mainnet without a separate wallet approval either way.',
        'Ethereum Sepolia': 'Switching the initial target to Ethereum Sepolia.',
        'Ask before each deployment': 'Understood \u2014 I\u2019ll always confirm the target network before preparing a deployment transaction.'
      }
    }
  ];

  if (false && onboard && onboardLog) {
    QUESTIONS.forEach(function(_, i){
      var d = document.createElement('span');
      d.className = 'onboard__dot';
      onboardStepsEl.appendChild(d);
    });
    function updateDots(activeIndex){
      $$('.onboard__dot', onboardStepsEl).forEach(function(d, i){
        d.classList.toggle('is-done', i < activeIndex);
        d.classList.toggle('is-current', i === activeIndex);
      });
    }

    function addBubble(role, html){
      onboardLog.insertAdjacentHTML('beforeend', bubbleHTML(role, html));
      onboardBody.scrollTop = onboardBody.scrollHeight;
    }
    function agentSay(text, cb){
      onboardLog.insertAdjacentHTML('beforeend', typingHTML());
      var typingEl = onboardLog.lastElementChild;
      onboardBody.scrollTop = onboardBody.scrollHeight;
      setTimeout(function(){
        typingEl.remove();
        addBubble('agent', '<p>' + text + '</p>');
        if (cb) setTimeout(cb, 260);
      }, 700 + Math.random() * 300);
    }

    var idx = -1;
    var answers = {};

    function renderChips(step){
      onboardChips.innerHTML = '';
      step.options.forEach(function(opt){
        var b = document.createElement('button');
        b.className = 'qrChip';
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', function(){ chooseAnswer(step, opt); });
        onboardChips.appendChild(b);
      });
      onboardInput.disabled = false;
      onboardSend.disabled = false;
    }
    function lockChips(){
      $$('.qrChip', onboardChips).forEach(function(b){ b.disabled = true; });
      onboardInput.disabled = true;
      onboardSend.disabled = true;
    }
    function chooseAnswer(step, label){
      lockChips();
      addBubble('user', escapeHtml(label));
      answers[step.q] = label;
      onboardChips.innerHTML = '';
      agentSay(step.reply[label] || 'Got it \u2014 I\u2019ll factor that in.', next);
    }

    onboardForm.addEventListener('submit', function(e){
      e.preventDefault();
      var val = onboardInput.value.trim();
      if (!val || onboardInput.disabled) return;
      var step = QUESTIONS[idx];
      lockChips();
      addBubble('user', escapeHtml(val));
      onboardInput.value = '';
      onboardChips.innerHTML = '';
      answers[step.q] = val;
      agentSay('Got it \u2014 I\u2019ll factor that in.', next);
    });

    function askStep(){
      idx++;
      updateDots(idx);
      if (idx >= QUESTIONS.length) { return finish(); }
      var step = QUESTIONS[idx];
      agentSay(step.q, function(){ renderChips(step); });
    }
    function next(){ askStep(); }

    function finish(){
      onboardChips.innerHTML = '';
      onboardInput.disabled = true;
      onboardSend.disabled = true;
      agentSay('That\u2019s everything that changes the design. Locking the specification\u2026', function(){
        onboardLog.insertAdjacentHTML('beforeend', typingHTML());
        var typingEl = onboardLog.lastElementChild;
        onboardBody.scrollTop = onboardBody.scrollHeight;
        setTimeout(function(){
          typingEl.remove();
          var rows = [
            ['Reward model', answers['How should rewards reach depositors?'] || '\u2014'],
            ['Upgradeability', answers['Should the vault contract be upgradeable?'] || '\u2014'],
            ['Emergency pause', answers['Who can pause the vault in an emergency?'] || '\u2014'],
            ['Fee / lock-up', answers['Any withdrawal fee or lock-up period?'] || '\u2014'],
            ['Initial network', answers['Which network should I target first?'] || '\u2014']
          ];
          var html = '<p>Here\u2019s what I locked in:</p><div class="specSummary"><dl>' +
            rows.map(function(r){ return '<div><dt>' + r[0] + '</dt><dd>' + escapeHtml(r[1]) + '</dd></div>'; }).join('') +
            '</dl></div>';
          addBubble('agent', html);
          setTimeout(function(){
            addBubble('agent', '<p>Spec v1 locked. Next: threat model \u2192 architecture \u2192 code. I\u2019ll flag anything that needs your wallet before it touches a real network.</p>');
            showEnterButton();
          }, 500);
        }, 900);
      });
    }

    function showEnterButton(){
      onboardFootInner.innerHTML = '<button class="btn-primary" id="onboardEnter" type="button" style="width:100%">Enter workspace \u2192</button>';
      $('#onboardEnter').addEventListener('click', enterWorkspace);
    }
    function enterWorkspace(){
      onboard.classList.add('is-hidden');
    }

    // Kick off with the prompt supplied from Home.
    // Fall back to the demo prompt when the workspace is opened directly.
    var projectPrompt =
      initialPrompt ||
      'I want to build a yield vault on Base — users deposit USDC, earn yield, and can claim rewards anytime. Keep it simple and safe, testnet first.';

    addBubble('user', escapeHtml(projectPrompt));

    agentSay(
      'I detected an EVM project — Solidity + Foundry, targeting Base. A few quick questions before I lock the spec, then I’ll move straight to threat modeling and code.',
      askStep
    );
  }

  /* ---------------- Prompt-driven specification generation ---------------- */
  var specVersion = 0;

  function addOnboardBubble(role, html){
    onboardLog.insertAdjacentHTML('beforeend', bubbleHTML(role, html));
    onboardBody.scrollTop = onboardBody.scrollHeight;
  }

  function setSpecText(id, value){
    var node = $('#' + id);
    if (node) node.textContent = value || '\u2014';
  }

  function renderSpecList(id, values, prefix){
    var list = $('#' + id);
    list.replaceChildren();
    values.forEach(function(value, index){
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(value));
      var tag = document.createElement('span');
      tag.textContent = prefix + '-' + String(index + 1).padStart(2, '0');
      item.appendChild(tag);
      list.appendChild(item);
    });
    if (!values.length) {
      var empty = document.createElement('li');
      empty.textContent = 'None specified.';
      list.appendChild(empty);
    }
  }

  function renderSpecification(specification){
    setSpecText('specProject', specification.projectName);
    setSpecText('specEcosystem', specification.ecosystem);
    setSpecText('specKind', specification.contractKind);
    setSpecText('specTargets', specification.targetNetworks);
    setSpecText('specComplexity', specification.complexity);
    setSpecText('specSummary', specification.summary);
    var language = $('#specLanguage');
    language.replaceChildren(document.createTextNode(specification.language || '\u2014'));
    var framework = document.createElement('span');
    framework.textContent = specification.framework || '';
    language.appendChild(framework);
    renderSpecList('specFunctional', specification.functionalRequirements, 'FR');
    renderSpecList('specSecurity', specification.securityRequirements, 'SR');
    renderSpecList('specOutOfScope', specification.outOfScope, 'OOS');
    renderSpecList('specAssumptions', specification.assumptions, 'A');
    setSpecText('onboardProject', specification.projectName);
    setSpecText('onboardEcosystem', specification.ecosystem + ' \u00b7 ' + specification.targetNetworks);
    setSpecText('specVersion', 'Generated v' + specVersion);
  }

  function showEnterButton(){
    if ($('#onboardEnter')) return;
    var button = document.createElement('button');
    button.className = 'btn-primary';
    button.id = 'onboardEnter';
    button.type = 'button';
    button.textContent = 'Open specification';
    button.addEventListener('click', function(){ onboard.classList.add('is-hidden'); });
    onboardFootInner.insertBefore(button, onboardForm);
  }

  async function generateSpecification(prompt){
    onboardSend.disabled = true;
    onboardInput.disabled = true;
    onboardLog.insertAdjacentHTML('beforeend', typingHTML());
    var typingEl = onboardLog.lastElementChild;
    onboardBody.scrollTop = onboardBody.scrollHeight;

    try {
      var response = await fetch('/api/specification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      });
      var result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Specification generation failed.');
      typingEl.remove();
      specVersion++;
      renderSpecification(result.specification);
      addOnboardBubble('agent', '<p>Your prompt has been converted into a structured specification. Review it in the workspace, or describe a change here to regenerate it.</p>');
      showEnterButton();
    } catch (error) {
      typingEl.remove();
      var message = error instanceof Error ? error.message : 'Specification generation failed.';
      addOnboardBubble('agent', '<p>' + escapeHtml(message) + ' Update the prompt below and try again.</p>');
    } finally {
      onboardSend.disabled = false;
      onboardInput.disabled = false;
      onboardInput.focus();
    }
  }

  if (onboard && onboardLog) {
    var projectPrompt = initialPrompt || 'Describe the software project you want to build.';
    addOnboardBubble('user', escapeHtml(projectPrompt));
    addOnboardBubble('agent', '<p>Generating a specification from your request\u2026</p>');
    generateSpecification(projectPrompt);

    onboardForm.addEventListener('submit', function(e){
      e.preventDefault();
      var refinement = onboardInput.value.trim();
      if (!refinement || onboardSend.disabled) return;
      onboardInput.value = '';
      projectPrompt += '\n\nUser refinement: ' + refinement;
      addOnboardBubble('user', escapeHtml(refinement));
      generateSpecification(projectPrompt);
    });
  }

  /* Seed the in-workspace chat with a primer so it isn't empty on first open. */
  if (agentLog) {
    agentLog.innerHTML = bubbleHTML('agent', '<p>Ask me to change or add to VaultCore.sol \u2014 I\u2019ll draft the diff and re-queue tests and the security review before anything ships.</p>');
  }

}
