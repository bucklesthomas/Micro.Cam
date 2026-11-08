/*
 * Score definitions. To add a score, copy one of the blocks below.
 * items: { label, pts } renders a checkbox;
 *        { label, options: [[text, pts], ...] } renders a dropdown.
 * bands: checked in order; the first with total <= max is shown.
 *        level: "low" | "mid" | "high" sets the colour.
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
    id: 'pitt',
    name: 'Pitt bacteraemia score',
    use: 'Severity of illness in bloodstream infection',
    items: [
      { label: 'Temperature', options: [['36.1–38.9 °C', 0], ['35.1–36.0 or 39.0–39.9 °C', 1], ['≤ 35.0 or ≥ 40.0 °C', 2]] },
      { label: 'Hypotension (SBP < 90, acute drop SBP > 30 / DBP > 20, or vasopressors)', pts: 2 },
      { label: 'Mechanical ventilation', pts: 2 },
      { label: 'Cardiac arrest', pts: 4 },
      { label: 'Mental status', options: [['Alert', 0], ['Disoriented', 1], ['Stuporous', 2], ['Comatose', 4]] }
    ],
    bands: [
      { max: 3, level: 'low', text: 'Score < 4 — lower predicted mortality' },
      { max: 99, level: 'high', text: 'Score ≥ 4 — critically ill; associated with higher mortality' }
    ],
    ref: 'Use worst values around the time of the first positive culture. Paterson DL et al. Ann Intern Med 2004'
  },
  {
    id: 'alt70',
    name: 'ALT-70',
    use: 'Cellulitis vs pseudocellulitis of the lower limb',
    items: [
      { label: 'Asymmetry (unilateral leg involvement)', pts: 3 },
      { label: 'Leukocytosis (WCC ≥ 10 × 10⁹/L)', pts: 1 },
      { label: 'Tachycardia (HR ≥ 90)', pts: 1 },
      { label: 'Age ≥ 70', pts: 2 }
    ],
    bands: [
      { max: 2, level: 'low', text: '0–2: cellulitis unlikely — consider alternative diagnosis' },
      { max: 4, level: 'mid', text: '3–4: indeterminate — clinical review advised' },
      { max: 7, level: 'high', text: '5–7: cellulitis likely' }
    ],
    ref: 'Raff AB et al. J Am Acad Dermatol 2017'
  },
  {
    id: 'feverpain',
    name: 'FeverPAIN',
    use: 'Streptococcal sore throat (NICE NG84)',
    items: [
      { label: 'Fever in past 24 hours', pts: 1 },
      { label: 'Purulence (pharyngeal / tonsillar exudate)', pts: 1 },
      { label: 'Attended rapidly (≤ 3 days of symptoms)', pts: 1 },
      { label: 'Inflamed tonsils (severely)', pts: 1 },
      { label: 'No cough or coryza', pts: 1 }
    ],
    bands: [
      { max: 1, level: 'low', text: '0–1: no antibiotic' },
      { max: 3, level: 'mid', text: '2–3: consider no antibiotic or back-up prescription' },
      { max: 5, level: 'high', text: '4–5: consider immediate or back-up antibiotic' }
    ],
    ref: 'Little P et al. BMJ 2013; NICE NG84'
  },
  {
    id: 'centor',
    name: 'Centor',
    use: 'Streptococcal sore throat (NICE NG84)',
    items: [
      { label: 'Tonsillar exudate', pts: 1 },
      { label: 'Tender anterior cervical lymphadenopathy / lymphadenitis', pts: 1 },
      { label: 'History of fever (> 38 °C)', pts: 1 },
      { label: 'Absence of cough', pts: 1 }
    ],
    bands: [
      { max: 2, level: 'low', text: '0–2: no antibiotic' },
      { max: 4, level: 'high', text: '3–4: consider immediate or back-up antibiotic' }
    ],
    ref: 'Centor RM et al. Med Decis Making 1981; NICE NG84'
  }
];

(function () {
  var host = document.getElementById('scores');
  var nav = document.getElementById('score-nav');

  SCORES.forEach(function (s) {
    var card = document.createElement('section');
    card.className = 'card score';
    card.id = s.id;

    var html = '<h2>' + s.name + '</h2><p class="use">' + s.use + '</p><form>';
    s.items.forEach(function (it, i) {
      var fid = s.id + '-' + i;
      if (it.options) {
        html += '<label class="row sel" for="' + fid + '"><span>' + it.label + '</span><select id="' + fid + '">';
        it.options.forEach(function (o) { html += '<option value="' + o[1] + '">' + o[0] + ' (+' + o[1] + ')</option>'; });
        html += '</select></label>';
      } else {
        html += '<label class="row" for="' + fid + '"><input type="checkbox" id="' + fid + '" value="' + it.pts + '">' +
                '<span>' + it.label + '</span><b>+' + it.pts + '</b></label>';
      }
    });
    html += '</form><div class="result" aria-live="polite"><span class="total">0</span><span class="interp"></span></div>' +
            '<div class="foot"><button type="button" class="reset">Reset</button><small>' + s.ref + '</small></div>';
    card.innerHTML = html;
    host.appendChild(card);

    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.textContent = s.name;
    nav.appendChild(a);

    var form = card.querySelector('form');
    var result = card.querySelector('.result');
    function update() {
      var total = 0;
      form.querySelectorAll('input:checked, select').forEach(function (el) { total += Number(el.value); });
      var band = s.bands.find(function (b) { return total <= b.max; }) || s.bands[s.bands.length - 1];
      result.querySelector('.total').textContent = total;
      result.querySelector('.interp').textContent = band.text;
      result.setAttribute('data-level', band.level);
    }
    form.addEventListener('change', update);
    card.querySelector('.reset').addEventListener('click', function () { form.reset(); update(); });
    update();
  });
})();
