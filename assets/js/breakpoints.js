/* EUCAST breakpoint interpreter: pick an organism and an antibiotic, enter an MIC or zone diameter, get S / I / R with the EUCAST notes.
   Data in bp-data.js (EUCAST 2026 via the AMR R package). */
(function () {
  var host = document.getElementById('bp');
  var D = window.BP_DATA;
  if (!host || !D) return;
  var abxHref = host.getAttribute('data-abx') || '';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(v) { return v == null ? '' : String(+v); }
  var KIND = [['gram-neg', 'Gram-negative bacteria'], ['gram-pos', 'Gram-positive bacteria'], ['fungus', 'Fungi']];
  var st = { org: null, ab: null, oq: '', aq: '', mic: '', zone: '', topical: false };

  // Resolve the rows that apply to an organism: the most specific level wins for each antibiotic, method and indication.
  function resolve(org) {
    var seen = {}, out = {};
    org.chain.forEach(function (mo) {
      (D.rows[mo] || []).forEach(function (r) {
        var key = r[0] + '|' + r[1] + '|' + r[2];
        var hasBp = r[4] != null || r[5] != null;
        if (seen[key] && seen[key].mo !== mo) return;
        if (seen[key] && seen[key].mo === mo && (seen[key].bp || !hasBp)) return; // same level in two tables: keep the one with breakpoints
        if (seen[key]) out[r[0]].splice(out[r[0]].indexOf(seen[key].row), 1);
        seen[key] = { mo: mo, bp: hasBp, row: r };
        (out[r[0]] = out[r[0]] || []).push(r);
      });
    });
    return out;
  }

  function bracketed(r) {
    var m = /brackets only \(S \(([\d.]+)\), R \(([\d.]+)\)\)/.exec(D.notes[r[7]]);
    return m ? [+m[1], +m[2]] : null;
  }
  function noS(r, s) { return r[1] === 0 ? s != null && s <= 0.001 : s != null && s >= 50; }
  function bpText(r) {
    var s = r[4], rr = r[5], br = null;
    if (s == null && rr == null) { br = bracketed(r); if (!br) return '<span class="bp-none">No breakpoint</span>'; s = br[0]; rr = br[1]; }
    var t;
    if (r[1] === 0) t = noS(r, s) ? 'No S category · I ≤ ' + fmt(rr) + ' · R > ' + fmt(rr) : 'S ≤ ' + fmt(s) + ' · R > ' + fmt(rr);
    else t = noS(r, s) ? 'No S category · I ≥ ' + fmt(rr) + ' · R < ' + fmt(rr) : 'S ≥ ' + fmt(s) + ' · R < ' + fmt(rr);
    return (br ? '(' + t + ')' : t) + (r[1] === 0 ? ' mg/L' : ' mm');
  }

  function parseMic(v) {
    v = String(v).trim().replace(/\s+/g, '').replace('≤', '<=').replace('≥', '>=').replace(/mg\/l$/i, '');
    var m = /^(<=|<|>=|>)?(\d*\.?\d+)$/.exec(v);
    return m ? { op: m[1] || '', x: parseFloat(m[2]) } : null;
  }
  // Returns 'S', 'I', 'R', '?' (cannot tell) or null (no input / no breakpoint)
  function interpret(r) {
    var s = r[4], rr = r[5], br = null;
    if (s == null && rr == null) { br = bracketed(r); if (!br) return null; s = br[0]; rr = br[1]; }
    var res;
    if (r[1] === 0) {
      var p = parseMic(st.mic); if (!p) return null;
      var lo = p.x, hi = p.x;
      if (p.op === '<=' || p.op === '<') lo = 0;
      if (p.op === '>' || p.op === '>=') hi = Infinity;
      var cat = function (m) { if (m > rr) return 'R'; if (noS(r, s)) return 'I'; return m <= s ? 'S' : 'I'; };
      var a = cat(p.op === '>' ? p.x * 1.0001 : lo), b = cat(p.op === '<' ? p.x * 0.9999 : hi);
      res = a === b ? a : '?';
    } else {
      var z = parseFloat(String(st.zone).replace(/mm$/i, '')); if (isNaN(z)) return null;
      res = z < rr ? 'R' : noS(r, s) ? 'I' : z >= s ? 'S' : 'I';
    }
    return { cat: res, br: !!br };
  }
  var CAT = {
    S: ['Susceptible', 'Susceptible, standard dosing regimen: a high likelihood of therapeutic success with the standard dose.'],
    I: ['Susceptible, increased exposure', 'Susceptible if exposure is increased: use the high dose in the EUCAST dosing table, or rely on concentration at the site (e.g. urine).'],
    R: ['Resistant', 'A high likelihood of therapeutic failure even with increased exposure.'],
    '?': ['Cannot tell', 'The value given spans more than one category (e.g. "≤ 2" when the breakpoint is 0.5). Ask the laboratory for the exact value.']
  };

  function site(r) {
    var s = r[2] || 'All indications';
    s = s.replace('Topical, Screen', 'Topical use / screening').replace(/^Screen$/, 'Screening test');
    return s;
  }

  function orgList() {
    var q = st.oq.toLowerCase().trim(), h = '';
    KIND.forEach(function (k) {
      var os = D.orgs.filter(function (o) { return o.kind === k[0] && (q ? o.n.toLowerCase().indexOf(q) !== -1 : o.show); });
      if (!os.length) return;
      h += '<p class="ir-grp">' + k[1] + '</p>';
      os.forEach(function (o) {
        var i = D.orgs.indexOf(o);
        var italic = o.rank === 'species' || o.rank === 'genus' || o.rank === 'subspecies';
        h += '<button type="button" class="ir-item' + (st.org === i ? ' on' : '') + '" data-org="' + i + '">' + (italic && !/\(|\//.test(o.n) ? '<i>' + esc(o.n) + '</i>' : esc(o.n)) + '</button>';
      });
    });
    return h || '<p class="ir-empty">No match. Try the genus.</p>';
  }

  function abList(rows) {
    var q = st.aq.toLowerCase().trim();
    var codes = Object.keys(rows).sort(function (a, b) { return D.ab[a].localeCompare(D.ab[b]); });
    var h = '<input id="bp-aq" type="search" placeholder="Filter antimicrobials…" value="' + esc(st.aq) + '" aria-label="Filter antimicrobials" autocomplete="off"><div class="cov-chips bp-abs">';
    codes.forEach(function (c) {
      if (q && D.ab[c].toLowerCase().indexOf(q) === -1) return;
      var any = rows[c].some(function (r) { return r[4] != null || r[5] != null || bracketed(r); });
      h += '<button type="button" class="sp-chip' + (st.ab === c ? ' on' : '') + (any ? '' : ' bp-nobp') + '" data-ab="' + c + '" aria-pressed="' + (st.ab === c) + '">' + esc(D.ab[c]) + '</button>';
    });
    return h + '</div><p class="ab-note">Greyed names have no breakpoint for this organism (EUCAST gives a note, IE or “–” instead).</p>';
  }

  function resultBlock(rows) {
    var all = rows[st.ab].slice().sort(function (a, b) { return a[1] - b[1] || (a[2] ? 1 : 0) - (b[2] ? 1 : 0); });
    var isTop = function (r) { return D.tables[r[8]] === 'Topical agents'; };
    var sys = all.filter(function (r) { return !isTop(r); });
    var hidden = sys.length && sys.length < all.length && !st.topical ? all.length - sys.length : 0;
    var rs = hidden ? sys : all;
    var hasBp = function (r) { return r[4] != null || r[5] != null || !!bracketed(r); };
    var noteRows = rs.slice();
    // drop a general "no breakpoint" row when the same method has indication-specific breakpoints (e.g. fosfomycin)
    rs = rs.filter(function (r) { return hasBp(r) || r[2] || !rs.some(function (x) { return x !== r && x[1] === r[1] && hasBp(x); }); });
    var hasMic = rs.some(function (r) { return r[1] === 0; }), hasDisc = rs.some(function (r) { return r[1] === 1; });
    var h = '<div class="bp-inputs">';
    if (hasMic) h += '<label>MIC (mg/L)<input id="bp-mic" inputmode="decimal" placeholder="e.g. 0.5, ≤0.25, >8" value="' + esc(st.mic) + '" autocomplete="off"></label>';
    if (hasDisc) h += '<label>Zone diameter (mm)<input id="bp-zone" inputmode="numeric" placeholder="e.g. 21" value="' + esc(st.zone) + '" autocomplete="off"></label>';
    h += '</div><div class="bp-rows">';
    var noteIds = [];
    noteRows.forEach(function (r) { if (noteIds.indexOf(r[7]) === -1 && D.notes[r[7]]) noteIds.push(r[7]); });
    rs.forEach(function (r) {
      var it = interpret(r);
      h += '<div class="bp-row"><div class="bp-what"><b>' + (r[1] === 0 ? 'MIC' : 'Disc' + (r[3] ? ' ' + esc(r[3]) : '')) + '</b> · ' + esc(site(r)) + (r[6] ? ' (UTI)' : '') + '<span class="bp-tbl">' + esc(D.tables[r[8]]) + '</span></div>' +
        '<div class="bp-bp">' + bpText(r) + '</div><div class="bp-res">' +
        (it ? '<span class="bp-cat c' + (it.cat === '?' ? 'Q' : it.cat) + '" title="' + esc(CAT[it.cat][1]) + '">' + (it.cat === '?' ? '?' : it.cat) + ' · ' + esc(CAT[it.cat][0]) + '</span>' + (it.br ? '<span class="bp-brk">bracketed breakpoint</span>' : '') : '') + '</div></div>';
    });
    h += '</div>';
    if (hidden) h += '<p class="ab-note"><button type="button" class="sp-chip" data-topical>Show topical breakpoints (' + hidden + ')</button></p>';
    else if (st.topical && sys.length < all.length) h += '<p class="ab-note"><button type="button" class="sp-chip on" data-topical>Hide topical breakpoints</button> Topical breakpoints apply to topical use only.</p>';
    var shown = rs.map(interpret).filter(Boolean);
    if (shown.length) {
      var cats = shown.map(function (x) { return x.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
      h += '<div class="bp-explain">' + cats.map(function (c) { return '<p><b>' + esc(CAT[c][0]) + ':</b> ' + esc(CAT[c][1]) + '</p>'; }).join('') +
        (shown.some(function (x) { return x.br; }) ? '<p><b>Bracketed breakpoints:</b> EUCAST gives these for guidance only (e.g. aminoglycosides in combination, or with other active therapy). Discuss with microbiology.</p>' : '') + '</div>';
    }
    if (noteIds.length) {
      h += '<div class="ab-sec"><h4>EUCAST notes</h4><ul class="bp-notes">';
      var lines = [];
      noteIds.forEach(function (id) { D.notes[id].split(' | ').forEach(function (l) { if (lines.indexOf(l) === -1) lines.push(l); }); });
      lines.forEach(function (l) {
        var m = /^\[([^\]]+)\]\s*(.*)$/.exec(l);
        h += '<li>' + (m ? '<b>' + esc(m[1] === 'No breakpoint' ? 'No breakpoint' : m[1] === '( )' ? 'Brackets' : 'Note ' + m[1]) + ':</b> ' + esc(m[2]) : esc(l)) + '</li>';
      });
      h += '</ul></div>';
    }
    if (D.abLink[st.ab]) h += '<p class="ab-actions"><a class="sp-chip on" href="' + esc(abxHref) + '#drug-' + D.abLink[st.ab] + '">Dosing and PK/PD for ' + esc(D.ab[st.ab]) + '</a></p>';
    return h;
  }

  function detail() {
    if (st.org == null) return '<p class="ir-empty">Pick an organism to start.</p>';
    var o = D.orgs[st.org], rows = resolve(o);
    var tbls = {};
    Object.keys(rows).forEach(function (c) { rows[c].forEach(function (r) { tbls[D.tables[r[8]]] = 1; }); });
    var tn = Object.keys(tbls).filter(function (x) { return x !== 'Topical agents'; }); if (!tn.length) tn = Object.keys(tbls);
    var h = '<p class="ir-eyebrow">EUCAST table: ' + esc(tn.join(', ')) + '</p><h3>' + esc(o.n) + '</h3>';
    if (o.alias) h += '<p class="ab-note">EUCAST has no species-specific entry for this organism: breakpoints come from the ' + esc(tn.join(' and ')) + ' table.</p>';
    h += '<div class="ab-sec"><h4>Antimicrobial</h4>' + abList(rows) + '</div>';
    if (st.ab && rows[st.ab]) h += '<div class="ab-sec bp-result"><h4>' + esc(D.ab[st.ab]) + '</h4>' + resultBlock(rows) + '</div>';
    else h += '<p class="ir-empty">Pick an antimicrobial.</p>';
    return h;
  }

  function draw(keep) {
    host.innerHTML = '<div class="ir-layout"><div class="ir-list"><input id="bp-oq" type="search" placeholder="Search organisms…" value="' + esc(st.oq) + '" aria-label="Search organisms" autocomplete="off"><div class="ir-items">' + orgList() + '</div></div><div class="ir-detail" aria-live="polite">' + detail() + '</div></div>';
    if (keep) { var el = host.querySelector('#' + keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.pos, keep.pos); } catch (e) {} } }
  }
  function redrawDetail(keep) {
    host.querySelector('.ir-detail').innerHTML = detail();
    if (keep) { var el = host.querySelector('#' + keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.pos, keep.pos); } catch (e) {} } }
  }

  host.addEventListener('click', function (e) {
    var o = e.target.closest('[data-org]'), a = e.target.closest('[data-ab]');
    if (e.target.closest('[data-topical]')) { st.topical = !st.topical; redrawDetail(); return; }
    if (o) {
      st.org = +o.getAttribute('data-org');
      var rows = resolve(D.orgs[st.org]); if (st.ab && !rows[st.ab]) st.ab = null;
      host.querySelectorAll('.ir-item').forEach(function (b) { b.classList.toggle('on', b === o); });
      redrawDetail();
      if (window.innerWidth < 760) host.querySelector('.ir-detail').scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (a) {
      st.ab = a.getAttribute('data-ab'); redrawDetail();
      var inp = host.querySelector('#bp-mic') || host.querySelector('#bp-zone'); if (inp && window.innerWidth >= 760) inp.focus();
    }
  });
  host.addEventListener('input', function (e) {
    var id = e.target.id, keep = { id: id, pos: e.target.selectionStart };
    if (id === 'bp-oq') { st.oq = e.target.value; draw(keep); }
    else if (id === 'bp-aq') { st.aq = e.target.value; redrawDetail(keep); }
    else if (id === 'bp-mic') { st.mic = e.target.value; redrawDetail(keep); }
    else if (id === 'bp-zone') { st.zone = e.target.value; redrawDetail(keep); }
  });
  // Deep link from organism pages: #bp-<slug of organism name>
  (function () {
    var m = /^#bp-(.+)$/.exec(location.hash); if (!m) return;
    var sl = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
    D.orgs.forEach(function (o, i) { if (sl(o.n) === m[1]) st.org = i; });
  })();
  draw();
  window.addEventListener('hashchange', function () {
    var m = /^#bp-(.+)$/.exec(location.hash); if (!m) return;
    var sl = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
    D.orgs.forEach(function (o, i) { if (sl(o.n) === m[1]) { st.org = i; st.ab = null; st.oq = ''; } });
    draw(); host.scrollIntoView({ block: 'start' });
  });
})();
