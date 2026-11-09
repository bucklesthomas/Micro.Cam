/* Coverage checker: pick the current antibiotics and the organisms (or groups) of concern; shows whether the regimen is likely to cover each. Data in abx-data.js. */
(function () {
  var host = document.getElementById('cov');
  var A = window.ABX_DATA;
  if (!host || !A) return;
  var abxHref = host.getAttribute('data-abx') || '';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var CLASSES = [];
  A.drugs.forEach(function (d) { if (CLASSES.indexOf(d.cls) === -1) CLASSES.push(d.cls); });
  var on = [], bugs = [], q = '';
  var byId = {}; A.drugs.forEach(function (d) { byId[d.id] = d; });

  function drugPicker() {
    var h = '<input id="cov-q" type="search" placeholder="Filter antibiotics…" value="' + esc(q) + '" aria-label="Filter antibiotics" autocomplete="off">';
    var ql = q.toLowerCase().trim();
    CLASSES.forEach(function (c) {
      var ds = A.drugs.filter(function (d) { return d.cls === c && (!ql || on.indexOf(d.id) !== -1 || (d.name + ' ' + d.brands).toLowerCase().indexOf(ql) !== -1); });
      if (!ds.length) return;
      h += '<p class="ir-grp">' + esc(c) + '</p><div class="cov-chips">';
      ds.forEach(function (d) { var sel = on.indexOf(d.id) !== -1; h += '<button type="button" class="sp-chip' + (sel ? ' on' : '') + '" data-drug="' + d.id + '" aria-pressed="' + sel + '">' + esc(d.name) + '</button>'; });
      h += '</div>';
    });
    return h;
  }

  function bugPicker() {
    var h = '<div class="cov-groups">';
    A.groups.forEach(function (g) {
      var keys = A.orgs.filter(function (o) { return o[2] === g; }).map(function (o) { return o[0]; });
      var all = keys.every(function (k) { return bugs.indexOf(k) !== -1; });
      h += '<button type="button" class="sp-chip' + (all ? ' on' : '') + '" data-group="' + esc(g) + '" aria-pressed="' + all + '">All ' + esc(g.toLowerCase()) + (g === 'Anaerobes' || g === 'Atypicals' ? '' : 's') + '</button>';
    });
    h += '<button type="button" class="sp-chip" data-clearbugs>Clear</button></div>';
    A.groups.forEach(function (g) {
      h += '<p class="ir-grp">' + esc(g) + '</p><div class="cov-chips">';
      A.orgs.forEach(function (o) { if (o[2] !== g) return; var sel = bugs.indexOf(o[0]) !== -1; h += '<button type="button" class="sp-chip' + (sel ? ' on' : '') + '" data-bug="' + o[0] + '" aria-pressed="' + sel + '">' + esc(o[1]) + '</button>'; });
      h += '</div>';
    });
    return h;
  }

  function results() {
    if (!on.length) return '<p class="ir-empty">Choose the antibiotics the patient is on.</p>';
    if (!bugs.length) return '<p class="ir-empty">Choose organisms, or a whole group, to check.</p>';
    var drugs = on.map(function (id) { return byId[id]; });
    var counts = [0, 0, 0], rows = '';
    A.orgs.forEach(function (o, i) {
      if (bugs.indexOf(o[0]) === -1) return;
      var best = 0, by = [], part = [];
      drugs.forEach(function (d) { var v = +d.cov.charAt(i); if (v > best) best = v; if (v === 2) by.push(d.name); else if (v === 1) part.push(d.name); });
      counts[best]++;
      var label = best === 2 ? 'Likely covered' : best === 1 ? 'Possibly covered' : 'Not covered';
      var why = best === 2 ? 'by ' + by.join(', ') : best === 1 ? 'variable with ' + part.join(', ') + ': check susceptibility' : 'no listed antibiotic is reliably active';
      rows += '<tr class="cvr' + best + '"><th scope="row">' + esc(o[1]) + '</th><td><span class="cov-pill p' + best + '">' + label + '</span></td><td class="cov-why">' + esc(why) + '</td></tr>';
    });
    var h = '<div class="cov-sum"><span class="cov-pill p2">' + counts[2] + ' likely</span><span class="cov-pill p1">' + counts[1] + ' possible</span><span class="cov-pill p0">' + counts[0] + ' not covered</span></div>';
    var sites = drugs.filter(function (d) { return d.site; });
    if (sites.length) h += '<div class="ir-flag low"><b>Site limitations</b> ' + sites.map(function (d) { return esc(d.name) + ': ' + esc(d.site.toLowerCase()); }).join('; ') + '. Coverage shown assumes the drug reaches the site.</div>';
    h += '<div class="sp-scroll"><table class="cov-tbl"><thead><tr><th>Organism</th><th>Verdict</th><th>Why</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    h += '<p class="ab-note">Regimen: ' + drugs.map(function (d) { return '<a href="' + esc(abxHref) + '#drug-' + d.id + '">' + esc(d.name) + '</a>'; }).join(', ') + '. Combinations are scored by the most active drug for each organism; synergy (e.g. a penicillin with gentamicin for enterococci) is not modelled.</p>';
    return h;
  }

  function draw() {
    host.innerHTML = '<div class="cov-layout"><section class="card af-card"><h2>1. Patient is on</h2>' + drugPicker() + '</section>' +
      '<section class="card af-card"><h2>2. Organisms to cover</h2>' + bugPicker() + '</section></div>' +
      '<section class="card af-card" aria-live="polite"><h2>Coverage</h2>' + results() + '</section>';
  }
  function toggle(arr, v) { var i = arr.indexOf(v); if (i === -1) arr.push(v); else arr.splice(i, 1); }

  host.addEventListener('click', function (e) {
    var t = e.target.closest('[data-drug],[data-bug],[data-group],[data-clearbugs]');
    if (!t) return;
    var y = window.scrollY;
    if (t.hasAttribute('data-drug')) toggle(on, t.getAttribute('data-drug'));
    else if (t.hasAttribute('data-bug')) toggle(bugs, t.getAttribute('data-bug'));
    else if (t.hasAttribute('data-clearbugs')) bugs = [];
    else {
      var g = t.getAttribute('data-group');
      var keys = A.orgs.filter(function (o) { return o[2] === g; }).map(function (o) { return o[0]; });
      var all = keys.every(function (k) { return bugs.indexOf(k) !== -1; });
      keys.forEach(function (k) { var i = bugs.indexOf(k); if (all && i !== -1) bugs.splice(i, 1); if (!all && i === -1) bugs.push(k); });
    }
    var sel = t.getAttribute('data-drug') || t.getAttribute('data-bug') || t.getAttribute('data-group');
    draw();
    window.scrollTo(0, y);
    var again = sel && host.querySelector('[data-drug="' + sel + '"],[data-bug="' + sel + '"],[data-group="' + sel + '"]');
    if (again) again.focus({ preventScroll: true });
  });
  host.addEventListener('input', function (e) {
    if (e.target.id !== 'cov-q') return;
    q = e.target.value; var pos = e.target.selectionStart; draw();
    var inp = host.querySelector('#cov-q'); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  function fromHash() { var m = /^#on-(.+)$/.exec(location.hash); if (m && byId[m[1]] && on.indexOf(m[1]) === -1) { on.push(m[1]); return true; } return false; }
  window.addEventListener('hashchange', function () { if (fromHash()) { draw(); host.scrollIntoView({ block: 'start' }); } });
  fromHash(); draw();
})();
