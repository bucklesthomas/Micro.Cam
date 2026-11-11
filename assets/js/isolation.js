/* Isolation and transmission-based precautions for hospital inpatients.
   Precautions, room and RPE: NHS England National Infection Prevention and Control Manual (NIPCM), Appendix 11
   (aide memoire for optimal patient placement and RPE). Typical durations: UKHSA guidance and common NHS practice (not part of Appendix 11). */
(function () {
  var host = document.getElementById('iso');
  if (!host) return;
  var SR = 'Single en-suite room', SRH = 'Single room in high-risk areas (ICU, neonatal, haematology/oncology)', NPR = 'Negative pressure room';
  var FR = 'FRSM; FFP3 for AGPs', FF = 'FFP3 for all care', NO = 'None beyond standard precautions';
  var ABX = 'Until established on appropriate antimicrobial treatment (commonly 24 hours; 48 hours for pertussis)';
  var GI = 'Until 48 hours free of diarrhoea and vomiting';
  // [infection, precautions (C contact, D droplet, A airborne), room, RPE, typical duration, notifiable]
  var D = [
    ['Acinetobacter baumannii', 'C', SRH, NO, 'Usually for the admission (flag the record)', 0],
    ['Acute hepatitis of unknown cause', 'D', SR, FR, 'Until a cause is found; local policy', 1],
    ['Adenovirus: respiratory', 'D', SR, FR, 'Duration of symptoms', 0],
    ['Adenovirus: conjunctivitis or gastroenteritis', 'C', SR, NO, 'Duration of symptoms (gastroenteritis: 48 hours symptom-free)', 0],
    ['Anthrax (Bacillus anthracis)', 'C', SR, NO + '; clean blood spills immediately', 'Duration of illness', 1],
    ['Bacillus cereus', 'C', SRH, NO, 'Duration of illness', 0],
    ['Candidozyma auris (Candida auris)', 'C', SR, NO, 'For the admission and future admissions (flag the record); screening per UKHSA', 0],
    ['Carbapenemase-producing Enterobacterales (CPE)', 'C', SR, NO, 'For the admission and future admissions (flag the record); screen contacts', 0],
    ['Chickenpox (varicella)', 'A', NPR, FF, 'Until all lesions are crusted (usually 5 days after rash onset). Non-immune exposed patients: day 8 to day 21 after exposure (day 28 if given immunoglobulin)', 0],
    ['Chlamydia pneumoniae', 'D', SRH, FR, 'Duration of symptoms', 0],
    ['Clostridioides difficile', 'C', SR, NO, GI + ' (formed stools); use soap and water, not alcohol gel', 0],
    ['COVID-19 and other seasonal coronaviruses', 'DA', SR, FR + ' (local risk assessment)', 'Local policy (commonly at least 5 days and improving; longer if immunocompromised)', 0],
    ['Diphtheria (C. diphtheriae or C. ulcerans)', 'CD', SR, FR + ' (pharyngeal)', 'Until 2 negative cultures taken at least 24 hours apart after finishing antibiotics', 1],
    ['Enterovirus D68', 'D', SR, FR, 'Duration of symptoms', 0],
    ['ESBL-producing Enterobacterales', 'C', 'Local policy (prioritise a single room if diarrhoea, wounds or incontinence)', NO, 'Not in NIPCM Appendix 11: local policy', 0],
    ['Gastroenteritis (e.g. Salmonella, Shigella, Campylobacter)', 'C', SR, 'FRSM if vomiting', GI, 1],
    ['Haemophilus influenzae (invasive)', 'D', SR, FR, ABX, 0],
    ['Hepatitis A', 'C', SR, 'FRSM if vomiting', 'Until 7 days after onset of jaundice (or symptoms)', 1],
    ['Influenza', 'D', SR, FR, '5 days from symptom onset (longer if immunocompromised)', 0],
    ['Measles', 'DA', NPR, FF, 'Until 4 days after rash onset (duration of illness if immunocompromised). Non-immune exposed patients: day 5 to day 21 after exposure', 1],
    ['Meningococcal disease (N. meningitidis)', 'D', SR, FR, ABX, 1],
    ['Mpox: no respiratory symptoms, not severe, limited lesions', 'CD', SR, FR, 'Until all lesions have scabbed and healed', 1],
    ['Mpox: respiratory symptoms, severe disease or extensive lesions', 'DA', NPR, FF, 'Until all lesions have scabbed and healed', 1],
    ['MRSA', 'C', SR, 'FFP3 for AGPs only if MRSA pneumonia', 'For the admission, or until decolonisation screens are negative (local policy)', 0],
    ['Mumps', 'D', SR, FR, 'Until 5 days after onset of parotid swelling', 1],
    ['Mycoplasma pneumoniae', 'D', SR, FR, 'Duration of symptoms', 0],
    ['Norovirus', 'C', SR, 'FRSM if vomiting', GI + '; close bays to admissions in outbreaks', 0],
    ['Parainfluenza', 'D', SR, FR, 'Duration of symptoms', 0],
    ['Parvovirus B19 (slapped cheek)', 'D', SR + ' until rash or arthralgia develops', FR + ' (not needed once rash present)', 'Until rash or arthralgia develops (not infectious after this); aplastic crisis or immunocompromised: duration of illness', 0],
    ['Pertussis (whooping cough)', 'D', SR, FR, 'Until 48 hours of appropriate antibiotics (or 21 days from cough onset if untreated)', 1],
    ['Pneumocystis jirovecii', 'D', SRH + ' (keep away from other immunocompromised patients)', NO, 'Duration of treatment', 0],
    ['Pseudomonas aeruginosa', 'D', SRH, NO, 'Local policy (often for the admission in high-risk units)', 0],
    ['PVL-positive Staphylococcus aureus', 'C', SR, FR + ' (only if pneumonia)', 'Until decolonisation complete and lesions healed', 0],
    ['RSV', 'D', SR, FR, 'Duration of symptoms', 0],
    ['Rotavirus', 'C', SR, NO, GI, 0],
    ['Rubella', 'D', SR, FR, 'Until 7 days after rash onset; keep away from pregnant women', 1],
    ['Serratia marcescens', 'C', SRH, NO, 'Local policy (neonatal units: outbreak control)', 0],
    ['Shingles (herpes zoster), localised', 'C', 'Single room if lesions cannot be covered', NO, 'Until lesions are crusted; non-immune staff should not care for the patient', 0],
    ['Shingles, disseminated (or immunocompromised)', 'A', NPR, FR, 'Until all lesions are crusted', 0],
    ['Staphylococcus aureus, enterotoxigenic (scalded skin, gastroenteritis)', 'C', 'Single room unless lesions can be covered', NO, 'Until lesions healed or 48 hours symptom-free', 0],
    ['Stenotrophomonas maltophilia', 'C', SRH, NO, 'Local policy', 0],
    ['STEC / VTEC (E. coli O157), HUS', 'C', SR, NO, GI + '; children under 5 and food handlers need microbiological clearance', 1],
    ['Streptococcus pneumoniae: pneumonia', 'D', SR + ' until established on treatment', FR, ABX, 0],
    ['Streptococcus pneumoniae: bacteraemia, meningitis, other sites', 'C', SR + ' until established on treatment', NO, ABX, 0],
    ['Group A streptococcus: respiratory', 'D', SR + ' until established on treatment', FR, ABX, 0],
    ['Group A streptococcus: invasive (iGAS)', 'C', SR + ' until established on treatment', NO, ABX + '; also notify for contact tracing', 1],
    ['Tuberculosis: pulmonary or laryngeal', 'A', NPR + ' (MDR/XDR TB: transfer to a specialist centre if no negative pressure room)', FF, 'Smear-positive: until 2 weeks of effective treatment with clinical improvement (local policy may require negative smears); MDR TB: until culture negative', 1],
    ['Tuberculosis: extrapulmonary only', '', 'No isolation needed (exclude pulmonary TB)', 'Risk assessment for procedures on lesions (e.g. abscess drainage)', 'Not applicable', 1],
    ['VRE / GRE', 'C', 'Local policy (prioritise a single room if diarrhoea or wounds)', NO, 'Not in NIPCM Appendix 11: local policy', 0],
    ['Viral haemorrhagic fever or other HCID', 'CDA', 'High-level isolation: follow the HCID pathway', 'Enhanced PPE per HCID guidance', 'Specialist infectious diseases and HCID network', 1]
  ];
  var TAG = { C: ['Contact', 'c'], D: ['Droplet', 'd'], A: ['Airborne', 'a'] };
  var st = { q: '', f: 'All' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tags(t) { return t ? t.split('').map(function (k) { return '<span class="iso-tag ' + TAG[k][1] + '">' + TAG[k][0] + '</span>'; }).join('') : '<span class="iso-tag n">None</span>'; }
  function draw(keep) {
    var q = st.q.toLowerCase().trim();
    var h = '<div class="ab-bar"><input id="iso-q" type="search" placeholder="Filter infections…" value="' + esc(st.q) + '" aria-label="Filter infections" autocomplete="off"><div class="ab-aw">' +
      [['All', 'All'], ['C', 'Contact'], ['D', 'Droplet'], ['A', 'Airborne']].map(function (o) { return '<button type="button" class="sp-chip' + (st.f === o[0] ? ' on' : '') + '" data-f="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    var rows = D.filter(function (d) { return (st.f === 'All' || d[1].indexOf(st.f) !== -1) && (!q || d[0].toLowerCase().indexOf(q) !== -1); });
    h += '<div class="sp-scroll"><table class="cov-tbl pg-tbl iso-tbl"><thead><tr><th>Infection</th><th>Precautions</th><th>Room</th><th>Staff RPE</th><th>Typical duration</th></tr></thead><tbody>';
    rows.forEach(function (d) {
      h += '<tr><th scope="row">' + esc(d[0]) + (d[5] ? '<span class="pg-cls">Notifiable</span>' : '') + '</th><td>' + tags(d[1]) + '</td><td>' + esc(d[2]) + '</td><td>' + esc(d[3]) + '</td><td class="cov-why">' + esc(d[4]) + '</td></tr>';
    });
    if (!rows.length) h += '<tr><td colspan="5" class="ir-empty">No match.</td></tr>';
    host.innerHTML = h + '</tbody></table></div>';
    if (keep) { var i = host.querySelector('#iso-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('input', function (e) { if (e.target.id === 'iso-q') { st.q = e.target.value; draw(e.target.selectionStart || st.q.length); } });
  host.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) { st.f = b.getAttribute('data-f'); draw(); } });
  draw();
})();
