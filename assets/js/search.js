(function () {
  var q = document.getElementById('q');
  var count = document.getElementById('count');
  var empty = document.getElementById('empty');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var cats = Array.prototype.slice.call(document.querySelectorAll('.cat'));

  function filter() {
    var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    items.forEach(function (li) {
      var hay = li.getAttribute('data-search');
      var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; });
      li.hidden = !ok;
      if (ok) shown++;
    });
    cats.forEach(function (c) {
      c.hidden = !c.querySelector('li:not([hidden])');
    });
    count.textContent = terms.length ? shown + ' match' + (shown === 1 ? '' : 'es') : '';
    empty.hidden = shown !== 0;
  }

  q.addEventListener('input', filter);

  // Enter opens the first visible link
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = document.querySelector('[data-search]:not([hidden]) a');
      if (first) first.click();
    }
    if (e.key === 'Escape') { q.value = ''; filter(); }
  });

  // "/" focuses the search box from anywhere
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  });
})();
