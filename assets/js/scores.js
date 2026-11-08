/*
 * Score definitions. To add a points-based score, copy the CURB-65 block.
 *
 * items:
 *   { label, pts }                         → selectable box worth pts
 *   { label, options: [[text, pts], ...] } → a row of selectable boxes, one per option
 *   { heading: 'text' }                    → small subheading inside the card
 *   { label, group: 'major' }              → selectable box counted by group (used by Duke)
 *
 * Points scores use `bands`: the first band with total <= max is shown.
 * Classification tools (like Duke) use `evaluate(counts)` instead, returning
 * { badge, text, level }. level: "low" | "mid" | "high" sets the colour.
 */
var SCORES = [
  {
    id: 'curb65',
    name: 'CURB-65',
    use: 'Severity of community-acquired pneumonia',
    items: [
      { label: 'Confusion (new disorientation in person, place or time)', pts: 1 },
      { label: 'Urea > 7 mmol/L', pts: 1 },
      { label: 'Respiratory rate ≥ 30/min', pts: 1 },
      { label: 'SBP < 90 or DBP ≤ 60 mmHg', pts: 1 },
      { label: 'Age ≥ 65', pts: 1 }
    ],
    bands: [
      { max: 1, level: 'low', text: 'Low severity — consider home-based care' },
      { max: 2, level: 'mid', text: 'Moderate severity — consider hospital-based care' },
      { max: 5, level: 'high', text: 'High severity — manage as severe CAP; consider critical care review if 4–5' }
    ],
    ref: 'Lim WS et al. Thorax 2003; BTS & NICE pneumonia guidance'
  },
  {
    id: 'qsofa',
    name: 'qSOFA',
    use: 'Risk of poor outcome in suspected infection (outside ICU)',
    items: [
      { label: 'Respiratory rate ≥ 22/min', pts: 1 },
      { label: 'Altered mentation (GCS < 15)', pts: 1 },
      { label: 'Systolic BP ≤ 100 mmHg', pts: 1 }
    ],
    bands: [
      { max: 1, level: 'low', text: 'Not positive — does not exclude sepsis; reassess' },
      { max: 3, level: 'high', text: 'Positive (≥ 2) — higher risk of poor outcome; assess for organ dysfunction' }
    ],
    ref: 'Seymour CW et al. JAMA 2016 (Sepsis-3)'
  },
  {
    id: 'lrinec',
    name: 'LRINEC',
    use: 'Laboratory risk indicator for necrotising fasciitis',
    items: [
      { label: 'CRP (mg/L)', options: [['< 150', 0], ['≥ 150', 4]] },
      { label: 'White cell count (× 10⁹/L)', options: [['< 15', 0], ['15–25', 1], ['> 25', 2]] },
      { label: 'Haemoglobin (g/L)', options: [['> 135', 0], ['110–135', 1], ['< 110', 2]] },
      { label: 'Sodium (mmol/L)', options: [['≥ 135', 0], ['< 135', 2]] },
      { label: 'Creatinine (µmol/L)', options: [['≤ 141', 0], ['> 141', 2]] },
      { label: 'Glucose (mmol/L)', options: [['≤ 10', 0], ['> 10', 1]] }
    ],
    bands: [
      { max: 5, level: 'low', text: '≤ 5: low risk — but a low score does NOT exclude necrotising fasciitis' },
      { max: 7, level: 'mid', text: '6–7: intermediate risk' },
      { max: 13, level: 'high', text: '≥ 8: high risk — urgent surgical review' }
    ],
    note: 'Sensitivity is poor. Clinical suspicion should prompt surgical exploration regardless of score.',
    ref: 'Wong CH et al. Crit Care Med 2004'
  },
  {
    id: 'duke',
    name: 'Modified Duke criteria',
    wide: true,
    use: 'Diagnosis of infective endocarditis',
    items: [
      { heading: 'Pathological criteria' },
      { label: 'Microorganisms on culture or histology of a vegetation, embolised vegetation or intracardiac abscess', group: 'path' },
      { label: 'Vegetation or intracardiac abscess confirmed by histology showing active endocarditis', group: 'path' },
      { heading: 'Major criteria' },
      { label: 'Typical organism in 2 separate blood cultures (viridans strep, S. gallolyticus, HACEK, S. aureus, or community-acquired enterococci without a primary focus)', group: 'major', key: 'bc' },
      { label: 'Persistently positive blood cultures (≥ 2 drawn > 12 h apart, or all 3 / most of ≥ 4 with first and last ≥ 1 h apart)', group: 'major', key: 'bc' },
      { label: 'Single positive blood culture for Coxiella burnetii, or phase I IgG titre > 1:800', group: 'major', key: 'bc' },
      { label: 'Echo evidence: vegetation, abscess, or new partial dehiscence of a prosthetic valve', group: 'major', key: 'endo' },
      { label: 'New valvular regurgitation', group: 'major', key: 'endo' },
      { heading: 'Minor criteria' },
      { label: 'Predisposition: predisposing heart condition or injection drug use', group: 'minor' },
      { label: 'Fever ≥ 38.0 °C', group: 'minor' },
      { label: 'Vascular phenomena: major arterial emboli, septic pulmonary infarcts, mycotic aneurysm, intracranial haemorrhage, conjunctival haemorrhages, Janeway lesions', group: 'minor' },
      { label: 'Immunological phenomena: glomerulonephritis, Osler nodes, Roth spots, rheumatoid factor', group: 'minor' },
      { label: 'Microbiology: positive blood culture not meeting a major criterion, or serology of active infection with an organism consistent with IE', group: 'minor' }
    ],
    evaluate: function (c) {
      var summary = c.major + ' major · ' + c.minor + ' minor';
      if (c.path > 0) return { badge: 'Definite', level: 'high', text: 'Definite IE (pathological criteria met)' };
      if (c.major >= 2 || (c.major === 1 && c.minor >= 3) || c.minor >= 5)
        return { badge: 'Definite', level: 'high', text: 'Definite IE — ' + summary };
      if ((c.major === 1 && c.minor >= 1) || c.minor >= 3)
        return { badge: 'Possible', level: 'mid', text: 'Possible IE — ' + summary };
      return { badge: 'Not met', level: 'low', text: 'Criteria for possible IE not met — ' + summary };
    },
    note: 'IE is only "rejected" with a firm alternative diagnosis, resolution with ≤ 4 days of antibiotics, or no IE at surgery/autopsy after ≤ 4 days of antibiotics. Blood culture major criteria count once in total; echo/regurgitation major criteria count once in total. Single positive cultures for coagulase-negative staphylococci and organisms that do not cause IE are excluded from the minor microbiology criterion.',
    ref: 'Li JS et al. Clin Infect Dis 2000. See also the 2023 Duke-ISCVID criteria (Fowler VG et al. Clin Infect Dis 2023)'
  }
];

(function () {
  var host = document.getElementById('scores');
  var nav = document.getElementById('score-nav');

  SCORES.forEach(function (s) {
    var card = document.createElement('section');
    card.className = 'card score' + (s.wide ? ' wide' : '');
    card.id = s.id;

    var html = '<h2>' + s.name + '</h2><p class="use">' + s.use + '</p><form>';
    var opened = false;
    s.items.forEach(function (it, i) {
      var fid = s.id + '-' + i;
      if (it.heading) {
        html += (opened ? '</div>' : '') + '<div class="group"><p class="subhead">' + it.heading + '</p>';
        opened = true;
      } else if (it.options) {
        // One tappable box per option (radio group); the first is selected by default
        html += '<fieldset class="row choice"><legend>' + it.label + '</legend><div class="opts">';
        it.options.forEach(function (o, j) {
          html += '<label class="opt" for="' + fid + '-' + j + '"><input type="radio" name="' + fid + '" id="' + fid + '-' + j +
                  '" value="' + o[1] + '"' + (j === 0 ? ' checked' : '') + '><span class="opt-text">' + o[0] +
                  '</span><span class="opt-pts">+' + o[1] + '</span></label>';
        });
        html += '</div></fieldset>';
      } else {
        // Yes/no criterion: the whole criterion is one selectable box
        var attrs = it.group
          ? ' data-group="' + it.group + '"' + (it.key ? ' data-key="' + it.key + '"' : '')
          : ' value="' + it.pts + '"';
        html += '<label class="opt toggle" for="' + fid + '"><input type="checkbox" id="' + fid + '"' + attrs + '>' +
                '<span class="tick" aria-hidden="true"></span><span class="opt-text">' + it.label + '</span>' +
                (it.group ? '' : '<span class="opt-pts">+' + it.pts + '</span>') + '</label>';
      }
    });
    html += (opened ? '</div>' : '') + '</form><div class="result" aria-live="polite"><span class="total">0</span><span class="interp"></span></div>' +
            (s.note ? '<p class="note">' + s.note + '</p>' : '') +
            '<div class="foot"><button type="button" class="reset">Reset</button><small>' + s.ref + '</small></div>';
    card.innerHTML = html;
    host.appendChild(card);

    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.textContent = s.name;
    nav.appendChild(a);

    var form = card.querySelector('form');
    var result = card.querySelector('.result');
    var totalEl = result.querySelector('.total');

    function update() {
      var out;
      if (s.evaluate) {
        // Count by group; boxes sharing a key count once (e.g. both blood-culture majors = 1 major)
        var counts = { path: 0, major: 0, minor: 0 }, seen = {};
        form.querySelectorAll('input[data-group]:checked').forEach(function (el) {
          var g = el.getAttribute('data-group'), k = el.getAttribute('data-key');
          if (k) { if (seen[k]) return; seen[k] = true; }
          counts[g]++;
        });
        out = s.evaluate(counts);
        totalEl.textContent = out.badge;
        totalEl.classList.add('word');
      } else {
        var total = 0;
        form.querySelectorAll('input:checked').forEach(function (el) { total += Number(el.value); });
        var band = s.bands.find(function (b) { return total <= b.max; }) || s.bands[s.bands.length - 1];
        out = { text: band.text, level: band.level };
        totalEl.textContent = total;
      }
      result.querySelector('.interp').textContent = out.text;
      result.setAttribute('data-level', out.level);
    }
    form.addEventListener('change', update);
    card.querySelector('.reset').addEventListener('click', function () { form.reset(); update(); });
    update();
  });
})();
