(function () {
  // Filter box for a list of cards. Used on the Links page (#q) and the Topics page (#tp-q).
  function setup(qId, countId, emptyId, scopeSel) {
    var q = document.getElementById(qId);
    if (!q) return;
    var scope = document.querySelector(scopeSel) || document;
    var count = document.getElementById(countId);
    var empty = document.getElementById(emptyId);
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    var cats = Array.prototype.slice.call(scope.querySelectorAll('.cat'));

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
      if (count) count.textContent = terms.length ? shown + ' match' + (shown === 1 ? '' : 'es') : '';
      if (empty) empty.hidden = shown !== 0;
    }

    q.addEventListener('input', filter);

    // Enter opens the first visible link
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = scope.querySelector('[data-search]:not([hidden]) a');
        if (first) first.click();
      }
      if (e.key === 'Escape') { q.value = ''; filter(); }
    });
  }
  setup('q', 'count', 'empty', '.grid.links-grid');
  setup('tp-q', 'tp-count', 'tp-empty', '.grid.topics');
})();
