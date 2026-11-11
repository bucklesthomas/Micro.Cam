/* Antimicrobials in pregnancy and breastfeeding: quick reference.
   Ratings summarise UKTIS (bumps / UK Teratology Information Service) monographs, the BNF and the SPS (Specialist Pharmacy Service)
   breastfeeding guidance. ok = generally considered compatible; care = use if benefits outweigh risks, or avoid at certain stages; avoid = avoid unless no alternative. */
(function () {
  var host = document.getElementById('preg');
  if (!host) return;
  // [drug, class, pregnancy rating, pregnancy note, breastfeeding rating, breastfeeding note]
  var D = [
    ['Penicillins (amoxicillin, benzylpenicillin, phenoxymethylpenicillin, flucloxacillin)', 'Antibacterials', 'ok', 'Extensive experience; no increased risk of malformations.', 'ok', 'Small amounts in milk; watch the infant for diarrhoea or thrush.'],
    ['Co-amoxiclav', 'Antibacterials', 'care', 'Avoid in preterm prelabour rupture of membranes (necrotising enterocolitis in ORACLE); otherwise compatible.', 'ok', 'Compatible.'],
    ['Piperacillin–tazobactam', 'Antibacterials', 'ok', 'β-lactam; use when indicated.', 'ok', 'Compatible.'],
    ['Pivmecillinam', 'Antibacterials', 'care', 'Limited data, no clear evidence of harm.', 'ok', 'Compatible.'],
    ['Temocillin', 'Antibacterials', 'care', 'Limited data; β-lactam, use if needed.', 'ok', 'Likely compatible.'],
    ['Cephalosporins (cefalexin, cefuroxime, ceftriaxone, cefazolin, cefotaxime)', 'Antibacterials', 'ok', 'Extensive experience; first-line options in pregnancy.', 'ok', 'Compatible.'],
    ['Carbapenems (meropenem, ertapenem)', 'Antibacterials', 'care', 'Limited data, no evidence of harm; use when the indication is clear.', 'ok', 'Poor oral absorption by the infant; compatible.'],
    ['Aztreonam', 'Antibacterials', 'care', 'Limited data.', 'ok', 'Negligible infant exposure.'],
    ['Gentamicin and other aminoglycosides', 'Antibacterials', 'care', 'Theoretical fetal ototoxicity: use when needed with careful level monitoring; avoid streptomycin.', 'ok', 'Poorly absorbed by the infant; compatible.'],
    ['Vancomycin (IV)', 'Antibacterials', 'care', 'Limited data, no clear harm; monitor levels.', 'ok', 'Poorly absorbed orally by the infant.'],
    ['Vancomycin (oral) and fidaxomicin', 'Antibacterials', 'ok', 'Minimal absorption.', 'ok', 'Compatible.'],
    ['Teicoplanin', 'Antibacterials', 'care', 'Very limited data.', 'care', 'No data; likely low infant exposure.'],
    ['Daptomycin', 'Antibacterials', 'care', 'Very limited data.', 'care', 'Small amounts in milk; limited data.'],
    ['Linezolid', 'Antibacterials', 'care', 'Very limited data; use only if no alternative.', 'care', 'Present in milk; monitor the infant.'],
    ['Erythromycin', 'Antibacterials', 'ok', 'The macrolide with most experience; used in preterm rupture of membranes.', 'ok', 'Compatible; reports of pyloric stenosis with direct neonatal use.'],
    ['Clarithromycin', 'Antibacterials', 'care', 'BNF: avoid, especially in the first trimester, unless benefit outweighs risk (some studies suggest miscarriage risk).', 'ok', 'Compatible.'],
    ['Azithromycin', 'Antibacterials', 'ok', 'Used in pregnancy (e.g. chlamydia, BASHH); some data on miscarriage risk are inconsistent.', 'ok', 'Compatible.'],
    ['Clindamycin', 'Antibacterials', 'ok', 'No evidence of harm.', 'care', 'Compatible; watch the infant for diarrhoea or bloody stools.'],
    ['Doxycycline and other tetracyclines', 'Antibacterials', 'avoid', 'Avoid from about 15 weeks (tooth discolouration, bone growth); first-trimester exposure is not an indication to stop the pregnancy.', 'care', 'Short courses (up to 3 weeks) are acceptable; avoid prolonged use.'],
    ['Tigecycline', 'Antibacterials', 'avoid', 'Tetracycline class effects; avoid.', 'care', 'No data.'],
    ['Ciprofloxacin, levofloxacin, moxifloxacin', 'Antibacterials', 'care', 'No clear evidence of harm in humans (UKTIS), but avoid unless no suitable alternative.', 'care', 'BNF advises avoiding; SPS considers short courses of ciprofloxacin acceptable.'],
    ['Trimethoprim', 'Antibacterials', 'care', 'Folate antagonist: avoid in the first trimester (neural tube defects); give folic acid 5 mg if used early.', 'ok', 'Compatible for short courses.'],
    ['Co-trimoxazole', 'Antibacterials', 'care', 'Avoid in the first trimester (folate antagonist) and near term (neonatal jaundice); use high-dose folic acid if needed for PCP or toxoplasmosis.', 'care', 'Avoid in premature, jaundiced or G6PD-deficient infants.'],
    ['Nitrofurantoin', 'Antibacterials', 'care', 'Suitable for UTI, but avoid at term (and from 36 weeks) because of neonatal haemolysis.', 'ok', 'Compatible; avoid if the infant is G6PD deficient.'],
    ['Fosfomycin (oral)', 'Antibacterials', 'ok', 'No evidence of harm; single-dose UTI treatment.', 'ok', 'Compatible.'],
    ['Metronidazole', 'Antibacterials', 'ok', 'No evidence of harm (UKTIS); BNF advises avoiding high-dose regimens.', 'care', 'Compatible with standard doses; after a single 2 g dose, stop breastfeeding for 12–24 hours.'],
    ['Rifampicin', 'Antibacterials', 'care', 'Used for TB in pregnancy; give vitamin K to mother and neonate at delivery.', 'ok', 'Compatible (orange milk).'],
    ['Chloramphenicol (systemic)', 'Antibacterials', 'avoid', 'Grey baby syndrome near term.', 'avoid', 'Risk of bone marrow toxicity in the infant.'],
    ['Colistin', 'Antibacterials', 'care', 'Very limited data; reserve for no alternative.', 'care', 'Poor oral absorption; limited data.'],
    ['Isoniazid', 'Antituberculous', 'ok', 'Standard TB treatment; give pyridoxine.', 'ok', 'Compatible; give the infant pyridoxine if both are on isoniazid.'],
    ['Pyrazinamide and ethambutol', 'Antituberculous', 'ok', 'Part of standard TB treatment in pregnancy (UK and WHO).', 'ok', 'Compatible.'],
    ['Fluconazole', 'Antifungals', 'avoid', 'Avoid, especially high or prolonged doses in the first trimester (birth defects); a possible small miscarriage risk even with a single 150 mg dose (MHRA). Use topical azoles for vaginal thrush.', 'ok', 'Compatible.'],
    ['Itraconazole, voriconazole, posaconazole, isavuconazole', 'Antifungals', 'avoid', 'Teratogenic in animals; use only if no alternative for life-threatening infection.', 'care', 'Limited data; avoid if possible.'],
    ['Liposomal amphotericin B', 'Antifungals', 'ok', 'Preferred systemic antifungal in pregnancy.', 'ok', 'Poor oral absorption by the infant.'],
    ['Echinocandins (anidulafungin, caspofungin, micafungin)', 'Antifungals', 'care', 'Animal toxicity at high doses; very limited human data.', 'care', 'No data; poor oral absorption.'],
    ['Flucytosine', 'Antifungals', 'avoid', 'Teratogenic in animals; specialist use only.', 'avoid', 'No data.'],
    ['Nystatin and topical clotrimazole', 'Antifungals', 'ok', 'Minimal absorption; first choice for thrush.', 'ok', 'Compatible.'],
    ['Aciclovir and valaciclovir', 'Antivirals', 'ok', 'Extensive experience; used for genital herpes and varicella.', 'ok', 'Compatible.'],
    ['Oseltamivir', 'Antivirals', 'ok', 'Recommended for influenza in pregnancy.', 'ok', 'Compatible.'],
    ['Ganciclovir and valganciclovir', 'Antivirals', 'avoid', 'Teratogenic and carcinogenic in animals; specialist use only.', 'avoid', 'Avoid.'],
    ['Antiretrovirals', 'Antivirals', 'care', 'Continue or start ART: follow BHIVA pregnancy guidelines for the regimen.', 'care', 'Follow BHIVA guidance on infant feeding.'],
    ['Chloroquine', 'Antimalarials', 'ok', 'Compatible.', 'ok', 'Compatible.'],
    ['Quinine', 'Antimalarials', 'ok', 'Used in pregnancy; risk of hypoglycaemia.', 'ok', 'Compatible.'],
    ['Artesunate (IV)', 'Antimalarials', 'ok', 'Treatment of choice for severe malaria in all trimesters.', 'ok', 'Compatible.'],
    ['Artemether–lumefantrine', 'Antimalarials', 'care', 'WHO now allows use in all trimesters; UK guidance has favoured the second and third trimesters.', 'ok', 'Compatible.'],
    ['Mefloquine', 'Antimalarials', 'care', 'Can be used for prophylaxis in all trimesters if needed.', 'ok', 'Compatible.'],
    ['Atovaquone–proguanil', 'Antimalarials', 'care', 'Limited data: avoid unless no suitable alternative.', 'care', 'BNF: avoid unless no suitable alternative.'],
    ['Primaquine and tafenoquine', 'Antimalarials', 'avoid', 'Fetal G6PD status unknown (haemolysis): defer until after delivery.', 'avoid', 'Avoid unless the infant’s G6PD status is known to be normal.']
  ];
  var LBL = { ok: 'Generally compatible', care: 'Use with care', avoid: 'Avoid' };
  var st = { q: '', cls: 'All' };
  var CLS = ['All'];
  D.forEach(function (d) { if (CLS.indexOf(d[1]) === -1) CLS.push(d[1]); });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cell(r, note) { return '<td><span class="pg-tag ' + r + '">' + LBL[r] + '</span><span class="pg-note">' + esc(note) + '</span></td>'; }
  function draw(keep) {
    var q = st.q.toLowerCase().trim();
    var h = '<div class="ab-bar"><input id="pg-q" type="search" placeholder="Filter drugs…" value="' + esc(st.q) + '" aria-label="Filter drugs" autocomplete="off"><div class="ab-aw">' +
      CLS.map(function (c) { return '<button type="button" class="sp-chip' + (st.cls === c ? ' on' : '') + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div>';
    var rows = D.filter(function (d) { return (st.cls === 'All' || d[1] === st.cls) && (!q || (d[0] + ' ' + d[1]).toLowerCase().indexOf(q) !== -1); });
    h += '<div class="sp-scroll"><table class="cov-tbl pg-tbl"><thead><tr><th>Drug</th><th>Pregnancy</th><th>Breastfeeding</th></tr></thead><tbody>';
    rows.forEach(function (d) { h += '<tr><th scope="row">' + esc(d[0]) + '<span class="pg-cls">' + esc(d[1]) + '</span></th>' + cell(d[2], d[3]) + cell(d[4], d[5]) + '</tr>'; });
    if (!rows.length) h += '<tr><td colspan="3" class="ir-empty">No match.</td></tr>';
    host.innerHTML = h + '</tbody></table></div>';
    if (keep) { var i = host.querySelector('#pg-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('input', function (e) { if (e.target.id === 'pg-q') { st.q = e.target.value; draw(e.target.selectionStart || st.q.length); } });
  host.addEventListener('click', function (e) { var c = e.target.closest('[data-c]'); if (c) { st.cls = c.getAttribute('data-c'); draw(); } });
  draw();
})();
