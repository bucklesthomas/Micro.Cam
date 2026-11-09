/* Antibiotic reference: clickable boxes grouped by class, with a detail card. Data in abx-data.js (and intrinsic-data.js for EUCAST expected resistance). */
(function () {
  var host = document.getElementById('abx');
  var A = window.ABX_DATA, IR = window.IR_DATA;
  if (!host || !A) return;
  var covHref = host.getAttribute('data-coverage') || '';
  var irHref = host.getAttribute('data-intrinsic') || '';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var CLASSES = [];
  A.drugs.forEach(function (d) { if (CLASSES.indexOf(d.cls) === -1) CLASSES.push(d.cls); });
  var st = { aware: 'All', q: '', pick: null };

  function awareBadge(a) { return '<span class="aw aw-' + slug(a) + '">' + esc(a === 'Not listed' ? 'Not in UK-AWaRe' : a) + '</span>'; }

  function grid() {
    var q = st.q.toLowerCase().trim(), h = '';
    CLASSES.forEach(function (c) {
      var ds = A.drugs.filter(function (d) {
        return d.cls === c && (st.aware === 'All' || d.aware === st.aware) &&
          (!q || (d.name + ' ' + d.brands + ' ' + d.cls).toLowerCase().indexOf(q) !== -1);
      });
      if (!ds.length) return;
      h += '<h3 class="ab-cls">' + esc(c) + '</h3><div class="ab-grid">';
      ds.forEach(function (d) {
        h += '<button type="button" class="ab-box' + (st.pick === d.id ? ' on' : '') + '" data-id="' + d.id + '" aria-expanded="' + (st.pick === d.id) + '">' +
          '<span class="ab-name">' + esc(d.name) + '</span><span class="ab-meta">' + awareBadge(d.aware) + '<span class="ab-route">' + esc(d.routes) + '</span></span></button>';
      });
      h += '</div>';
    });
    return h || '<p class="ir-empty">No antibiotics match.</p>';
  }

  function spectrum(d) {
    var h = '<div class="ab-spec">';
    A.groups.forEach(function (g) {
      h += '<div class="ab-spec-g"><p>' + esc(g) + '</p><ul>';
      A.orgs.forEach(function (o, i) {
        if (o[2] !== g) return;
        var v = d.cov.charAt(i);
        h += '<li class="cv cv' + v + '"><span class="dot" aria-hidden="true"></span>' + esc(o[1]) + '<span class="sr"> (' + (v === '2' ? 'usually active' : v === '1' ? 'variable' : 'not active') + ')</span></li>';
      });
      h += '</ul></div>';
    });
    return h + '</div>';
  }

  function intrinsic(d) {
    if (!IR || !d.ir.length) return '';
    var orgs = [];
    IR.groups.forEach(function (g) { g[1].forEach(function (o) { if (d.ir.some(function (n) { return o[1].indexOf(n) !== -1; })) orgs.push(o[0]); }); });
    if (!orgs.length) return '';
    return '<div class="ab-sec"><h4>Intrinsically resistant (EUCAST)</h4><p class="ab-pills">' + orgs.map(function (o) {
      return '<a class="ir-pill link" href="' + esc(irHref) + '#org-' + slug(o) + '"><i>' + esc(o) + '</i></a>';
    }).join('') + '</p></div>';
  }

  function detail(d) {
    var h = '<div class="ab-detail card" id="ab-detail" tabindex="-1">';
    h += '<div class="ab-head"><div><p class="ir-eyebrow">' + esc(d.cls) + '</p><h3>' + esc(d.name) + '</h3><p class="ab-sub">' + awareBadge(d.aware) + ' <span>' + esc(d.routes) + '</span></p></div>' +
      '<button type="button" class="sp-chip" data-close>Close</button></div>';
    if (d.site) h += '<div class="ir-flag low"><b>Site limitation</b> ' + esc(d.site) + '</div>';
    h += '<div class="ab-cols"><div>';
    h += '<div class="ab-sec"><h4>Usual adult dose</h4><table class="ab-tbl">' + d.dose.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') +
      '<tr><th>Renal</th><td>' + esc(d.renal) + '</td></tr></table></div>';
    h += '<div class="ab-sec"><h4>Main uses</h4><ul>' + d.uses.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="ab-sec"><h4>Cautions</h4><ul>' + d.cautions.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div>';
    h += '</div><div>';
    h += '<div class="ab-sec"><h4>PK/PD</h4><table class="ab-tbl">' +
      '<tr><th>PD index</th><td>' + esc(d.pkpd.idx) + '</td></tr><tr><th>Target</th><td>' + esc(d.pkpd.target) + '</td></tr>' +
      '<tr><th>Half-life</th><td>' + esc(d.pk.t12) + '</td></tr><tr><th>Protein binding</th><td>' + esc(d.pk.pb) + '</td></tr>' +
      '<tr><th>Oral bioavailability</th><td>' + esc(d.pk.f) + '</td></tr><tr><th>Elimination</th><td>' + esc(d.pk.elim) + '</td></tr>' +
      '<tr><th>Penetration</th><td>' + esc(d.pk.pen) + '</td></tr>' +
      (d.tdm ? '<tr><th>TDM</th><td>' + esc(d.tdm) + '</td></tr>' : '') + '</table>' +
      '<p class="ab-note">' + esc(A.classes[d.cls] || '') + '</p></div>';
    h += '</div></div>';
    h += '<div class="ab-sec"><h4>Spectrum</h4><p class="ab-key"><span class="cv cv2"><span class="dot"></span>usually active</span><span class="cv cv1"><span class="dot"></span>variable or limited role</span><span class="cv cv0"><span class="dot"></span>not active</span></p>' + spectrum(d) + '</div>';
    h += intrinsic(d);
    h += '<p class="ab-actions"><a class="sp-chip on" href="' + esc(covHref) + '#on-' + d.id + '">Check coverage with this antibiotic</a></p>';
    return h + '</div>';
  }

  function draw(focus) {
    var d = A.drugs.filter(function (x) { return x.id === st.pick; })[0];
    var h = '<div class="ab-bar"><input id="ab-q" type="search" placeholder="Filter antibiotics…" value="' + esc(st.q) + '" aria-label="Filter antibiotics" autocomplete="off"><div class="ab-aw" role="group" aria-label="UK-AWaRe category">';
    ['All', 'Access', 'Watch', 'Reserve'].forEach(function (a) { h += '<button type="button" class="sp-chip' + (st.aware === a ? ' on' : '') + '" data-aw="' + a + '">' + a + '</button>'; });
    h += '</div></div><div class="ab-list">' + grid() + '</div>';
    host.innerHTML = h;
    if (d) {
      var box = host.querySelector('.ab-box[data-id="' + d.id + '"]');
      var wrap = document.createElement('div'); wrap.innerHTML = detail(d);
      var after = box ? box.parentNode : host.querySelector('.ab-list');
      after.parentNode.insertBefore(wrap.firstChild, after.nextSibling);
      if (focus) { var el = document.getElementById('ab-detail'); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.focus({ preventScroll: true }); }
    }
  }

  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-id]'), a = e.target.closest('[data-aw]');
    if (b) { st.pick = st.pick === b.getAttribute('data-id') ? null : b.getAttribute('data-id'); draw(!!st.pick); if (!st.pick) b.focus(); }
    else if (a) { st.aware = a.getAttribute('data-aw'); draw(false); }
    else if (e.target.closest('[data-close]')) { var id = st.pick; st.pick = null; draw(false); var bx = host.querySelector('.ab-box[data-id="' + id + '"]'); if (bx) { bx.focus(); bx.scrollIntoView({ block: 'center' }); } }
  });
  host.addEventListener('input', function (e) {
    if (e.target.id !== 'ab-q') return;
    st.q = e.target.value; var pos = e.target.selectionStart; draw(false);
    var inp = host.querySelector('#ab-q'); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  function fromHash() {
    var m = /^#drug-(.+)$/.exec(location.hash);
    if (m && A.drugs.some(function (d) { return d.id === m[1]; })) { st.pick = m[1]; st.q = ''; st.aware = 'All'; return true; }
    return false;
  }
  window.addEventListener('hashchange', function () { if (fromHash()) draw(true); });
  var deep = fromHash(); draw(deep);
})();
