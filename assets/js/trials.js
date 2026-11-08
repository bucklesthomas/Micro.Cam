(function () {
  var q = document.getElementById('tq');
  if (!q) return;
  var count = document.getElementById('tcount');
  var empty = document.getElementById('tempty');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.trial'));
  var topics = Array.prototype.slice.call(document.querySelectorAll('.topic'));

  function filter() {
    var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var hay = c.getAttribute('data-search');
      var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    topics.forEach(function (s) { s.hidden = !s.querySelector('.trial:not([hidden])'); });
    count.textContent = terms.length ? shown + ' trial' + (shown === 1 ? '' : 's') : '';
    empty.hidden = shown !== 0;
  }

  q.addEventListener('input', filter);
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; filter(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  });
})();
