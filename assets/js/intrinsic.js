/* Intrinsic resistance lookup: by organism or by antibiotic. Data in intrinsic-data.js. */
(function () {
  var host = document.getElementById('ir');
  var D = window.IR_DATA;
  if (!host || !D) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ORGS = [];
  D.groups.forEach(function (g) { g[1].forEach(function (o) { ORGS.push({ name: o[0], group: g[0], res: o[1] }); }); });
  var DRUGS = [];
  D.classes.forEach(function (c) { c[1].forEach(function (n) { DRUGS.push({ name: n, cls: c[0] }); }); });

  var st = { mode: 'org', pick: ORGS[0].name, q: '' };

  function draw() {
    var h = '<div class="ir-modes" role="tablist">' +
      '<button type="button" role="tab" class="sp-chip' + (st.mode === 'org' ? ' on' : '') + '" data-mode="org" aria-selected="' + (st.mode === 'org') + '">By organism</button>' +
      '<button type="button" role="tab" class="sp-chip' + (st.mode === 'drug' ? ' on' : '') + '" data-mode="drug" aria-selected="' + (st.mode === 'drug') + '">By antibiotic</button></div>';
    h += '<div class="ir-layout"><div class="ir-list"><input id="ir-q" type="search" placeholder="' + (st.mode === 'org' ? 'Filter organisms…' : 'Filter antibiotics…') + '" value="' + esc(st.q) + '" aria-label="Filter list" autocomplete="off"><div class="ir-items">';
    var q = st.q.toLowerCase().trim();
    if (st.mode === 'org') {
      D.groups.forEach(function (g) {
        var items = g[1].filter(function (o) { return !q || o[0].toLowerCase().indexOf(q) !== -1; });
        if (!items.length) return;
        h += '<p class="ir-grp">' + esc(g[0]) + '</p>';
        items.forEach(function (o) { var a = (D.ampc || {})[o[0]]; h += '<button type="button" class="ir-item' + (st.pick === o[0] ? ' on' : '') + '" data-pick="' + esc(o[0]) + '"><i>' + esc(o[0]) + '</i>' + (a ? '<span class="ir-ampc ' + a[0] + '">AmpC</span>' : '') + '</button>'; });
      });
    } else {
      D.classes.forEach(function (c) {
        var items = c[1].filter(function (n) { return !q || n.toLowerCase().indexOf(q) !== -1; });
        if (!items.length) return;
        h += '<p class="ir-grp">' + esc(c[0]) + '</p>';
        items.forEach(function (n) { h += '<button type="button" class="ir-item' + (st.pick === n ? ' on' : '') + '" data-pick="' + esc(n) + '">' + esc(n) + '</button>'; });
      });
    }
    h += '</div></div><div class="ir-detail" aria-live="polite">' + detail() + '</div></div>';
    host.innerHTML = h;
  }

  function detail() {
    var h = '';
    if (st.mode === 'org') {
      var o = ORGS.filter(function (x) { return x.name === st.pick; })[0];
      if (!o) return '<p class="ir-empty">Pick an organism.</p>';
      h += '<p class="ir-eyebrow">' + esc(o.group) + '</p><h3><i>' + esc(o.name) + '</i></h3>';
      var am = (D.ampc || {})[o.name];
      if (am) h += '<div class="ir-flag ' + am[0] + '"><b>' + (am[0] === 'high' ? 'AmpC: high risk' : 'AmpC: low risk') + '</b> ' + esc(am[1]) + '</div>';
      h += '<p class="ir-lead">Expected to be resistant to:</p>';
      D.classes.forEach(function (c) {
        var hits = c[1].filter(function (n) { return o.res.indexOf(n) !== -1; });
        if (!hits.length) return;
        h += '<div class="ir-row"><span class="ir-cls">' + esc(c[0]) + '</span><span class="ir-pills">' + hits.map(function (n) { return '<span class="ir-pill">' + esc(n) + '</span>'; }).join('') + '</span></div>';
      });
      if (D.notes[o.name]) h += '<p class="ir-note">' + esc(D.notes[o.name]) + '</p>';
    } else {
      var hitsByGroup = D.groups.map(function (g) { return [g[0], g[1].filter(function (x) { return x[1].indexOf(st.pick) !== -1; })]; }).filter(function (g) { return g[1].length; });
      var cls = (DRUGS.filter(function (d) { return d.name === st.pick; })[0] || {}).cls || '';
      h += '<p class="ir-eyebrow">' + esc(cls) + '</p><h3>' + esc(st.pick) + '</h3>';
      if (!hitsByGroup.length) h += '<p class="ir-lead">None of the listed organisms are intrinsically resistant to ' + esc(st.pick) + '. Acquired resistance is still possible.</p>';
      else {
        h += '<p class="ir-lead">Organisms expected to be resistant:</p>';
        hitsByGroup.forEach(function (g) {
          h += '<div class="ir-row"><span class="ir-cls">' + esc(g[0]) + '</span><span class="ir-pills">' + g[1].map(function (x) { return '<button type="button" class="ir-pill link" data-goorg="' + esc(x[0]) + '"><i>' + esc(x[0]) + '</i></button>'; }).join('') + '</span></div>';
        });
      }
    }
    return h;
  }

  host.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mode]'), p = e.target.closest('[data-pick]'), g = e.target.closest('[data-goorg]');
    if (m) { st.mode = m.getAttribute('data-mode'); st.q = ''; st.pick = st.mode === 'org' ? ORGS[0].name : DRUGS[0].name; draw(); }
    else if (p) { st.pick = p.getAttribute('data-pick'); host.querySelector('.ir-detail').innerHTML = detail(); host.querySelectorAll('.ir-item').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-pick') === st.pick); }); if (window.innerWidth < 760) host.querySelector('.ir-detail').scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    else if (g) { st.mode = 'org'; st.q = ''; st.pick = g.getAttribute('data-goorg'); draw(); }
  });
  host.addEventListener('input', function (e) {
    if (e.target.id !== 'ir-q') return;
    st.q = e.target.value;
    var pos = e.target.selectionStart;
    draw();
    var inp = host.querySelector('#ir-q'); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  // Deep links from site search: #org-<slug> or #abx-<slug>
  function fromHash() {
    var m = /^#(org|abx)-(.+)$/.exec(location.hash);
    if (!m) return false;
    var list = m[1] === 'org' ? ORGS : DRUGS;
    var hit = list.filter(function (x) { return slug(x.name) === m[2]; })[0];
    if (!hit) return false;
    st.mode = m[1] === 'org' ? 'org' : 'drug'; st.q = ''; st.pick = hit.name;
    return true;
  }
  window.addEventListener('hashchange', function () {
    if (fromHash()) { draw(); host.scrollIntoView({ block: 'start' }); var on = host.querySelector('.ir-item.on'); if (on) on.scrollIntoView({ block: 'nearest' }); }
  });
  fromHash();
  draw();
  var on0 = host.querySelector('.ir-item.on'); if (on0 && location.hash) { on0.scrollIntoView({ block: 'nearest' }); host.scrollIntoView({ block: 'start' }); }
})();
