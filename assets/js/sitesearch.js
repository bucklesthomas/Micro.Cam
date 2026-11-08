/* Site-wide search: links, scores and trials, from search.json (or window.MC_INDEX if a page provides it). */
(function () {
  var input = document.getElementById('ss');
  var box = document.getElementById('ss-results');
  if (!input || !box) return;

  var me = document.currentScript;
  var src = me && me.getAttribute('data-index');
  var base = ((me && me.getAttribute('data-base')) || '/').replace(/\/$/, '');
  var index = window.MC_INDEX || null;
  var loading = null;
  var results = [];
  var active = -1;
  var LABEL = { link: 'Link', score: 'Score', trial: 'Trial' };

  function load() {
    if (index) return Promise.resolve();
    if (!loading) {
      loading = fetch(src).then(function (r) { return r.json(); })
        .then(function (d) { index = d; })
        .catch(function () { index = []; });
    }
    return loading;
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function href(u) { return /^(https?:|#)/.test(u) ? u : base + u; }
  function mark(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function search(q) {
    var terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length || !index) return { terms: terms, list: [] };
    var list = [];
    index.forEach(function (it) {
      var title = it.title.toLowerCase();
      var sub = (it.sub || '').toLowerCase();
      var hay = title + ' ' + sub + ' ' + (it.k || '').toLowerCase();
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (hay.indexOf(t) === -1) return;
        score += title.indexOf(t) === 0 ? 8 : title.indexOf(t) !== -1 ? 5 : sub.indexOf(t) !== -1 ? 2 : 1;
      }
      if (it.t === 'score') score += 1;
      list.push({ it: it, s: score });
    });
    list.sort(function (a, b) { return b.s - a.s || a.it.title.localeCompare(b.it.title); });
    return { terms: terms, list: list.slice(0, 12).map(function (x) { return x.it; }) };
  }

  function render() {
    var r = search(input.value);
    results = r.list;
    active = results.length ? 0 : -1;
    if (!input.value.trim()) { close(); return; }
    if (!results.length) {
      box.innerHTML = '<p class="ss-none">No results for “' + esc(input.value.trim()) + '”</p>';
    } else {
      box.innerHTML = results.map(function (it, i) {
        return '<a class="ss-item" role="option" id="ss-opt-' + i + '" href="' + esc(href(it.url)) + '"' +
          (it.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
          '<span class="ss-type ' + it.t + '">' + LABEL[it.t] + '</span>' +
          '<span class="ss-main"><b>' + mark(it.title, r.terms) + (it.ext ? ' <span class="ext" aria-hidden="true">↗</span>' : '') +
          '</b><small>' + esc(it.sub) + '</small></span></a>';
      }).join('');
    }
    box.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    highlight();
  }

  function highlight() {
    var items = box.querySelectorAll('.ss-item');
    items.forEach(function (el, i) { el.classList.toggle('active', i === active); });
    if (items[active]) {
      input.setAttribute('aria-activedescendant', items[active].id);
      items[active].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function close() {
    box.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  input.addEventListener('focus', function () { load().then(function () { if (input.value.trim()) render(); }); });
  input.addEventListener('input', function () { load().then(render); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); active = (active + 1) % results.length; highlight(); }
    else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); active = (active - 1 + results.length) % results.length; highlight(); }
    else if (e.key === 'Enter') {
      var el = box.querySelectorAll('.ss-item')[active];
      if (el) { e.preventDefault(); el.click(); close(); input.blur(); }
    } else if (e.key === 'Escape') {
      if (input.value) { input.value = ''; close(); } else { input.blur(); }
    }
  });
  box.addEventListener('click', function (e) {
    if (e.target.closest('.ss-item')) { close(); input.value = ''; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-search')) close();
  });

  // "/" jumps to the search box from anywhere
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); input.focus(); }
  });
})();
