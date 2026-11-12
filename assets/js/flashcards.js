/* CICE revision flashcards: curated decks (cards-data.js) plus decks generated from the site's own data. Progress is kept in this browser only. */
(function () {
  var host = document.getElementById('fc');
  if (!host || !window.CARD_DECKS) return;
  var decks = window.CARD_DECKS.slice();
  var IR = window.IR_DATA, ORG = window.ORG_DATA, ABX = window.ABX_DATA;
  if (IR) decks.push({ id: 'gen-ir', name: 'Intrinsic resistance (generated)', gen: true, cards: [].concat.apply([], IR.groups.map(function (g) { return g[1].filter(function (o) { return o[1].length; }).map(function (o) { return ['Which antibiotics is ' + o[0] + ' intrinsically resistant to (EUCAST)?', o[1].join(', ') + (IR.notes && IR.notes[o[0]] ? '. ' + IR.notes[o[0]] : '')]; }); })) });
  if (ORG) decks.push({ id: 'gen-org', name: 'Organisms: first-line treatment (generated)', gen: true, cards: ORG.orgs.map(function (o) { return ['First-line treatment for ' + o.n + '?', o.tx + (o.alt ? ' ' + o.alt : '')]; }) });
  if (ABX) decks.push({ id: 'gen-abx', name: 'Antibiotic PK/PD and AWaRe (generated)', gen: true, cards: ABX.drugs.map(function (d) { return [d.name + ': UK-AWaRe category, PK/PD index and target?', (d.aware === 'Not listed' ? 'Not in UK-AWaRe' : d.aware) + '. ' + d.pkpd.idx + ': ' + d.pkpd.target + '. Half-life ' + d.pk.t12 + '.']; }) });

  var KEY = 'mc-cards-known', known = {};
  try { known = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { known = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(known)); } catch (e) {} }
  function cid(d, i) { return d.id + ':' + i; }
  var st = { sel: ['bact'], order: [], pos: 0, flipped: false, unknownOnly: false };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pool() {
    var out = [];
    decks.forEach(function (d) { if (st.sel.indexOf(d.id) !== -1) d.cards.forEach(function (c, i) { if (!st.unknownOnly || !known[cid(d, i)]) out.push({ d: d, i: i, c: c }); }); });
    return out;
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rebuild(doShuffle) { st.order = pool(); if (doShuffle) shuffle(st.order); st.pos = 0; st.flipped = false; }
  function deckStats(d) { var k = 0; d.cards.forEach(function (_, i) { if (known[cid(d, i)]) k++; }); return k; }
  function draw() {
    var h = '<div class="fc-decks"><p class="ir-grp">Curated decks</p><div class="cov-chips">';
    decks.forEach(function (d, n) {
      if (d.gen && !decks[n - 1].gen) h += '</div><p class="ir-grp">Generated from the site’s data</p><div class="cov-chips">';
      var on = st.sel.indexOf(d.id) !== -1;
      h += '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" data-deck="' + d.id + '" aria-pressed="' + on + '">' + esc(d.name) + ' <span class="fc-count">' + deckStats(d) + '/' + d.cards.length + '</span></button>';
    });
    h += '</div><div class="cov-chips fc-opts"><button type="button" class="sp-chip" data-all>All decks</button><button type="button" class="sp-chip" data-shuffle>Shuffle</button><button type="button" class="sp-chip' + (st.unknownOnly ? ' on' : '') + '" data-unknown aria-pressed="' + st.unknownOnly + '">Not yet known only</button><button type="button" class="sp-chip" data-reset>Reset progress</button></div></div>';
    if (!st.order.length) { host.innerHTML = h + '<p class="ir-empty">' + (st.sel.length ? 'All cards in these decks are marked as known. Turn off “Not yet known only” or reset progress.' : 'Choose a deck.') + '</p>'; return; }
    var cur = st.order[st.pos], k = known[cid(cur.d, cur.i)];
    h += '<div class="fc-meta"><span>' + (st.pos + 1) + ' of ' + st.order.length + '</span><span>' + esc(cur.d.name) + (k ? ' · <b class="fc-known">known</b>' : '') + '</span></div>';
    h += '<button type="button" class="fc-card' + (st.flipped ? ' flipped' : '') + '" data-flip aria-label="' + (st.flipped ? 'Answer shown. Tap to show question' : 'Tap to show answer') + '">' +
      '<span class="fc-side fc-q"><span class="fc-lab">Question</span>' + esc(cur.c[0]) + '</span>' +
      (st.flipped ? '<span class="fc-side fc-a"><span class="fc-lab">Answer</span>' + esc(cur.c[1]) + '</span>' : '<span class="fc-hint">Tap or press Space to reveal</span>') + '</button>';
    h += '<div class="fc-nav"><button type="button" class="sp-chip" data-prev>← Previous</button>' +
      (st.flipped ? '<button type="button" class="sp-chip fc-again" data-mark="0">Again</button><button type="button" class="sp-chip fc-got" data-mark="1">Got it</button>' : '<button type="button" class="sp-chip on" data-flip>Show answer</button>') +
      '<button type="button" class="sp-chip" data-next>Next →</button></div>';
    host.innerHTML = h;
  }
  function focusCard() { var c = host.querySelector('.fc-card'); if (c) c.focus(); }
  function move(n) { if (!st.order.length) return; st.pos = (st.pos + n + st.order.length) % st.order.length; st.flipped = false; draw(); focusCard(); }
  host.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-deck')) { var id = t.getAttribute('data-deck'), i = st.sel.indexOf(id); if (i === -1) st.sel.push(id); else st.sel.splice(i, 1); rebuild(false); draw(); }
    else if (t.hasAttribute('data-all')) { st.sel = st.sel.length === decks.length ? [] : decks.map(function (d) { return d.id; }); rebuild(true); draw(); }
    else if (t.hasAttribute('data-shuffle')) { rebuild(true); draw(); }
    else if (t.hasAttribute('data-unknown')) { st.unknownOnly = !st.unknownOnly; rebuild(false); draw(); }
    else if (t.hasAttribute('data-reset')) { decks.forEach(function (d) { if (st.sel.indexOf(d.id) !== -1) d.cards.forEach(function (_, i) { delete known[cid(d, i)]; }); }); save(); rebuild(false); draw(); }
    else if (t.hasAttribute('data-flip')) { st.flipped = !st.flipped; draw(); var c = host.querySelector('.fc-card'); if (c) c.focus(); }
    else if (t.hasAttribute('data-prev')) move(-1);
    else if (t.hasAttribute('data-next')) move(1);
    else if (t.hasAttribute('data-mark')) {
      var cur = st.order[st.pos], key = cid(cur.d, cur.i);
      if (t.getAttribute('data-mark') === '1') known[key] = 1; else delete known[key];
      save();
      if (st.unknownOnly && known[key]) { st.order.splice(st.pos, 1); if (st.pos >= st.order.length) st.pos = 0; st.flipped = false; draw(); focusCard(); } else move(1);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (/input|textarea/i.test((e.target.tagName || ''))) return;
    if (!host.offsetParent || !host.contains(document.activeElement)) return; // only when the flashcards have focus and are visible
    if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
  });
  rebuild(false); draw();
})();
