/* IV-to-oral switch checklist based on the UKHSA national IVOS criteria (2024). */
(function () {
  var host = document.getElementById('ivos');
  if (!host) return;
  var SEC = [
    ['Timing', [['t48', 'IV antimicrobial reviewed at 48 hours (and daily after that)']]],
    ['Clinical', [['clin', 'Signs and symptoms of infection are improving']]],
    ['Observations and markers', [['temp', 'Temperature 36–38 °C for the past 24 hours'], ['ews', 'Early warning score decreasing'], ['wcc', 'White cell count trending towards normal', 1], ['crp', 'CRP decreasing', 1]]],
    ['Enteral route', [['gut', 'Gut working, no malabsorption'], ['swal', 'Can swallow safely, or has an enteral tube'], ['opt', 'A suitable oral option exists (bioavailability, interactions, allergies)'], ['adh', 'No concerns about adherence'], ['vom', 'No vomiting in the past 24 hours']]]
  ];
  var SPECIAL = ['Bloodstream infection', 'Endocarditis', 'Meningitis or other CNS infection', 'Osteomyelitis or septic arthritis', 'Empyema', 'Undrained abscess', 'Severe or necrotising soft tissue infection', 'Neutropenic sepsis or other critical infection'];
  var st = {}, sp = {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function verdict() {
    var all = [], markers = [];
    SEC.forEach(function (s) { s[1].forEach(function (c) { (c[2] ? markers : all).push(c[0]); }); });
    var core = all.every(function (k) { return st[k]; }), mk = markers.every(function (k) { return st[k]; });
    var special = SPECIAL.filter(function (_, i) { return sp[i]; });
    var ticked = Object.keys(st).filter(function (k) { return st[k]; }).length;
    if (!ticked && !special.length) return '<p class="ir-empty">Tick each criterion that applies.</p>';
    var h = '';
    if (core && mk) h = '<div class="bp-explain ivos-ok"><p><b>Meets the criteria: switch to oral now</b> unless a special consideration below applies.</p></div>';
    else if (core) h = '<div class="bp-explain ivos-mid"><p><b>Consider switching.</b> Only the blood markers are not met; WCC and CRP can lag or reflect inflammation or steroids.</p></div>';
    else h = '<div class="bp-explain ivos-no"><p><b>Not yet.</b> Continue IV and review daily. Still to meet: ' + esc(SEC.reduce(function (a, s) { return a.concat(s[1].filter(function (c) { return !c[2] && !st[c[0]]; }).map(function (c) { return c[1].toLowerCase(); })); }, []).join('; ')) + '.</p></div>';
    if (special.length) h += '<div class="ir-flag low"><b>Special consideration: ' + esc(special.join(', ')) + '</b> These may need prolonged IV therapy or high tissue levels: discuss with infection specialists. Early oral treatment is supported for selected patients in bone and joint infection (OVIVA), left-sided endocarditis (POET) and Gram-negative bacteraemia once stable.</div>';
    return h;
  }
  function draw() {
    var h = '<div class="cov-layout">';
    h += '<section class="card af-card"><h2>Criteria</h2>';
    SEC.forEach(function (s) {
      h += '<p class="ir-grp">' + esc(s[0]) + '</p><div class="ivos-list">';
      s[1].forEach(function (c) { h += '<button type="button" class="opt ivos-opt' + (st[c[0]] ? ' on' : '') + '" data-k="' + c[0] + '" aria-pressed="' + !!st[c[0]] + '"><span class="opt-text">' + esc(c[1]) + (c[2] ? ' <span class="ab-route">(marker)</span>' : '') + '</span></button>'; });
      h += '</div>';
    });
    h += '</section><section class="card af-card"><h2>Special considerations</h2><p class="ab-note" style="margin-top:0">Tick any that apply.</p><div class="ivos-list">';
    SPECIAL.forEach(function (s, i) { h += '<button type="button" class="opt ivos-opt' + (sp[i] ? ' on' : '') + '" data-s="' + i + '" aria-pressed="' + !!sp[i] + '"><span class="opt-text">' + esc(s) + '</span></button>'; });
    h += '</div><h2 style="margin-top:18px">Result</h2><div aria-live="polite">' + verdict() + '</div></section></div>';
    host.innerHTML = h;
  }
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-k],[data-s]'); if (!b) return;
    var y = window.scrollY;
    if (b.hasAttribute('data-k')) st[b.getAttribute('data-k')] = !st[b.getAttribute('data-k')];
    else sp[b.getAttribute('data-s')] = !sp[b.getAttribute('data-s')];
    var sel = b.hasAttribute('data-k') ? '[data-k="' + b.getAttribute('data-k') + '"]' : '[data-s="' + b.getAttribute('data-s') + '"]';
    draw(); window.scrollTo(0, y); var again = host.querySelector(sel); if (again) again.focus({ preventScroll: true });
  });
  draw();
})();
