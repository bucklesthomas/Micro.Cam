/* Fungal biomarker interpretation.
   Sources: EORTC/MSGERC 2020 definitions (Donnelly JP et al. Clin Infect Dis 2020); Platelia Aspergillus Ag and Fungitell user guidance
   as summarised by the Manchester (MFT) Mycology Reference Centre; ESCMID-ECMM-ERS Aspergillus guideline 2017; ECIL-5 Pneumocystis (2016);
   ECIL-6 (2017); ECMM/ISHAM/ASM cryptococcosis 2024; ISHAM ABPA working group 2024. */
(function () {
  var host = document.getElementById('fm');
  if (!host) return;
  var M = [
    { id: 'gm', name: 'Galactomannan', short: 'GM',
      what: 'Aspergillus cell wall antigen (Platelia Aspergillus Ag ELISA), reported as an optical density index.',
      spec: 'Serum (clotted blood) or BAL fluid. Test serum promptly (accuracy falls if over 2 days old).',
      calc: { label: 'Index', samples: [['serum', 'Serum'], ['bal', 'BAL']] },
      pos: 'Serum: index > 0.5 positive (≥ 1.0 for EORTC/MSGERC probable IPA, or ≥ 0.7 with BAL ≥ 0.8). BAL: > 1.0 positive; 0.5–1.0 weakly positive (resample).',
      use: ['Screening 2–3 times a week in high-risk haematology patients not on mould-active prophylaxis (ECIL), with CT if positive.', 'Diagnosis: serum in neutropenic patients; BAL in non-neutropenic, ICU and solid organ transplant patients (serum sensitivity is very low when not neutropenic).', 'A falling serum index on treatment suggests response; a persistently raised index predicts poor outcome.'],
      fp: ['Cross-reacting moulds: Fusarium, Penicillium, Talaromyces, Alternaria, Paecilomyces, Geotrichum and Histoplasma (think histoplasmosis after travel).', 'Dietary galactomannan with a damaged gut (mucositis, neonates), some enteral products and fungal-derived digestive enzymes.', 'Delayed or contaminated samples. Piperacillin–tazobactam is no longer a significant cause.'],
      fn: ['Mould-active prophylaxis or treatment (posaconazole, voriconazole, isavuconazole) lowers sensitivity.', 'Non-neutropenic patients (antigen is cleared by neutrophils): use BAL.', 'Chronic granulomatous disease and hyper-IgE syndrome; Mucorales and most non-Aspergillus moulds are not detected.'] },
    { id: 'bdg', name: 'Beta-D-glucan', short: 'BDG',
      what: '(1→3)-β-D-glucan, a cell wall component of most fungi (Fungitell assay).',
      spec: 'Serum (clotted blood; not EDTA). Collect carefully: contamination is easy.',
      calc: { label: 'pg/ml', samples: [['serum', 'Serum']] },
      pos: 'Fungitell: < 60 pg/ml negative; 60–79 indeterminate (repeat); ≥ 80 positive. Very high values are typical of Pneumocystis and invasive candidiasis.',
      use: ['Best for ruling out: a negative result has a high negative predictive value for invasive candidiasis, Pneumocystis and many moulds.', 'Positives need repeating and correlation: two consecutive positives are more specific than one.', 'Pan-fungal: it does not say which fungus. Not a mycological criterion for moulds in EORTC/MSGERC 2020.'],
      fp: ['IV albumin, immunoglobulin and other blood products; haemodialysis with cellulose membranes; glucan-containing surgical gauze (3–4 days to clear).', 'Gut translocation (mucositis, ischaemia, burns, sepsis), bacteraemia (e.g. Pseudomonas), invasive nocardiosis, impaired liver function, contaminated parenteral nutrition.'],
      fn: ['Mucorales (no glucan), Cryptococcus (very little), yeast-phase Blastomyces.', 'Localised or encapsulated infection with little glucan release.'] },
    { id: 'pcr', name: 'Aspergillus PCR', short: 'PCR',
      what: 'Aspergillus DNA by real-time PCR; some assays also detect azole-resistance mutations (TR34/L98H, TR46).',
      spec: 'Serum, plasma, whole blood or BAL.',
      pos: 'EORTC/MSGERC 2020 mycological criterion: ≥ 2 consecutive positive blood PCRs, ≥ 2 duplicate positive BAL PCRs, or ≥ 1 blood plus ≥ 1 BAL positive.',
      use: ['Combine with galactomannan: both negative make invasive aspergillosis very unlikely.', 'Resistance mutation detection helps when culture is negative.'],
      fp: ['Environmental or airway colonisation, especially single BAL positives at high cycle threshold (Ct).'],
      fn: ['Mould-active antifungals reduce sensitivity.', 'Single negative samples do not exclude disease.'] },
    { id: 'lfa', name: 'Aspergillus lateral flow', short: 'LFA',
      what: 'Point-of-care lateral flow tests for Aspergillus antigen (e.g. galactomannan LFA, IMMY sona) on BAL or serum.',
      spec: 'BAL fluid mainly; serum in some assays.',
      pos: 'Positive or negative by visual or reader result; follow the assay’s validated cut-off.',
      use: ['Rapid result (under 1 hour) on BAL while awaiting galactomannan ELISA and PCR.', 'Performs best on BAL in haematology and ICU patients.'],
      fp: ['Same cross-reactions as galactomannan.'],
      fn: ['Mould-active prophylaxis; lower sensitivity in serum than BAL.'] },
    { id: 'crag', name: 'Cryptococcal antigen', short: 'CrAg',
      what: 'Cryptococcal capsular polysaccharide (lateral flow assay), qualitative and titre.',
      spec: 'Serum or plasma, CSF.',
      pos: 'Any positive. Serum titre ≥ 1:160 (LFA) is strongly associated with CNS disease and mortality.',
      use: ['Serum CrAg screening in advanced HIV (CD4 < 100, WHO up to < 200): if positive, do an LP even without symptoms.', 'CSF CrAg is the most sensitive test for cryptococcal meningitis (more than India ink or culture).', 'Titres fall slowly: do not use them to judge treatment response or when to stop.'],
      fp: ['Rare: Trichosporon asahii infection; older latex tests with rheumatoid factor.'],
      fn: ['Very high antigen load (prozone, rare with LFA), very early or localised pulmonary disease, and some C. gattii infections.'] },
    { id: 'pcp', name: 'Pneumocystis PCR', short: 'PCP PCR',
      what: 'Quantitative real-time PCR for Pneumocystis jirovecii DNA.',
      spec: 'BAL (best), induced sputum, upper respiratory samples (lower sensitivity).',
      pos: 'Positive with a high load (low Ct) supports pneumonia; a low load may be colonisation. Cut-offs are assay- and laboratory-specific.',
      use: ['A negative BAL PCR excludes Pneumocystis pneumonia (ECIL-5).', 'Serum beta-D-glucan is usually very high in PCP; a negative BDG makes PCP very unlikely, especially in HIV.', 'Interpret low positives with the clinical and CT picture (ground-glass change, hypoxia, risk factors).'],
      fp: ['Colonisation in chronic lung disease, steroids and HIV without pneumonia.'],
      fn: ['Upper respiratory or sputum samples; recent co-trimoxazole treatment.'] },
    { id: 'muc', name: 'Mucorales PCR', short: 'Mucor PCR',
      what: 'PCR for Mucorales DNA (e.g. Rhizopus, Mucor, Lichtheimia).',
      spec: 'Serum or plasma; BAL or tissue.',
      pos: 'Any positive in blood is significant: it often becomes positive days before diagnosis by imaging or culture.',
      use: ['Consider when galactomannan and beta-D-glucan are negative but a mould is suspected (reversed halo sign, sinus disease, breakthrough on voriconazole or an echinocandin).', 'Treat with liposomal amphotericin B (5–10 mg/kg) and urgent surgical debridement.'],
      fp: ['Rare (contamination).'],
      fn: ['Localised disease; availability is limited to reference and specialist laboratories.'] },
    { id: 'histo', name: 'Histoplasma antigen', short: 'Histo Ag',
      what: 'Histoplasma polysaccharide antigen.',
      spec: 'Urine and serum (send both); BAL.',
      pos: 'Positive above the assay cut-off; higher levels in disseminated disease.',
      use: ['Disseminated histoplasmosis in advanced HIV or other immunosuppression after travel or residence in endemic areas (the Americas, parts of Africa and Asia).', 'Falling levels on treatment support response.'],
      fp: ['Cross-reacts with Blastomyces, Coccidioides, Paracoccidioides and Talaromyces.'],
      fn: ['Localised pulmonary disease in immunocompetent patients.'] },
    { id: 'serol', name: 'Aspergillus serology', short: 'IgG / IgE',
      what: 'Aspergillus-specific IgG (precipitins) and IgE, with total IgE.',
      spec: 'Serum.',
      pos: 'Above the laboratory’s validated cut-off. ABPA (ISHAM 2024): total IgE ≥ 500 IU/ml plus Aspergillus-specific IgE ≥ 0.35 kUA/l, with other criteria.',
      use: ['Chronic pulmonary aspergillosis: raised Aspergillus IgG with cavitation or aspergilloma for at least 3 months.', 'Allergic bronchopulmonary aspergillosis in asthma or cystic fibrosis.', 'Not useful for invasive aspergillosis in immunocompromised patients.'],
      fp: ['Raised IgG from exposure or colonisation without disease.'],
      fn: ['Hypogammaglobulinaemia, immunosuppression, and some non-fumigatus species.'] }
  ];
  var st = { m: 'gm', v: '', s: 'serum' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function interp(m) {
    var x = parseFloat(String(st.v).replace(',', '.'));
    if (isNaN(x)) return '';
    var cat, txt;
    if (m.id === 'gm') {
      if (st.s === 'serum') {
        if (x >= 1.0) { cat = 'R'; txt = 'Positive (≥ 1.0): meets the EORTC/MSGERC serum criterion for probable invasive aspergillosis, with a host factor and clinical feature.'; }
        else if (x >= 0.7) { cat = 'I'; txt = 'Positive (0.7–0.99): counts towards EORTC/MSGERC only together with BAL ≥ 0.8. Repeat serum and consider BAL.'; }
        else if (x > 0.5) { cat = 'I'; txt = 'Positive above the manufacturer cut-off (> 0.5): repeat on a new sample and investigate (CT chest). A single positive does not diagnose aspergillosis.'; }
        else { cat = 'S'; txt = 'Negative: does not exclude aspergillosis, especially if non-neutropenic or on mould-active prophylaxis.'; }
      } else {
        if (x >= 1.0) { cat = 'R'; txt = 'Positive (≥ 1.0): meets the EORTC/MSGERC BAL criterion for probable invasive aspergillosis.'; }
        else if (x >= 0.8) { cat = 'I'; txt = 'Weakly positive (0.8–0.99): counts towards EORTC/MSGERC if serum is ≥ 0.7. Repeat or combine with PCR.'; }
        else if (x >= 0.5) { cat = 'I'; txt = 'Weakly positive (0.5–0.79): resample and combine with PCR and imaging.'; }
        else { cat = 'S'; txt = 'Negative.'; }
      }
    } else if (m.id === 'bdg') {
      if (x >= 80) { cat = 'R'; txt = 'Positive (≥ 80 pg/ml): repeat to confirm, look for false-positive causes, and investigate for candidiasis, Pneumocystis or moulds. Very high values (> 500) are typical of PCP and invasive candidiasis.'; }
      else if (x >= 60) { cat = 'I'; txt = 'Indeterminate (60–79 pg/ml): send a repeat sample.'; }
      else { cat = 'S'; txt = 'Negative (< 60 pg/ml): makes invasive candidiasis and Pneumocystis unlikely. Does not detect Mucorales or Cryptococcus.'; }
    } else return '';
    var lbl = { S: 'Negative', I: 'Equivocal or low positive', R: 'Positive' }[cat];
    return '<div class="bp-explain"><p><span class="bp-cat c' + cat + '">' + lbl + '</span></p><p>' + esc(txt) + '</p></div>';
  }
  function draw(keep) {
    var m = M.filter(function (x) { return x.id === st.m; })[0];
    var h = '<div class="cov-chips fm-tabs" role="tablist">' + M.map(function (x) { return '<button type="button" role="tab" class="sp-chip' + (x.id === st.m ? ' on' : '') + '" data-m="' + x.id + '" aria-selected="' + (x.id === st.m) + '">' + esc(x.name) + '</button>'; }).join('') + '</div>';
    h += '<div class="fm-body"><h3>' + esc(m.name) + '</h3><table class="ab-tbl"><tr><th>Detects</th><td>' + esc(m.what) + '</td></tr><tr><th>Sample</th><td>' + esc(m.spec) + '</td></tr><tr><th>Positive</th><td>' + esc(m.pos) + '</td></tr></table>';
    if (m.calc) {
      h += '<div class="ab-sec"><h4>Interpret a result</h4><div class="bp-inputs">';
      if (m.calc.samples.length > 1) h += '<div class="cov-chips" style="align-self:flex-end">' + m.calc.samples.map(function (s) { return '<button type="button" class="sp-chip' + (st.s === s[0] ? ' on' : '') + '" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div>';
      h += '<label>' + esc(m.calc.label) + '<input id="fm-v" inputmode="decimal" value="' + esc(st.v) + '" placeholder="' + (m.id === 'gm' ? 'e.g. 0.8' : 'e.g. 120') + '" autocomplete="off"></label></div>' + interp(m) + '</div>';
    }
    h += '<div class="ab-cols"><div class="ab-sec"><h4>How to use it</h4><ul>' + m.use.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div><div>' +
      '<div class="ab-sec"><h4>False positives</h4><ul>' + m.fp.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="ab-sec"><h4>False negatives</h4><ul>' + m.fn.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul></div></div></div></div>';
    host.innerHTML = h;
    if (keep) { var i = host.querySelector('#fm-v'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('click', function (e) {
    var t = e.target.closest('[data-m]'), s = e.target.closest('[data-s]');
    if (t) { st.m = t.getAttribute('data-m'); st.v = ''; st.s = 'serum'; draw(); }
    else if (s) { st.s = s.getAttribute('data-s'); draw(); }
  });
  host.addEventListener('input', function (e) { if (e.target.id === 'fm-v') { st.v = e.target.value; draw(e.target.selectionStart || st.v.length); } });
  draw();
})();
