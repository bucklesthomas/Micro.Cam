/* Organism pages: key facts, first-line treatment, spectrum, intrinsic resistance and links, for each organism.
   Data: org-data.js, abx-data.js (spectrum), intrinsic-data.js (EUCAST expected resistance). */
(function () {
  var host = document.getElementById('org');
  var O = window.ORG_DATA, A = window.ABX_DATA, IR = window.IR_DATA;
  if (!host || !O) return;
  var base = host.getAttribute('data-base') || '';
  var abxHref = host.getAttribute('data-abx') || '', irHref = host.getAttribute('data-intrinsic') || '', bpHref = host.getAttribute('data-bp') || '', covHref = host.getAttribute('data-coverage') || '';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var hashMode = host.hasAttribute('data-hash');
  function url(u) {
    if (u.charAt(0) !== '/') return u;
    if (hashMode) { var m = /^\/([^/]+)\/(#.*)?$/.exec(u); return m ? (m[2] || '#' + m[1]) : u; }
    return base + u;
  }
  var st = { pick: O.orgs[0].id, q: '' };
  var IRO = {};
  if (IR) IR.groups.forEach(function (g) { g[1].forEach(function (o) { IRO[o[0]] = o[1]; }); });

  function list() {
    var q = st.q.toLowerCase().trim(), h = '';
    O.groups.forEach(function (g) {
      var os = O.orgs.filter(function (o) { return o.g === g && (!q || (o.n + ' ' + o.syn).toLowerCase().indexOf(q) !== -1); });
      if (!os.length) return;
      h += '<p class="ir-grp">' + esc(g) + '</p>';
      os.forEach(function (o) { h += '<button type="button" class="ir-item' + (st.pick === o.id ? ' on' : '') + '" data-pick="' + o.id + '">' + esc(o.n) + '</button>'; });
    });
    return h || '<p class="ir-empty">No match.</p>';
  }

  function spectrum(o) {
    if (!A || !o.cov) return '';
    var i = -1; A.orgs.forEach(function (x, j) { if (x[0] === o.cov) i = j; });
    if (i < 0) return '';
    var good = [], mid = [];
    A.drugs.forEach(function (d) { var v = d.cov.charAt(i); if (v === '2') good.push(d); else if (v === '1') mid.push(d); });
    function pills(ds, cls) { return ds.map(function (d) { return '<a class="org-pill ' + cls + '" href="' + esc(abxHref) + '#drug-' + d.id + '">' + esc(d.name) + '</a>'; }).join(''); }
    var h = '<div class="ab-sec"><h4>Antibiotic activity (typical UK isolates)</h4>';
    if (good.length) h += '<p class="org-lab">Usually active</p><p class="ab-pills">' + pills(good, 'g') + '</p>';
    if (mid.length) h += '<p class="org-lab">Variable: check susceptibility</p><p class="ab-pills">' + pills(mid, 'm') + '</p>';
    return h + '<p class="ab-note">From the spectrum data on the antibiotics page (' + esc(A.orgs[i][1]) + '). Site, dose and the isolate’s susceptibility still decide.</p></div>';
  }

  function detail() {
    var o = O.orgs.filter(function (x) { return x.id === st.pick; })[0]; if (!o) return '';
    var h = '<p class="ir-eyebrow">' + esc(o.g) + '</p><h3>' + esc(o.n) + '</h3>';
    var am = IR && IR.ampc && o.ir ? IR.ampc[o.ir] : null;
    if (am) h += '<div class="ir-flag ' + am[0] + '"><b>' + (am[0] === 'high' ? 'AmpC: high risk' : 'AmpC: low risk') + '</b> ' + esc(am[1]) + '</div>';
    h += '<div class="ab-sec"><h4>Key points</h4><ul>' + o.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="org-tx"><p class="org-lab">First-line treatment</p><p>' + esc(o.tx) + '</p>' + (o.alt ? '<p class="org-alt">' + esc(o.alt) + '</p>' : '') + '</div>';
    h += spectrum(o);
    if (o.ir && IRO[o.ir] && IRO[o.ir].length) {
      h += '<div class="ab-sec"><h4>Intrinsically resistant to (EUCAST)</h4><p class="ab-pills">' + IRO[o.ir].map(function (n) { return '<span class="ir-pill">' + esc(n) + '</span>'; }).join('') + '</p>' +
        '<p class="ab-note"><a href="' + esc(irHref) + '#org-' + slug(o.ir) + '">Open in the intrinsic resistance table</a></p></div>';
    }
    var links = o.links.map(function (l) { return '<a class="sp-chip" href="' + esc(url(l[1])) + '">' + esc(l[0]) + '</a>'; });
    if (o.bp) links.push('<a class="sp-chip" href="' + esc(bpHref) + '#bp-' + slug(o.bp) + '">EUCAST breakpoints</a>');
    if (o.cov) links.push('<a class="sp-chip" href="' + esc(covHref || (hashMode ? '#coverage' : '')) + '">Coverage checker</a>');
    if (links.length) h += '<div class="ab-sec"><h4>Related</h4><p class="cov-chips">' + links.join('') + '</p></div>';
    return h;
  }

  function draw(keep) {
    host.innerHTML = '<div class="ir-layout"><div class="ir-list"><input id="org-q" type="search" placeholder="Search organisms…" value="' + esc(st.q) + '" aria-label="Search organisms" autocomplete="off"><div class="ir-items">' + list() + '</div></div><div class="ir-detail" aria-live="polite">' + detail() + '</div></div>';
    if (keep) { var i = host.querySelector('#org-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pick]'); if (!p) return;
    st.pick = p.getAttribute('data-pick');
    host.querySelectorAll('.ir-item').forEach(function (b) { b.classList.toggle('on', b === p); });
    host.querySelector('.ir-detail').innerHTML = detail();
    try { history.replaceState(null, '', '#bug-' + st.pick); } catch (err) {}
    if (window.innerWidth < 760) host.querySelector('.ir-detail').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  host.addEventListener('input', function (e) { if (e.target.id === 'org-q') { st.q = e.target.value; draw(e.target.selectionStart || st.q.length); } });
  function fromHash() { var m = /^#bug-(.+)$/.exec(location.hash); if (m && O.orgs.some(function (o) { return o.id === m[1]; })) { st.pick = m[1]; st.q = ''; return true; } return false; }
  window.addEventListener('hashchange', function () { if (fromHash()) { draw(); host.scrollIntoView({ block: 'start' }); } });
  var deep = fromHash(); draw();
  if (deep) { var on = host.querySelector('.ir-item.on'); if (on) on.scrollIntoView({ block: 'nearest' }); host.scrollIntoView({ block: 'start' }); }
})();
