/* Lab test finder: which sample, how to collect and send it, and which national reference laboratory does the test.
   Sample types and handling from UK SMIs, UKHSA reference laboratory user manuals and national guidance (BASHH, NICE NG33, UKHSA).
   Tube colours and local routing differ between laboratories: always check the local pathology handbook. */
(function () {
  var host = document.getElementById('lab');
  if (!host) return;
  var RIPL = 'UKHSA Rare and Imported Pathogens Laboratory (RIPL), Porton Down';
  var LOCAL = 'Local laboratory';
  // [test, category, sample, how to collect and send, where, search terms]
  var D = [
    ['Blood cultures', 'Blood and sterile sites', 'Aerobic and anaerobic blood culture bottles', '8–10 ml per bottle; 2 sets from separate venepunctures before antibiotics. Tell the lab if you suspect Brucella, HACEK, fungi or endocarditis (longer incubation).', LOCAL, 'bacteraemia sepsis bottles'],
    ['CSF', 'Blood and sterile sites', 'Sterile universal containers, numbered in order; fluoride tube for paired blood glucose', 'Send at least 3 numbered samples (cell count on the last); take blood glucose at the same time. Ask for PCR (bacterial, HSV, VZV, enterovirus), CrAg, AFB and TB PCR as indicated; send extra CSF to be stored. Deliver by hand at once.', LOCAL + '; meningococcal PCR to the UKHSA Meningococcal Reference Unit, Manchester', 'lumbar puncture lp meningitis encephalitis cryptococcal'],
    ['Joint fluid', 'Blood and sterile sites', 'Sterile container (plus a blood culture bottle)', 'Send for cell count, Gram stain, culture and crystals. Inoculating a blood culture bottle improves yield, but keep some fluid in a sterile container.', LOCAL, 'septic arthritis aspirate synovial'],
    ['Ascitic fluid', 'Blood and sterile sites', 'EDTA tube for cell count; blood culture bottles', 'Inoculate 10 ml into each blood culture bottle at the bedside. Neutrophils ≥ 250/mm³ means SBP.', LOCAL, 'sbp paracentesis peritonitis'],
    ['Tissue or sterile fluid for 16S rRNA PCR', 'Blood and sterile sites', 'Fresh tissue or fluid in a sterile container (not formalin, not swabs)', 'For culture-negative infection (heart valve, joint, bone, abscess), especially after antibiotics. Ask the lab to store the sample if unsure.', 'Reference molecular laboratory via the local lab', '16s pcr culture negative valve endocarditis broad range'],
    ['Urine culture', 'Urine', 'Boric acid container (or plain sterile container if delivered quickly)', 'Midstream urine; catheter samples from the sampling port, not the bag. Not for asymptomatic catheterised patients.', LOCAL, 'uti msu csu'],
    ['Legionella urinary antigen', 'Urine', 'Plain urine container', 'Detects L. pneumophila serogroup 1 only: also send sputum or lower respiratory samples for Legionella culture and PCR. Notifiable.', LOCAL + '; isolates to UKHSA reference laboratory', 'legionnaires pneumonia'],
    ['Pneumococcal urinary antigen', 'Urine', 'Plain urine container', 'For moderate to high severity pneumonia. Can stay positive for weeks after infection.', LOCAL, 'pneumonia pneumococcus streptococcus'],
    ['Sputum culture', 'Respiratory', 'Sterile container', 'A purulent sample, ideally before antibiotics. Saliva is not useful.', LOCAL, 'pneumonia chest'],
    ['TB samples (sputum, BAL, tissue, urine)', 'Respiratory', 'Sterile containers; tissue in sterile saline, never formalin', '3 sputum samples (at least one early morning, 5–10 ml), or induced sputum or BAL. Early morning urine × 3 for renal TB. No swabs. Ask for rapid molecular testing (rifampicin resistance) if risk factors.', LOCAL + '; isolates to the UKHSA National Mycobacterium Reference Service (WGS, susceptibility)', 'tuberculosis afb mycobacteria smear culture genexpert'],
    ['IGRA (QuantiFERON or T-SPOT.TB)', 'Respiratory', 'Assay-specific tubes or lithium heparin (check locally)', 'Time-critical: must reach the lab within the assay’s window, so take it early in the week and early in the day. Indeterminate results are common with lymphopenia or steroids.', LOCAL, 'latent tb quantiferon tspot interferon gamma'],
    ['Respiratory virus PCR', 'Respiratory', 'Nose and throat swab (combined) in viral transport medium; or BAL', 'Influenza, RSV, SARS-CoV-2 and multiplex panels by local policy. Nasopharyngeal aspirate in infants.', LOCAL, 'flu influenza covid rsv viral swab'],
    ['Pneumocystis PCR', 'Respiratory', 'BAL (best) or induced sputum', 'Upper respiratory samples are less sensitive. Serum beta-D-glucan supports the diagnosis.', LOCAL + ' or regional mycology laboratory', 'pcp pneumocystis jirovecii'],
    ['Pertussis', 'Respiratory', 'Nasopharyngeal (pernasal) swab for PCR; serum for serology; oral fluid kit for children', 'PCR within 2–3 weeks of cough onset. After 2 weeks: anti-pertussis toxin IgG serology (from age 17) or oral fluid (5–16 years). Notifiable.', LOCAL + '; UKHSA Respiratory and Vaccine Preventable Bacteria Reference Unit', 'whooping cough bordetella'],
    ['Diphtheria', 'Respiratory', 'Throat, nasopharyngeal and any skin lesion swabs', 'Warn the lab (toxin testing is urgent). Notify on suspicion.', 'UKHSA Respiratory and Vaccine Preventable Bacteria Reference Unit', 'corynebacterium diphtheriae ulcerans toxin'],
    ['C. difficile', 'Gut', 'Plain stool container', 'Unformed stool only (takes the shape of the container). GDH or toxin gene PCR first, then toxin test. Do not test for clearance.', LOCAL, 'cdiff cdi diarrhoea toxin gdh'],
    ['Stool culture and gastrointestinal PCR', 'Gut', 'Plain stool container', 'Give clinical details and travel history: they decide which targets are tested. STEC isolates go to the reference laboratory.', LOCAL + '; UKHSA Gastrointestinal Bacteria Reference Unit for typing', 'diarrhoea salmonella shigella campylobacter stec e coli o157'],
    ['Stool ova, cysts and parasites', 'Gut', 'Plain stool container', 'Ask specifically for parasites, with travel details. Some labs use PCR panels; microscopy may need 3 samples on separate days.', LOCAL + '; UKHSA Parasitology Reference Laboratory (Hospital for Tropical Diseases)', 'ocp giardia cryptosporidium amoebiasis worms helminths'],
    ['Norovirus PCR', 'Gut', 'Plain stool container (vomit also accepted by some labs)', 'Send from the first cases in a possible outbreak; inform IPC.', LOCAL, 'norovirus outbreak vomiting'],
    ['Malaria', 'Travel and zoonoses', 'EDTA blood', 'Thick and thin films plus a rapid antigen test the same day. If negative, repeat at 12–24 hours and again 24 hours later (3 sets).', LOCAL + '; UKHSA Malaria Reference Laboratory for confirmation', 'plasmodium falciparum films rdt'],
    ['Dengue, chikungunya and Zika', 'Travel and zoonoses', 'Clotted blood (serum) and EDTA blood', 'PCR and dengue NS1 antigen in the first week of illness; serology after that. Put travel dates and places on the form.', LOCAL + ' (dengue NS1 in some labs); ' + RIPL, 'arbovirus fever traveller'],
    ['Viral haemorrhagic fever', 'Travel and zoonoses', 'Do not send without discussion', 'Follow the ACDP VHF risk assessment; samples only after discussion with the microbiologist and the Imported Fever Service.', RIPL, 'ebola lassa marburg cchf hcid'],
    ['Rickettsial infection', 'Travel and zoonoses', 'Clotted blood (serum); eschar swab or biopsy', 'Paired acute and convalescent serology (2–4 weeks apart); eschar PCR is most useful early.', RIPL, 'tick typhus scrub african tick bite fever eschar'],
    ['Leptospirosis', 'Travel and zoonoses', 'EDTA blood and urine (PCR); clotted blood (serology)', 'PCR on blood in the first week and urine after that; serology from about day 5–7, repeated.', RIPL, 'weil disease leptospira rats flood'],
    ['Brucellosis', 'Travel and zoonoses', 'Blood cultures and clotted blood (serology)', 'Warn the lab: hazard group 3 (laboratory-acquired infection risk); cultures need longer incubation.', LOCAL + '; UKHSA Brucella Reference Unit, Liverpool', 'brucella unpasteurised dairy'],
    ['Q fever (Coxiella burnetii)', 'Travel and zoonoses', 'Clotted blood (serum); EDTA blood for early PCR', 'Phase I and II antibodies; phase I IgG suggests persistent infection (e.g. culture-negative endocarditis).', RIPL, 'coxiella culture negative endocarditis farm'],
    ['Lyme disease', 'Travel and zoonoses', 'Clotted blood (serum); paired CSF and serum for neuroborreliosis', 'Not needed for erythema migrans (treat clinically). Antibodies may be negative in the first 4 weeks: repeat if needed.', LOCAL + ' (screening); ' + RIPL + ' (confirmation)', 'borrelia tick erythema migrans'],
    ['Bartonella', 'Travel and zoonoses', 'Clotted blood (serum); valve or lymph node tissue for PCR', 'Culture-negative endocarditis, cat-scratch disease, bacillary angiomatosis.', RIPL, 'cat scratch culture negative endocarditis'],
    ['Strongyloides serology', 'Travel and zoonoses', 'Clotted blood (serum)', 'Screen people from endemic areas before steroids or other immunosuppression; eosinophilia may be absent.', LOCAL + ' or UKHSA Parasitology Reference Laboratory', 'strongyloides eosinophilia screening immunosuppression'],
    ['Schistosomiasis', 'Travel and zoonoses', 'Clotted blood (serum); terminal urine; stool', 'Serology from 6–12 weeks after freshwater exposure. Midday terminal urine for S. haematobium eggs.', LOCAL + ' or UKHSA Parasitology Reference Laboratory', 'bilharzia katayama freshwater'],
    ['Toxoplasma serology', 'Travel and zoonoses', 'Clotted blood (serum)', 'IgG and IgM; avidity testing in pregnancy to date infection. PCR on amniotic fluid, CSF or vitreous in specialist cases.', 'Toxoplasma Reference Laboratory, Swansea (via the local lab)', 'toxoplasmosis pregnancy cerebral'],
    ['HIV test', 'Sexual health and blood-borne viruses', 'Clotted blood (serum)', 'Fourth-generation antigen and antibody test; window period about 45 days. Viral load and resistance in EDTA blood.', LOCAL, 'hiv antibody antigen viral load'],
    ['Hepatitis B', 'Sexual health and blood-borne viruses', 'Clotted blood (serum); EDTA for HBV DNA', 'HBsAg, anti-HBc and anti-HBs. Screen before chemotherapy, rituximab and other immunosuppression (reactivation risk).', LOCAL, 'hbv hbsag core surface reactivation'],
    ['Hepatitis C', 'Sexual health and blood-borne viruses', 'Clotted blood (serum); EDTA for HCV RNA', 'Antibody, then HCV RNA or core antigen to confirm current infection.', LOCAL, 'hcv antibody rna'],
    ['Hepatitis A and E', 'Sexual health and blood-borne viruses', 'Clotted blood (serum); EDTA blood or stool for HEV RNA', 'Hepatitis A IgM; hepatitis E IgM and IgG, with HEV RNA in immunosuppressed patients (chronic infection).', LOCAL + '; UKHSA Virus Reference Department for confirmation', 'hav hev hepatitis acute'],
    ['Syphilis serology', 'Sexual health and blood-borne viruses', 'Clotted blood (serum)', 'Treponemal screen with confirmation and RPR. See the syphilis serology guide for interpretation.', LOCAL, 'treponema rpr tppa tpha'],
    ['Chlamydia and gonorrhoea NAAT', 'Sexual health and blood-borne viruses', 'First-void urine (men); vulvovaginal swab (women); rectal and pharyngeal swabs', 'Gonorrhoea NAAT positives need culture before treatment where possible (resistance).', LOCAL, 'sti chlamydia gonorrhoea gc ct'],
    ['Gonorrhoea culture', 'Sexual health and blood-borne viruses', 'Swab in charcoal transport medium (or direct plating in clinic)', 'Must reach the lab quickly (same day). Needed for susceptibility testing.', LOCAL + '; resistant isolates to the UKHSA reference laboratory', 'neisseria gonorrhoeae culture susceptibility'],
    ['HSV and VZV lesion PCR', 'Sexual health and blood-borne viruses', 'Swab of the base of a vesicle or ulcer in viral transport medium', 'Unroof the vesicle. For VZV contacts, serology (VZV IgG) is a separate clotted sample.', LOCAL, 'herpes shingles chickenpox ulcer'],
    ['Treponema pallidum PCR', 'Sexual health and blood-borne viruses', 'Lesion swab', 'For a possible chancre or other early lesion, alongside serology.', LOCAL + ' or reference laboratory', 'syphilis chancre ulcer'],
    ['Mpox PCR', 'Sexual health and blood-borne viruses', 'Lesion swab (roof or fluid) in viral transport medium', 'Discuss with the microbiologist before sending; label as high risk.', LOCAL + ' or UKHSA reference laboratory', 'monkeypox lesion'],
    ['CMV, EBV and adenovirus viral load', 'Virology', 'EDTA blood', 'For transplant and immunosuppressed monitoring; also CSF or BAL PCR where relevant.', LOCAL, 'cmv ebv adenovirus pcr transplant'],
    ['VZV IgG (immunity)', 'Virology', 'Clotted blood (serum)', 'Urgent for post-exposure decisions in pregnancy and immunosuppression.', LOCAL, 'chickenpox varicella immunity contact pep'],
    ['Measles', 'Virology', 'Oral fluid kit (from the health protection team) or throat swab for PCR; clotted blood for IgM', 'Notify on suspicion: the HPT arranges oral fluid testing.', LOCAL + '; UKHSA Virus Reference Department', 'rash koplik mmr'],
    ['Mumps', 'Virology', 'Buccal swab (over Stensen’s duct) for PCR; oral fluid', 'Massage the parotid first. Notify on suspicion.', LOCAL + '; UKHSA Virus Reference Department', 'parotitis mumps'],
    ['Parvovirus B19', 'Virology', 'Clotted blood (serum); EDTA for PCR', 'IgM and IgG; PCR in pregnancy, aplastic crisis or immunosuppression.', LOCAL, 'slapped cheek fifth disease pregnancy'],
    ['Galactomannan', 'Fungal', 'Clotted blood (serum) or BAL', 'Serum accuracy falls if the sample is over 2 days old. See the fungal markers page for interpretation.', LOCAL + ' or regional mycology laboratory', 'aspergillus gm ipa'],
    ['Beta-D-glucan', 'Fungal', 'Clotted blood (serum)', 'Collect carefully (contamination is easy); false positives with IV albumin and immunoglobulin.', 'Regional mycology laboratory', 'bdg fungitell candida pcp'],
    ['Cryptococcal antigen (CrAg)', 'Fungal', 'Clotted blood (serum) or CSF', 'Screen serum in advanced HIV (CD4 < 100–200); positive serum CrAg needs an LP.', LOCAL, 'cryptococcus crag lfa'],
    ['Aspergillus PCR', 'Fungal', 'Serum, whole blood or BAL (check locally)', 'Use alongside galactomannan.', 'Regional mycology laboratory', 'aspergillus pcr'],
    ['Histoplasma antigen', 'Fungal', 'Urine and serum', 'For suspected disseminated histoplasmosis (travel, HIV).', 'UKHSA Mycology Reference Laboratory, Bristol, or regional mycology centre', 'histoplasmosis endemic fungi'],
    ['Fungal identification and susceptibility', 'Fungal', 'Isolates (sent by the local lab); tissue or BAL for culture', 'Request susceptibility for invasive isolates, azole-exposed patients and Candida auris.', 'UKHSA Mycology Reference Laboratory, Bristol', 'antifungal susceptibility mic candida auris mould'],
    ['Antifungal levels', 'Drug levels', 'Clotted blood or as the lab specifies', 'Voriconazole and posaconazole trough at day 2–5 (posaconazole day 5–7); flucytosine 2 hours after a dose. See the antifungals page for targets.', LOCAL + ' or specialist reference laboratory', 'tdm voriconazole posaconazole itraconazole flucytosine'],
    ['Gentamicin, vancomycin and teicoplanin levels', 'Drug levels', 'Clotted blood (serum), or as the lab specifies', 'Record the exact dose and sample times on the form. Teicoplanin levels may be sent away.', LOCAL, 'aminoglycoside glycopeptide tdm trough auc'],
    ['MRSA screen', 'Screening and IPC', 'Swabs: nose, plus groin or perineum and any wounds (local policy)', 'On admission for high-risk groups and before some surgery.', LOCAL, 'mrsa screening decolonisation'],
    ['CPE screen', 'Screening and IPC', 'Rectal swab with visible faecal material, or stool', 'For previous carriers, contacts, and admissions from hospitals abroad or high-prevalence units. Number and timing of screens by local policy.', LOCAL + '; confirmation by UKHSA AMRHAI', 'carbapenemase kpc oxa-48 ndm screening'],
    ['Candida auris screen', 'Screening and IPC', 'Combined axilla and groin swab, plus other sites (nose, wounds, urine, lines)', 'For contacts and transfers from affected units; local policy decides frequency.', LOCAL + '; UKHSA Mycology Reference Laboratory', 'auris candidozyma screening'],
    ['Carbapenemase confirmation and unusual resistance', 'Reference and typing', 'Bacterial isolate (sent by the local lab)', 'Unusual or new resistance, colistin or cefiderocol resistance, and confirmation of carbapenemases.', 'UKHSA Antimicrobial Resistance and Healthcare Associated Infections (AMRHAI) Reference Unit', 'amrhai carbapenemase resistance colistin'],
    ['Outbreak typing (whole-genome sequencing)', 'Reference and typing', 'Bacterial isolates (sent by the local lab)', 'Requested by IPC or the health protection team when transmission is suspected.', 'UKHSA reference units (e.g. GBRU, AMRHAI)', 'wgs typing outbreak snp']
  ];
  var CATS = ['All'];
  D.forEach(function (d) { if (CATS.indexOf(d[1]) === -1) CATS.push(d[1]); });
  var st = { q: '', c: 'All' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function draw(keep) {
    var words = st.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var h = '<div class="ab-bar"><input id="lab-q" type="search" placeholder="Search tests, organisms or samples…" value="' + esc(st.q) + '" aria-label="Search tests" autocomplete="off"><div class="ab-aw">' +
      CATS.map(function (c) { return '<button type="button" class="sp-chip' + (st.c === c ? ' on' : '') + '" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div></div>';
    var rows = D.filter(function (d) {
      if (st.c !== 'All' && d[1] !== st.c) return false;
      var hay = d.join(' ').toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
    h += '<div class="sp-scroll"><table class="cov-tbl pg-tbl lab-tbl"><thead><tr><th>Test</th><th>Sample</th><th>How to send</th><th>Where</th></tr></thead><tbody>';
    rows.forEach(function (d) {
      h += '<tr><th scope="row">' + esc(d[0]) + '<span class="pg-cls">' + esc(d[1]) + '</span></th><td>' + esc(d[2]) + '</td><td>' + esc(d[3]) + '</td><td>' + esc(d[4]) + '</td></tr>';
    });
    if (!rows.length) h += '<tr><td colspan="4" class="ir-empty">No match. Check the local pathology handbook.</td></tr>';
    host.innerHTML = h + '</tbody></table></div>';
    if (keep) { var i = host.querySelector('#lab-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('input', function (e) { if (e.target.id === 'lab-q') { st.q = e.target.value; draw(e.target.selectionStart || st.q.length); } });
  host.addEventListener('click', function (e) { var c = e.target.closest('[data-c]'); if (c) { st.c = c.getAttribute('data-c'); draw(); } });
  draw();
})();
