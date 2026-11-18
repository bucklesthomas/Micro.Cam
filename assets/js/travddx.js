/* Returned traveller: symptom-based differential finder.
   Weights are a teaching aid built from: Johnston V et al. Fever in returned travellers presenting in the UK (J Infect 2009);
   CDC Yellow Book (post-travel evaluation: incubation periods and clinical clues); GeoSentinel surveillance data on causes by region;
   UK malaria guideline (2016). They rank possibilities; they are not probabilities. */
(function () {
  var host = document.getElementById('travddx');
  if (!host) return;

  var REGIONS = ['Sub-Saharan Africa', 'South Asia', 'South-East Asia or Pacific', 'Latin America or Caribbean', 'Middle East or North Africa', 'Europe, North America or Australia'];
  var ONSET = ['Under 10 days', '10–21 days', 'Over 21 days'];
  var FEAT = [
    ['Symptoms and signs', [
      ['head', 'Headache'], ['neck', 'Neck stiffness'], ['conf', 'Confusion, seizures or drowsiness'], ['cough', 'Cough or breathlessness'],
      ['throat', 'Sore throat or mouth ulcers'], ['diar', 'Diarrhoea'], ['ruq', 'Right upper quadrant pain'], ['jaund', 'Jaundice'],
      ['rash', 'Rash'], ['eschar', 'Eschar (black crusted ulcer)'], ['bleed', 'Bleeding or bruising'], ['arth', 'Joint pains'],
      ['myal', 'Muscle pains'], ['conj', 'Red eyes'], ['lymph', 'Lymphadenopathy'], ['spleen', 'Splenomegaly'], ['wt', 'Weight loss or night sweats']
    ]],
    ['Exposures', [
      ['mosq', 'Mosquito bites, no or poor malaria prophylaxis'], ['fresh', 'Freshwater swimming or wading'], ['flood', 'Floods, rodents or wet farming'], ['tick', 'Tick bite, safari or bush walking'],
      ['animal', 'Animal bite or scratch'], ['dairy', 'Unpasteurised dairy or livestock'], ['food', 'Street food or untreated water'], ['sex', 'New sexual partner'],
      ['cave', 'Caves, bats, dust or construction'], ['hotel', 'Hotel, cruise ship or spa pool'], ['crowd', 'Mass gathering (e.g. Hajj)'], ['camel', 'Camel contact'],
      ['dm', 'Diabetes, heavy alcohol use or kidney disease'], ['vhf', 'Healthcare abroad, or contact with a VHF case or body fluids']
    ]],
    ['Blood results', [
      ['plt', 'Low platelets'], ['wcc', 'Low white cell count'], ['neut', 'Neutrophilia'], ['eos', 'Eosinophilia'], ['alt', 'Raised ALT'], ['aki', 'Acute kidney injury']
    ]]
  ];
  var LABEL = {};
  FEAT.forEach(function (g) { g[1].forEach(function (f) { LABEL[f[0]] = f[1]; }); });

  // name; region weights [SSA, S Asia, SE Asia, LatAm, ME/N Africa, Eur/NAm/Aus]; onset weights [<10, 10–21, >21 days];
  // feature weights; tests; note
  var D = [
    { n: 'Falciparum malaria', r: [3, 1, 1, 1, 0, 0], o: [1, 3, 2], f: { mosq: 3, plt: 2, conf: 2, jaund: 1, spleen: 1, aki: 1, head: 1, alt: 1, wcc: 0.5 },
      t: 'Thick and thin films plus rapid antigen test today; repeat at 12–24 hours and 24 hours later (3 sets)', x: 'Minimum incubation 7 days; most present within 3 months of return. See the malaria guide.' },
    { n: 'Non-falciparum malaria (P. vivax, ovale, malariae, knowlesi)', r: [1, 3, 2, 2, 0, 0], o: [0.5, 2, 3], f: { mosq: 3, plt: 2, spleen: 2, head: 1 },
      t: 'Films and rapid antigen test (3 sets)', x: 'Vivax and ovale can relapse months after return. P. knowlesi (Malaysian Borneo) can be severe.' },
    { n: 'Enteric fever (typhoid, paratyphoid)', r: [1, 3, 2, 1, 1, 0], o: [1, 3, 1], f: { food: 2, head: 1, diar: 1, ruq: 0.5, alt: 1, wcc: 1, spleen: 1, rash: 0.5, cough: 0.5 },
      t: 'Blood cultures (several sets; bone marrow culture is most sensitive); stool culture', x: 'Usually 7–21 days. South Asia: high fluoroquinolone resistance, and XDR typhoid from Pakistan.' },
    { n: 'Dengue', r: [1, 3, 3, 3, 1, 0], o: [3, 1, 0], f: { mosq: 1, rash: 2, myal: 2, head: 2, plt: 2, wcc: 2, alt: 1, bleed: 2, arth: 1 },
      t: 'Dengue NS1 antigen or PCR in the first week; IgM after day 5', x: 'Incubation 3–14 days. Watch for warning signs (abdominal pain, bleeding, rising haematocrit) as the fever settles. Avoid NSAIDs.' },
    { n: 'Chikungunya', r: [1, 2, 2, 2, 0, 0], o: [3, 0.5, 0], f: { mosq: 1, arth: 3, rash: 2, myal: 1, head: 1 },
      t: 'Chikungunya PCR (first week) and serology (RIPL)', x: 'Incubation 2–12 days. Severe, often prolonged joint pain.' },
    { n: 'Zika', r: [1, 1, 1, 2, 0, 0], o: [2, 1, 0], f: { rash: 3, conj: 2, arth: 1, myal: 1 },
      t: 'Zika PCR (blood and urine) and serology (RIPL)', x: 'Usually mild. Pregnancy: specialist follow-up (congenital Zika syndrome).' },
    { n: 'Rickettsial infection (African tick bite fever, scrub typhus, spotted fevers)', r: [3, 2, 2, 1, 1, 1], o: [3, 2, 0], f: { tick: 3, eschar: 4, rash: 2, head: 1, lymph: 2, plt: 1, alt: 1 },
      t: 'Eschar swab or biopsy PCR; paired serology (RIPL)', x: 'African tick bite fever after safari in southern Africa; scrub typhus in Asia. Treat with doxycycline without waiting for results.' },
    { n: 'Leptospirosis', r: [1, 2, 3, 2, 0.5, 1], o: [2, 2, 0], f: { fresh: 3, flood: 3, conj: 3, jaund: 2, aki: 2, myal: 2, cough: 1, plt: 1, neut: 1, bleed: 1 },
      t: 'PCR on blood (first week) and urine (after); serology from about day 5–7 (RIPL)', x: 'Incubation 2–30 days. Treat early (doxycycline, or ceftriaxone if severe).' },
    { n: 'Acute schistosomiasis (Katayama syndrome)', r: [3, 0, 0.5, 0.5, 0.5, 0], o: [0, 2, 3], f: { fresh: 4, eos: 3, cough: 2, rash: 1, diar: 1, head: 1 },
      t: 'Schistosoma serology (may be negative early: repeat after 6–12 weeks); eosinophil count', x: 'Typically 2–8 weeks after freshwater exposure, e.g. Lake Malawi or Lake Victoria.' },
    { n: 'Acute HIV infection', r: [1, 1, 1, 1, 1, 1], o: [0.5, 2, 2], f: { sex: 3, rash: 2, lymph: 2, throat: 2, wcc: 1, plt: 1, alt: 0.5 },
      t: 'Fourth-generation HIV antigen and antibody test (and HIV RNA if very early)', x: '2–6 weeks after exposure.' },
    { n: 'Hepatitis A or E', r: [2, 3, 2, 1, 1, 0.5], o: [0, 1, 3], f: { food: 2, jaund: 3, alt: 3, ruq: 1, diar: 0.5 },
      t: 'Hepatitis A IgM; hepatitis E IgM (and HEV RNA)', x: 'Hepatitis A 2–6 weeks; E 2–8 weeks. Hepatitis E is dangerous in pregnancy.' },
    { n: 'Acute hepatitis B', r: [1, 1, 1, 1, 1, 0.5], o: [0, 0, 2], f: { sex: 2, vhf: 1, jaund: 2, alt: 3, arth: 0.5, rash: 0.5 },
      t: 'HBsAg and anti-HBc IgM', x: '1–6 months after exposure (sex, medical or dental procedures, tattoos).' },
    { n: 'Tuberculosis', r: [2, 3, 2, 1, 1, 0.5], o: [0, 0.5, 3], f: { cough: 3, wt: 3, lymph: 2 },
      t: 'Chest X-ray; 3 sputum samples for AFB, culture and rapid molecular test', x: 'Weeks to years after travel; longer stays and visiting friends and relatives carry the most risk.' },
    { n: 'Amoebic liver abscess', r: [2, 2, 1, 2, 1, 0], o: [0, 1, 3], f: { ruq: 4, neut: 2, alt: 1, cough: 0.5, food: 1 },
      t: 'Liver ultrasound or CT; Entamoeba serology', x: 'Weeks to months after return; diarrhoea is often absent.' },
    { n: 'Visceral leishmaniasis', r: [1, 2, 0, 2, 1, 1], o: [0, 0, 3], f: { spleen: 4, wt: 2, wcc: 2, plt: 2 },
      t: 'rK39 antigen test, blood PCR, bone marrow aspirate (specialist)', x: 'Months after exposure: East Africa, the Indian subcontinent, Brazil and the Mediterranean.' },
    { n: 'Brucellosis', r: [1, 1, 0.5, 1, 3, 1], o: [0.5, 2, 3], f: { dairy: 4, arth: 2, wt: 2, spleen: 1, alt: 1 },
      t: 'Blood cultures (warn the lab: hazard group 3) and Brucella serology', x: 'Weeks to months. Sacroiliitis and spondylitis are common.' },
    { n: 'Melioidosis', r: [0.5, 2, 3, 0.5, 0, 0.5], o: [2, 2, 1], f: { dm: 3, flood: 2, fresh: 1, cough: 2, neut: 1 },
      t: 'Blood, sputum, urine and pus cultures (warn the lab: hazard group 3)', x: 'Thailand, Laos, Malaysia, northern Australia. Abscesses in liver, spleen and prostate; can reactivate years later.' },
    { n: 'East African trypanosomiasis', r: [2, 0, 0, 0, 0, 0], o: [2, 2, 0], f: { tick: 2, eschar: 1.5, rash: 1, lymph: 1, plt: 1, conf: 1 },
      t: 'Blood films (often parasites are visible); urgent specialist referral', x: 'Safari in game parks of East and southern Africa: painful chancre at a tsetse bite.' },
    { n: 'Influenza, COVID-19 and other respiratory viruses', r: [2, 2, 2, 2, 2, 2], o: [3, 0, 0], f: { cough: 3, myal: 1, head: 1, throat: 1, crowd: 2 },
      t: 'Nose and throat swab for respiratory virus PCR', x: 'The most common cause of fever after travel in some series.' },
    { n: 'Legionnaires’ disease', r: [1, 1, 1, 1, 1, 2], o: [3, 0.5, 0], f: { hotel: 3, cough: 2, diar: 1, conf: 1, aki: 1, alt: 1 },
      t: 'Legionella urinary antigen; sputum culture and PCR', x: 'Incubation 2–10 days. Notifiable; travel-associated cases are reported internationally.' },
    { n: 'MERS coronavirus', r: [0, 0, 0, 0, 2, 0], o: [3, 0, 0], f: { camel: 3, vhf: 2, cough: 3 },
      t: 'Isolate first; respiratory samples for MERS-CoV PCR after discussion', x: 'Within 14 days of travel to the Arabian Peninsula. HCID: follow UKHSA guidance.' },
    { n: 'Bacterial gastroenteritis (Campylobacter, Salmonella, Shigella)', r: [2, 2, 2, 2, 2, 1], o: [3, 0.5, 0], f: { diar: 4, food: 2, neut: 0.5 },
      t: 'Stool culture or gastrointestinal PCR; blood cultures if febrile', x: 'Invasive non-typhoidal Salmonella in the immunocompromised.' },
    { n: 'Meningococcal disease', r: [2, 1, 1, 1, 2, 1], o: [3, 0, 0], f: { crowd: 3, neck: 3, head: 2, rash: 2, conf: 2 },
      t: 'Blood cultures and meningococcal PCR (EDTA blood); LP if safe', x: 'Sahel meningitis belt, Hajj and Umrah. See the meningitis guide.' },
    { n: 'Japanese encephalitis', r: [0, 2, 2, 0, 0, 0], o: [2, 1, 0], f: { mosq: 1, conf: 3, head: 2, neck: 1 },
      t: 'CSF and serum JE IgM (RIPL)', x: 'Rural Asia, especially near rice paddies and pigs; incubation 5–15 days.' },
    { n: 'Rabies', r: [2, 3, 2, 1, 1, 0.5], o: [0, 1, 2], f: { animal: 4, conf: 3 },
      t: 'Specialist and UKHSA advice: saliva, skin biopsy and CSF testing', x: 'Usually 1–3 months after a bite or scratch (can be years). See the rabies guide for exposures without symptoms.' },
    { n: 'Endemic fungi (histoplasmosis, coccidioidomycosis)', r: [0.5, 0, 0.5, 2, 0, 1], o: [1, 3, 1], f: { cave: 4, cough: 2, wt: 1 },
      t: 'Chest X-ray or CT; Histoplasma urinary antigen; fungal serology (mycology reference laboratory)', x: 'Caves with bats (histoplasmosis); dusty south-western USA or Mexico (coccidioidomycosis).' },
    { n: 'Q fever', r: [1, 1, 1, 1, 1, 1], o: [0.5, 3, 1], f: { dairy: 3, head: 2, cough: 1, alt: 2, plt: 1 },
      t: 'Coxiella phase I and II serology (RIPL); PCR early', x: 'Incubation 2–3 weeks; livestock, especially at birthing.' },
    { n: 'Viral haemorrhagic fever (Lassa, Ebola, Marburg, CCHF)', r: [2, 0.5, 0, 0.5, 1, 0.5], o: [2, 2, 0], f: { vhf: 5, bleed: 3, plt: 1, alt: 1, aki: 1, diar: 1 },
      t: 'Stop: isolate and follow the ACDP VHF algorithm before any non-urgent samples', x: 'Within 21 days of an outbreak area or exposure. CCHF also in Turkey, the Balkans and the Middle East (tick bites).' },
    { n: 'Tick-borne encephalitis or Lyme disease', r: [0, 0, 0, 0, 0, 2], o: [1, 2, 1], f: { tick: 3, rash: 2, conf: 1, head: 1, arth: 1 },
      t: 'TBE serology (RIPL); Lyme serology (treat erythema migrans clinically)', x: 'Forested Europe and North America.' },
    { n: 'Secondary syphilis', r: [1, 1, 1, 1, 1, 1], o: [0, 0, 2], f: { sex: 3, rash: 2, lymph: 2, throat: 1 },
      t: 'Syphilis serology (treponemal test and RPR)', x: 'Rash often on palms and soles. See the syphilis serology guide.' }
  ];
  var MAL_ZONE = [true, true, true, true, false, false];

  var st = { r: -1, o: -1, f: {} };
  try { var saved = JSON.parse(sessionStorage.getItem('mc-travddx') || 'null'); if (saved) st = saved; } catch (e) {}
  function save() { try { sessionStorage.setItem('mc-travddx', JSON.stringify(st)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function rank() {
    var sel = Object.keys(st.f).filter(function (k) { return st.f[k]; });
    var out = [];
    D.forEach(function (d) {
      var rw = st.r < 0 ? 1 : d.r[st.r], ow = st.o < 0 ? 1 : d.o[st.o];
      if (!rw || !ow) return;
      var fs = 0, why = [];
      sel.forEach(function (k) { if (d.f[k]) { fs += d.f[k]; why.push(LABEL[k]); } });
      if (sel.length && !why.length) return;
      out.push({ d: d, s: rw + ow + 2 * fs, why: why });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return { list: out.slice(0, 10), sel: sel };
  }

  function chip(attr, val, label, on) { return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" ' + attr + '="' + esc(val) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>'; }

  function draw() {
    var h = '<div class="td-sec"><h3>Region</h3><div class="ab-aw">' + REGIONS.map(function (r, i) { return chip('data-r', i, r, st.r === i); }).join('') + '</div></div>';
    h += '<div class="td-sec"><h3>Fever started after exposure or return</h3><div class="ab-aw">' + ONSET.map(function (o, i) { return chip('data-o', i, o, st.o === i); }).join('') + '</div></div>';
    FEAT.forEach(function (g) {
      h += '<div class="td-sec"><h3>' + esc(g[0]) + '</h3><div class="ab-aw">' + g[1].map(function (f) { return chip('data-f', f[0], f[1], !!st.f[f[0]]); }).join('') + '</div></div>';
    });
    var res = rank();
    h += '<div class="td-res" aria-live="polite">';
    if (st.f.vhf) h += '<div class="td-alert">Possible VHF or HCID exposure: isolate, use the ACDP VHF risk assessment, and discuss with infectious diseases now. Still test for malaria (inform the lab first).</div>';
    if (st.r >= 0 && MAL_ZONE[st.r]) h += '<div class="td-alert amber">Malaria area: test for malaria today in every febrile traveller, whatever else is on this list.</div>';
    if (st.r < 0 && st.o < 0 && !res.sel.length) h += '<p class="ab-note">Pick a region, onset and any features: the list updates as you go.</p>';
    else if (!res.list.length) h += '<p class="ab-note">No condition on this list matches all of that. Consider non-travel causes, and discuss with infectious diseases.</p>';
    else {
      h += '<h3>Most likely, given what you selected</h3><ol class="td-list">';
      res.list.forEach(function (x) {
        h += '<li><b>' + esc(x.d.n) + '</b>' + (x.why.length ? '<span class="td-why">' + x.why.map(esc).join(' · ') + '</span>' : '') +
          '<span class="td-t"><em>Send:</em> ' + esc(x.d.t) + '</span><span class="td-x">' + esc(x.d.x) + '</span></li>';
      });
      h += '</ol>';
    }
    h += '<div class="ie-actions"><button type="button" class="reset" data-clear>Clear</button>' + (res.list.length ? '<button type="button" class="reset" data-copy>Copy for Epic</button>' : '') + '</div>';
    h += '<p class="ie-ref">A ranking aid built from typical incubation periods, geography and clinical clues; not a probability. Common things (malaria, dengue, enteric fever, respiratory viruses) remain common, and travellers also get non-travel illnesses.</p></div>';
    host.innerHTML = h;
  }

  function asText() {
    var res = rank(), L = ['Returned traveller differential (Micro.Links)'];
    L.push('Region: ' + (st.r >= 0 ? REGIONS[st.r] : 'not specified') + '; onset: ' + (st.o >= 0 ? ONSET[st.o] : 'not specified'));
    if (res.sel.length) L.push('Features: ' + res.sel.map(function (k) { return LABEL[k]; }).join(', '));
    L.push('');
    res.list.forEach(function (x, i) { L.push((i + 1) + '. ' + x.d.n + ' - send: ' + x.d.t); });
    if (st.r >= 0 && MAL_ZONE[st.r]) L.push('', 'Malaria area: malaria films and rapid antigen test today.');
    return L.join('\n');
  }
  function copy(btn) {
    var text = asText();
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  host.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-r')) { var r = +b.getAttribute('data-r'); st.r = st.r === r ? -1 : r; }
    else if (b.hasAttribute('data-o')) { var o = +b.getAttribute('data-o'); st.o = st.o === o ? -1 : o; }
    else if (b.hasAttribute('data-f')) { var f = b.getAttribute('data-f'); st.f[f] = !st.f[f]; }
    else if (b.hasAttribute('data-clear')) { st = { r: -1, o: -1, f: {} }; }
    else if (b.hasAttribute('data-copy')) { copy(b); return; }
    else return;
    save(); draw();
  });
  draw();
})();
