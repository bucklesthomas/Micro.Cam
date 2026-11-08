/*
 * Endocarditis therapy guide — decision tree.
 * Checked against the 2023 ESC Guidelines for the management of endocarditis
 * (Delgado V et al. Eur Heart J 2023;44:3948): Recommendation Tables 7–10, Table 11 and Section 7.
 *
 * Questions: { q, options: [{ label, sub?, next }] }   next = another question id or a result id
 * Results:   { title, verify?: 'message', regimens: [{ name?, cls?, items: [{ drug, dose, dur }] }], notes: [...] }
 *            cls = ESC class and level of evidence, e.g. 'I B'
 */
(function () {
  var D = {
    penS:    'Benzylpenicillin 12–18 million units/day IV (7.2–10.8 g/day) in 4–6 doses or continuously',
    penR:    'Benzylpenicillin 24 million units/day IV (14.4 g/day) in 4–6 doses or continuously',
    amox:    'Amoxicillin 12 g/day IV in 4–6 doses',
    amp:     'Ampicillin 12 g/day IV in 4–6 doses',
    cro:     'Ceftriaxone 2 g/day IV in 1 dose',
    croE:    'Ceftriaxone 4 g/day IV in 2 doses',
    gent:    'Gentamicin 3 mg/kg/day IV or IM in 1 dose',
    gentSt:  'Gentamicin 3 mg/kg/day IV or IM in 1 (preferred) or 2 doses',
    gentH:   'Gentamicin 3 mg/kg/day IV, divided into 2 or 3 doses',
    vanc:    'Vancomycin 30 mg/kg/day IV in 2 doses',
    vancSt:  'Vancomycin 30–60 mg/kg/day IV in 2–3 doses',
    fluclox: 'Flucloxacillin 12 g/day IV in 4–6 doses',
    clox6:   'Cloxacillin 12 g/day IV in 6 doses',
    cefaz:   'Cefazolin 6 g/day IV in 3 doses',
    dapto:   'Daptomycin 10 mg/kg/day IV in 1 dose',
    ceftar:  'Ceftaroline 1800 mg/day IV in 3 doses',
    fosfo:   'Fosfomycin 8–12 g/day IV in 4 doses',
    rif900:  'Rifampicin 900 mg/day IV or orally in 3 doses',
    rif:     'Rifampicin 900–1200 mg/day IV or orally in 2–3 doses',
    cipro:   'Ciprofloxacin 400 mg IV 8–12-hourly, or 750 mg orally 12-hourly'
  };

  var N = {
    duration: 'Count the course from the first day of effective therapy (the first negative blood culture if cultures were positive), not from the day of surgery. Start a new full course only if valve cultures are positive.',
    gent: 'Gentamicin: maximum 240 mg/day. Monitor renal function and levels weekly; once daily, aim for a pre-dose level < 1 mg/L and a 1-hour peak of about 10–12 mg/L.',
    vanc: 'Vancomycin: aim for a pre-dose level of 10–15 mg/L (some experts aim for 15–20 mg/L, as in staphylococcal IE). For MRSA, ESC recommends an AUC/MIC target of 400–600 mg·h/L.',
    oral: 'From day 10 of IV therapy (and ≥ 7 days after surgery), OPAT or step-down to a two-drug oral regimen can be considered (class IIa, level A) for streptococci, E. faecalis, S. aureus or CoNS if: no fever for > 2 days, CRP < 25% of its peak or < 20 mg/L, white cells < 15 × 10⁹/L, no other reason for IV therapy, BMI ≤ 40, normal gut absorption, and TOE shows no new indication for surgery.',
    team: 'Discuss with microbiology/ID and the Endocarditis Team.',
    rif: 'Rifampicin: add after 3–5 days of effective therapy, once the bacteraemia has cleared. Check interactions and liver function.',
    desens: 'For beta-lactam allergy, ESC recommends desensitisation where possible. A cephalosporin can be used if the reaction was not anaphylactic.',
    fosfo: 'Fosfomycin carries a high sodium load and can precipitate acute heart failure.',
    ceftar: 'Ceftaroline and cefazolin can replace flucloxacillin only after a non-immediate (delayed) penicillin reaction. High-dose ceftaroline can cause leucopenia after 2 weeks.',
    renal: 'Adjust doses to weight and renal function; check local guidelines.'
  };

  var Q = {
    start: {
      q: 'What organism has been isolated?',
      options: [
        { label: 'Not known yet', sub: 'Empirical therapy', next: 'emp_setting' },
        { label: 'Streptococcus', sub: 'Including S. gallolyticus, pneumococcus, β-haemolytic', next: 'strep_type' },
        { label: 'Staphylococcus', sub: 'S. aureus or CoNS', next: 'staph_valve' },
        { label: 'Enterococcus', sub: 'E. faecalis or E. faecium', next: 'ent_amox' },
        { label: 'HACEK', sub: 'Haemophilus, Aggregatibacter, Cardiobacterium, Eikenella, Kingella', next: 'hacek_bl' },
        { label: 'Culture-negative', sub: 'No growth despite cultures', next: 'R_culneg' }
      ]
    },

    /* ── Empirical ───────────────────────────── */
    emp_setting: {
      q: 'What is the setting?',
      options: [
        { label: 'Community-acquired', sub: 'Native valve, or prosthetic valve ≥ 12 months after surgery', next: 'emp_allergy' },
        { label: 'Early prosthetic or healthcare-associated', sub: 'Prosthetic valve < 12 months after surgery, or nosocomial / healthcare-associated', next: 'R_emp_hc' }
      ]
    },
    emp_allergy: { q: 'Penicillin allergy?', options: [
      { label: 'No', next: 'R_emp_ca' },
      { label: 'Yes', next: 'R_emp_ca_allergy' } ] },

    /* ── Streptococci ────────────────────────── */
    strep_type: {
      q: 'Which streptococcus?',
      options: [
        { label: 'Oral streptococcus or S. gallolyticus', sub: 'Viridans group: mitis, sanguinis, salivarius, mutans; S. bovis group', next: 'strep_mic' },
        { label: 'β-haemolytic or S. anginosus group', sub: 'Groups A, B, C, G; S. anginosus, constellatus, intermedius', next: 'R_strep_bhs' },
        { label: 'S. pneumoniae', next: 'R_strep_pneumo' },
        { label: 'Granulicatella or Abiotrophia', sub: 'Formerly nutritionally variant streptococci', next: 'R_strep_nvs' }
      ]
    },
    strep_mic: {
      q: 'Penicillin susceptibility?',
      options: [
        { label: 'Susceptible', sub: 'Penicillin S (standard dosing)', next: 'strepS_valve' },
        { label: 'Increased exposure or resistant', sub: 'Penicillin I or R', next: 'strepR_valve' }
      ]
    },
    strepS_valve: { q: 'Which valve?', options: [
      { label: 'Native', next: 'strepS_nat_allergy' },
      { label: 'Prosthetic', next: 'strepS_pro_allergy' } ] },
    strepS_nat_allergy: { q: 'Beta-lactam allergy?', options: [
      { label: 'No', next: 'R_strepS_nat' },
      { label: 'Yes', next: 'R_strepS_nat_allergy' } ] },
    strepS_pro_allergy: { q: 'Beta-lactam allergy?', options: [
      { label: 'No', next: 'R_strepS_pro' },
      { label: 'Yes', next: 'R_strepS_pro_allergy' } ] },
    strepR_valve: { q: 'Which valve?', options: [
      { label: 'Native', next: 'strepR_nat_allergy' },
      { label: 'Prosthetic', next: 'strepR_pro_allergy' } ] },
    strepR_nat_allergy: { q: 'Beta-lactam allergy?', options: [
      { label: 'No', next: 'R_strepR_nat' },
      { label: 'Yes', next: 'R_strepR_nat_allergy' } ] },
    strepR_pro_allergy: { q: 'Beta-lactam allergy?', options: [
      { label: 'No', next: 'R_strepR_pro' },
      { label: 'Yes', next: 'R_strepR_pro_allergy' } ] },

    /* ── Staphylococci ───────────────────────── */
    staph_valve: { q: 'Which valve?', options: [
      { label: 'Native', next: 'staph_nat_meth' },
      { label: 'Prosthetic', next: 'staph_pro_meth' } ] },
    staph_nat_meth: { q: 'Methicillin susceptibility?', options: [
      { label: 'Methicillin-susceptible', sub: 'MSSA / MS-CoNS', next: 'staph_nat_allergy' },
      { label: 'Methicillin-resistant', sub: 'MRSA / MR-CoNS', next: 'R_staph_nat_mr' } ] },
    staph_pro_meth: { q: 'Methicillin susceptibility?', options: [
      { label: 'Methicillin-susceptible', sub: 'MSSA / MS-CoNS', next: 'staph_pro_allergy' },
      { label: 'Methicillin-resistant', sub: 'MRSA / MR-CoNS', next: 'R_staph_pro_mr' } ] },
    staph_nat_allergy: { q: 'Penicillin allergy?', options: [
      { label: 'No', next: 'R_staph_nat_ms' },
      { label: 'Yes, non-immediate reaction', sub: 'Delayed reaction, e.g. late rash; no anaphylaxis, urticaria or angioedema', next: 'R_staph_nat_ms_mild' },
      { label: 'Yes, immediate-type reaction', sub: 'Anaphylaxis, urticaria, angioedema or bronchospasm', next: 'R_staph_nat_severe' } ] },
    staph_pro_allergy: { q: 'Penicillin allergy?', options: [
      { label: 'No', next: 'R_staph_pro_ms' },
      { label: 'Yes, non-immediate reaction', sub: 'Delayed reaction, e.g. late rash; no anaphylaxis, urticaria or angioedema', next: 'R_staph_pro_ms_mild' },
      { label: 'Yes, immediate-type reaction', sub: 'Anaphylaxis, urticaria, angioedema or bronchospasm', next: 'R_staph_pro_severe' } ] },

    /* ── Enterococci ─────────────────────────── */
    ent_amox: {
      q: 'Susceptibility?',
      options: [
        { label: 'Amoxicillin-susceptible', sub: 'Usually E. faecalis', next: 'ent_allergy' },
        { label: 'Beta-lactam resistant', sub: 'Usually E. faecium; vancomycin-susceptible', next: 'R_ent_amoxR' },
        { label: 'Vancomycin-resistant', sub: 'VRE', next: 'R_ent_vre' }
      ]
    },
    ent_allergy: { q: 'Penicillin allergy?', options: [
      { label: 'No', next: 'ent_hlar' },
      { label: 'Yes', next: 'R_ent_allergy' } ] },
    ent_hlar: {
      q: 'High-level aminoglycoside resistance (HLAR)?',
      options: [
        { label: 'No', sub: 'Gentamicin synergy possible', next: 'R_ent_noHLAR' },
        { label: 'Yes', sub: 'Gentamicin MIC > 128 mg/L', next: 'R_ent_HLAR' },
        { label: 'Not known yet', next: 'R_ent_HLAR' }
      ]
    },

    /* ── HACEK ───────────────────────────────── */
    hacek_bl: {
      q: 'Beta-lactamase production?',
      options: [
        { label: 'Producing, or not known', next: 'hacek_bl_valve' },
        { label: 'Non-producing', next: 'hacek_nbl_valve' }
      ]
    },
    hacek_bl_valve: { q: 'Which valve?', options: [
      { label: 'Native', next: 'R_hacek_bl_nat' },
      { label: 'Prosthetic', next: 'R_hacek_bl_pro' } ] },
    hacek_nbl_valve: { q: 'Which valve?', options: [
      { label: 'Native', next: 'R_hacek_nbl_nat' },
      { label: 'Prosthetic', next: 'R_hacek_nbl_pro' } ] }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }
  var oneOf = D.penS + '; or ' + D.amox + '; or ' + D.cro;
  var oneOfR = D.penR + '; or ' + D.amox + '; or ' + D.cro;

  var R = {
    /* Empirical — Recommendation Table 10 */
    R_emp_ca: {
      title: 'Empirical: community-acquired native valve or late prosthetic valve IE',
      regimens: [
        { name: 'Option 1', cls: 'IIa C', items: [I('Ampicillin', D.amp, 'Until organism identified'), I('plus Ceftriaxone', D.croE.replace('IV', 'IV or IM'), 'Until organism identified')] },
        { name: 'Option 2', cls: 'IIa C', items: [I('Ampicillin', D.amp, 'Until organism identified'), I('plus Flucloxacillin', D.fluclox, 'Until organism identified'), I('plus Gentamicin', D.gent, 'Until organism identified')] }
      ],
      notes: ['Take 3 sets of blood cultures 30 minutes apart before starting.', 'Covers staphylococci, streptococci and enterococci. If the patient was already on antibiotics, use different agents.', 'Switch to targeted therapy once the organism is identified, usually within 24–48 hours. If cultures stay negative with no response, consider culture-negative causes.', N.gent, N.team]
    },
    R_emp_ca_allergy: {
      title: 'Empirical: community-acquired IE with penicillin allergy',
      regimens: [
        { name: 'Option 1', cls: 'IIb C', items: [I('Cefazolin', D.cefaz, 'Until organism identified'), I('plus Gentamicin', D.gent, 'Until organism identified')] },
        { name: 'Option 2', cls: 'IIb C', items: [I('Vancomycin', D.vanc, 'Until organism identified'), I('plus Gentamicin', D.gent, 'Until organism identified')] }
      ],
      notes: ['Take 3 sets of blood cultures 30 minutes apart before starting.', 'Avoid cephalosporins after an immediate-type reaction (anaphylaxis, urticaria, angioedema).', N.gent, N.vanc, N.team]
    },
    R_emp_hc: {
      title: 'Empirical: early prosthetic valve or healthcare-associated IE',
      regimens: [
        { cls: 'IIb C', items: [I('Vancomycin or daptomycin', D.vanc + '; or ' + D.dapto, 'Until organism identified'), I('plus Gentamicin', D.gent, 'Until organism identified'), I('plus Rifampicin', D.rif, 'Until organism identified')] }
      ],
      notes: ['Should cover methicillin-resistant staphylococci and enterococci and, ideally, non-HACEK Gram-negatives: consider adding Gram-negative cover according to local epidemiology.', 'Take 3 sets of blood cultures 30 minutes apart before starting.', N.gent, N.vanc, N.team]
    },

    /* Oral streptococci and S. gallolyticus — Recommendation Table 7 */
    R_strepS_nat: {
      title: 'Penicillin-susceptible oral streptococcus or S. gallolyticus, native valve',
      regimens: [
        { name: 'Standard: 4 weeks', cls: 'I B', items: [I('One of', oneOf, '4 weeks')] },
        { name: 'Short course: 2 weeks', cls: 'I B', items: [I('Benzylpenicillin, amoxicillin or ceftriaxone', 'Doses as above', '2 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: ['The 2-week course is only for non-complicated native valve IE with normal renal function.', 'Benzylpenicillin: start at the lower dose and increase as needed.', 'S. gallolyticus: arrange colonoscopy.', N.gent, N.duration, N.oral]
    },
    R_strepS_pro: {
      title: 'Penicillin-susceptible oral streptococcus or S. gallolyticus, prosthetic valve',
      regimens: [{ cls: 'I B', items: [I('One of', oneOf, '6 weeks')] }],
      notes: ['The 2-week course does not apply to prosthetic valve IE.', 'S. gallolyticus: arrange colonoscopy.', N.duration, N.oral]
    },
    R_strepS_nat_allergy: {
      title: 'Penicillin-susceptible oral streptococcus or S. gallolyticus, native valve, beta-lactam allergy',
      regimens: [
        { name: 'Recommended', cls: 'I C', items: [I('Vancomycin', D.vanc, '4 weeks')] },
        { name: 'Alternative', items: [I('Teicoplanin', 'Loading 6 mg/kg IV 12-hourly for 3 days, then 6–10 mg/kg/day', '4 weeks')] }
      ],
      notes: [N.desens, N.vanc, N.duration, N.oral]
    },
    R_strepS_pro_allergy: {
      title: 'Penicillin-susceptible oral streptococcus or S. gallolyticus, prosthetic valve, beta-lactam allergy',
      regimens: [
        { name: 'Recommended', cls: 'I C', items: [I('Vancomycin', D.vanc, '6 weeks')] },
        { name: 'Alternative', items: [I('Teicoplanin', 'Loading 6 mg/kg IV 12-hourly for 3 days, then 6–10 mg/kg/day', '6 weeks')] }
      ],
      notes: [N.desens, N.vanc, N.duration, N.oral]
    },
    R_strepR_nat: {
      title: 'Oral streptococcus or S. gallolyticus, penicillin I or R, native valve',
      regimens: [{ cls: 'I B', items: [I('One of', oneOfR, '4 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Short 2-week courses are not recommended for these strains.', N.gent, N.duration, N.oral]
    },
    R_strepR_pro: {
      title: 'Oral streptococcus or S. gallolyticus, penicillin I or R, prosthetic valve',
      regimens: [{ cls: 'I B', items: [I('One of', oneOfR, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.gent, N.duration, N.oral]
    },
    R_strepR_nat_allergy: {
      title: 'Oral streptococcus or S. gallolyticus, penicillin I or R, native valve, beta-lactam allergy',
      regimens: [{ cls: 'I C', items: [I('Vancomycin', D.vanc, '4 weeks')] }],
      notes: [N.desens, N.vanc, N.duration]
    },
    R_strepR_pro_allergy: {
      title: 'Oral streptococcus or S. gallolyticus, penicillin I or R, prosthetic valve, beta-lactam allergy',
      regimens: [{ cls: 'I C', items: [I('Vancomycin', D.vanc, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.desens, N.gent, N.vanc, N.duration]
    },

    /* Other streptococci — Sections 7.4 and 7.5 */
    R_strep_bhs: {
      title: 'β-haemolytic streptococcus (groups A, B, C, G) or S. anginosus group',
      regimens: [{ items: [I('One of', oneOf + ' (as for oral streptococci)', '4 weeks native, 6 weeks prosthetic'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Treat as for oral streptococci, but short 2-week courses are not recommended and gentamicin should be given for 2 weeks.', 'Groups B, C, G and the S. anginosus group cause abscesses that often need surgery. Group B prosthetic valve IE has very high mortality: surgery is recommended.', 'Group A is uniformly beta-lactam susceptible; other groups may show some resistance, so check susceptibilities.', N.gent, N.duration, N.team]
    },
    R_strep_pneumo: {
      title: 'Streptococcus pneumoniae',
      regimens: [
        { name: 'Without meningitis', items: [I('One of', oneOf + ' (as for oral streptococci)', '4 weeks native, 6 weeks prosthetic')] },
        { name: 'With meningitis', items: [I('Ceftriaxone or cefotaxime', 'High-dose, meningitic dosing', '4 weeks native, 6 weeks prosthetic'), I('± Vancomycin', 'According to susceptibility', 'With the cephalosporin')] }
      ],
      notes: ['Short 2-week courses have not been studied and are not recommended.', 'With meningitis, avoid benzylpenicillin (poor CSF penetration).', 'For resistant strains, high-dose ceftriaxone or cefotaxime, or vancomycin, are suggested.', 'Consider OPAT or oral step-down after 10–14 days if stable and there is no meningitis.', N.duration, N.team]
    },
    R_strep_nvs: {
      title: 'Granulicatella or Abiotrophia',
      regimens: [{ items: [I('One of', D.penS + '; or ' + D.cro + '; or ' + D.vanc, '6 weeks'), I('plus Gentamicin (prosthetic valve)', D.gent, 'At least the first 2 weeks')] }],
      notes: ['These cause large vegetations and complications: around half need valve replacement.', N.gent, N.duration, N.team]
    },

    /* Staphylococci — Recommendation Table 8 */
    R_staph_nat_ms: {
      title: 'Methicillin-susceptible staphylococcus, native valve',
      regimens: [
        { name: 'Option 1', cls: 'I B', items: [I('Flucloxacillin', D.fluclox, '4–6 weeks')] },
        { name: 'Option 2', cls: 'I B', items: [I('Cefazolin', D.cefaz, '4–6 weeks')] }
      ],
      notes: ['Gentamicin is no longer recommended for staphylococcal native valve IE (more nephrotoxicity, no benefit).', 'Short 2-week or oral regimens have been used for uncomplicated right-sided MSSA IE, but not for left-sided IE.', N.duration, N.oral]
    },
    R_staph_nat_ms_mild: {
      title: 'Methicillin-susceptible staphylococcus, native valve, non-immediate penicillin allergy',
      regimens: [
        { name: 'Recommended', cls: 'I B', items: [I('Cefazolin', D.cefaz, '4–6 weeks')] },
        { name: 'Alternative', cls: 'IIb C', items: [I('Daptomycin', D.dapto, '4–6 weeks'), I('plus Ceftaroline or fosfomycin', D.ceftar + '; or ' + D.fosfo, '4–6 weeks')] }
      ],
      notes: ['Desensitisation can be attempted in stable patients. Vancomycin is inferior to beta-lactams for MSSA.', N.ceftar, N.fosfo, N.duration, N.oral]
    },
    R_staph_nat_severe: {
      title: 'Methicillin-susceptible staphylococcus, native valve, immediate-type penicillin allergy',
      regimens: [
        { cls: 'IIb C', items: [I('Daptomycin', D.dapto, '4–6 weeks'), I('plus Fosfomycin', D.fosfo, '4–6 weeks')] }
      ],
      notes: ['Cefazolin and ceftaroline are not suitable after an immediate-type reaction.', 'Desensitisation can be attempted in stable patients. Vancomycin is inferior to beta-lactams for MSSA, so ESC suggests daptomycin with a second agent when beta-lactams cannot be given.', N.fosfo, N.duration, N.team]
    },
    R_staph_nat_mr: {
      title: 'Methicillin-resistant staphylococcus, native valve',
      regimens: [
        { name: 'Recommended', cls: 'I B', items: [I('Vancomycin', D.vancSt, '4–6 weeks')] },
        { name: 'Alternative', cls: 'IIb C', items: [I('Daptomycin', D.dapto, '4–6 weeks'), I('plus Cloxacillin, ceftaroline or fosfomycin', D.clox6 + '; or ' + D.ceftar + '; or ' + D.fosfo, '4–6 weeks')] }
      ],
      notes: ['Gentamicin is not recommended for staphylococcal native valve IE.', 'If the vancomycin MIC is > 1 mg/L, an adequate AUC/MIC is unlikely: consider changing therapy.', 'Other options (fosfomycin plus imipenem, linezolid-based or co-trimoxazole plus clindamycin regimens) need Endocarditis Team input.', N.vanc, N.fosfo, N.duration, N.team]
    },
    R_staph_pro_ms: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve',
      regimens: [{ cls: 'I B', items: [I('Flucloxacillin or cefazolin', D.fluclox + '; or ' + D.cefaz, '≥ 6 weeks'), I('plus Rifampicin', D.rif900, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] }],
      notes: [N.rif, N.gent, N.duration, N.team]
    },
    R_staph_pro_ms_mild: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve, non-immediate penicillin allergy',
      regimens: [
        { name: 'Recommended', cls: 'I B', items: [I('Cefazolin', D.cefaz, '≥ 6 weeks'), I('plus Rifampicin', D.rif900, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] },
        { name: 'Alternative', cls: 'IIb C', items: [I('Daptomycin', D.dapto, '≥ 6 weeks'), I('plus Ceftaroline or fosfomycin', D.ceftar + '; or ' + D.fosfo, '≥ 6 weeks'), I('plus Rifampicin', D.rif900, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] }
      ],
      notes: [N.rif, N.ceftar, N.gent, N.duration, N.team]
    },
    R_staph_pro_severe: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve, immediate-type penicillin allergy',
      regimens: [{ cls: 'IIb C', items: [I('Daptomycin', D.dapto, '≥ 6 weeks'), I('plus Fosfomycin', D.fosfo, '≥ 6 weeks'), I('plus Rifampicin', D.rif900, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] }],
      notes: ['Cefazolin and ceftaroline are not suitable after an immediate-type reaction.', 'ESC lists daptomycin with ceftaroline or fosfomycin, or with gentamicin, plus rifampicin; fosfomycin is shown here because ceftaroline needs a non-immediate allergy.', N.rif, N.fosfo, N.gent, N.duration, N.team]
    },
    R_staph_pro_mr: {
      title: 'Methicillin-resistant staphylococcus, prosthetic valve',
      regimens: [
        { name: 'Recommended', cls: 'I B', items: [I('Vancomycin', D.vancSt, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] },
        { name: 'Alternative', items: [I('Daptomycin', D.dapto, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gentSt, '2 weeks')] }
      ],
      notes: ['The daptomycin alternative is described in the ESC text (Section 7.7) rather than the recommendation table.', N.rif, N.vanc, N.gent, N.duration, N.team]
    },

    /* Enterococci — Recommendation Table 9 */
    R_ent_noHLAR: {
      title: 'Amoxicillin-susceptible enterococcus, no HLAR',
      regimens: [
        { name: 'Option 1', cls: 'I B', items: [I('Amoxicillin or ampicillin', D.amox + '; or ' + D.amp, '6 weeks'), I('plus Ceftriaxone', D.croE, '6 weeks')] },
        { name: 'Option 2', cls: 'I B', items: [I('Amoxicillin or ampicillin', D.amox + '; or ' + D.amp, '4–6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: ['Applies to native and prosthetic valves, including complicated native valve IE or symptoms > 3 months.', 'Amoxicillin plus ceftriaxone avoids aminoglycoside nephrotoxicity. It works against E. faecalis, not E. faecium.', 'ESC 2023 shortens gentamicin to 2 weeks but does not restate the amoxicillin duration for that option: 6 weeks is usual for prosthetic valves, complicated cases or symptoms > 3 months.', N.gent, N.duration, N.oral]
    },
    R_ent_HLAR: {
      title: 'Amoxicillin-susceptible enterococcus with HLAR, or HLAR not known',
      regimens: [{ cls: 'I B', items: [I('Amoxicillin or ampicillin', D.amox + '; or ' + D.amp, '6 weeks'), I('plus Ceftriaxone', 'Ceftriaxone 4 g/day IV or IM in 2 doses', '6 weeks')] }],
      notes: ['Applies to native and prosthetic valves. Works against E. faecalis, not E. faecium.', 'If the strain is HLAR to gentamicin but susceptible to streptomycin, streptomycin 15 mg/kg/day in 2 doses can replace gentamicin.', N.duration, N.oral]
    },
    R_ent_allergy: {
      title: 'Amoxicillin-susceptible enterococcus, penicillin allergy',
      verify: 'ESC 2023 gives no specific regimen for enterococcal IE with penicillin allergy. This is the vancomycin regimen ESC uses for beta-lactam-resistant strains: agree it with microbiology.',
      regimens: [{ items: [I('Vancomycin', D.vanc, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Desensitisation is preferable if possible, since beta-lactam regimens are more effective.', 'Do not rely on gentamicin if the strain has HLAR.', N.gent, N.vanc, N.duration, N.team]
    },
    R_ent_amoxR: {
      title: 'Beta-lactam resistant enterococcus (usually E. faecium)',
      regimens: [{ cls: 'I C', items: [I('Vancomycin', D.vanc, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['If resistance is due to beta-lactamase, use ampicillin–sulbactam or amoxicillin–clavulanate instead of ampicillin or amoxicillin. If due to PBP5 alteration, use this vancomycin regimen.', 'Do not rely on gentamicin if the strain has HLAR.', N.gent, N.vanc, N.duration, N.team]
    },
    R_ent_vre: {
      title: 'Vancomycin-resistant enterococcus',
      regimens: [{ cls: 'I C', items: [I('Daptomycin', 'Daptomycin 10–12 mg/kg/day IV in 1 dose', '≥ 6 weeks'), I('plus one of', D.amp + '; or Ertapenem 2 g/day IV or IM in 1 dose; or ' + D.ceftar + '; or Fosfomycin 12 g/day IV in 4 doses', '≥ 6 weeks')] }],
      notes: ['If also resistant to aminoglycosides and beta-lactams, alternatives include linezolid 600 mg IV or orally 12-hourly for ≥ 8 weeks (monitor blood counts).', 'High-dose ertapenem is associated with seizures.', N.fosfo, N.duration, N.team]
    },

    /* HACEK — Section 7.9.1 */
    R_hacek_bl_nat: {
      title: 'HACEK, beta-lactamase producing or not known, native valve',
      regimens: [
        { name: 'Standard', items: [I('Ceftriaxone', D.cro, '4 weeks')] },
        { name: 'Alternative', items: [I('Ciprofloxacin', D.cipro, '4 weeks')] }
      ],
      notes: ['Ciprofloxacin is less well validated.', N.duration]
    },
    R_hacek_bl_pro: {
      title: 'HACEK, beta-lactamase producing or not known, prosthetic valve',
      regimens: [
        { name: 'Standard', items: [I('Ceftriaxone', D.cro, '6 weeks')] },
        { name: 'Alternative', items: [I('Ciprofloxacin', D.cipro, '6 weeks')] }
      ],
      notes: ['Ciprofloxacin is less well validated.', N.duration]
    },
    R_hacek_nbl_nat: {
      title: 'HACEK, non-beta-lactamase producing, native valve',
      regimens: [
        { name: 'Standard', items: [I('Ceftriaxone', D.cro, '4 weeks')] },
        { name: 'Option', items: [I('Ampicillin', 'Ampicillin 12 g/day IV in 4 or 6 doses', '4–6 weeks'), I('plus Gentamicin', D.gentH, '2 weeks')] }
      ],
      notes: [N.gent, N.duration]
    },
    R_hacek_nbl_pro: {
      title: 'HACEK, non-beta-lactamase producing, prosthetic valve',
      regimens: [
        { name: 'Standard', items: [I('Ceftriaxone', D.cro, '6 weeks')] },
        { name: 'Option', items: [I('Ampicillin', 'Ampicillin 12 g/day IV in 4 or 6 doses', '4–6 weeks'), I('plus Gentamicin', D.gentH, '2 weeks')] }
      ],
      notes: [N.gent, N.duration]
    },

    /* Culture-negative — Section 7.10 and Table 11 */
    R_culneg: {
      title: 'Blood culture-negative endocarditis',
      regimens: [
        { name: 'Brucella', items: [I('Doxycycline + co-trimoxazole + rifampicin', 'Doxycycline 200 mg/day; co-trimoxazole 960 mg 12-hourly; rifampicin 300–600 mg/day, all orally', '≥ 3–6 months')] },
        { name: 'Coxiella burnetii (Q fever)', items: [I('Doxycycline + hydroxychloroquine', 'Doxycycline 200 mg/day; hydroxychloroquine 200–600 mg/day (monitor levels), orally', '> 18 months')] },
        { name: 'Bartonella', items: [I('Doxycycline', '100 mg orally 12-hourly', '4 weeks'), I('plus Gentamicin', '3 mg/kg/day IV', '2 weeks')] },
        { name: 'Legionella', items: [I('Levofloxacin', '500 mg IV or orally 12-hourly', '≥ 6 weeks'), I('or Clarithromycin + rifampicin', 'Clarithromycin 500 mg 12-hourly IV for 2 weeks then orally for 4 weeks, plus rifampicin 300–1200 mg/day', '6 weeks')] },
        { name: 'Mycoplasma', items: [I('Levofloxacin', '500 mg IV or orally 12-hourly', '≥ 6 months')] },
        { name: 'Tropheryma whipplei', items: [I('Doxycycline + hydroxychloroquine', 'Doxycycline 200 mg/day; hydroxychloroquine 200–600 mg/day, orally', '≥ 18 months')] }
      ],
      notes: [
        'Until a cause is found, continue empirical therapy (go back and choose “Not known yet”). If there is no response, consider widening cover to culture-negative pathogens.',
        'Send serology for Coxiella, Bartonella, Brucella, Legionella and Mycoplasma, and consider T. whipplei. If surgery is done, send valve tissue for culture, histology and molecular testing.',
        'Optimal durations are unknown: these regimens come from case series (ESC Table 11). With CNS involvement in Whipple’s disease, add sulfadiazine.',
        'Consider non-infective causes such as antiphospholipid syndrome and marantic endocarditis.',
        N.team
      ]
    }
  };

  /* ── Rendering ───────────────────────────── */
  var host = document.getElementById('ie');
  if (!host) return;
  var path = []; // [{ id, choice }]

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render(focusLast) {
    var html = '';
    var id = 'start';
    path.forEach(function (step, i) {
      var q = Q[step.id], o = q.options[step.choice];
      html += '<div class="ie-done"><span class="ie-q">' + esc(q.q) + '</span>' +
              '<button type="button" class="ie-ans" data-back="' + i + '" aria-label="Change answer: ' + esc(o.label) + '">' +
              esc(o.label) + '<span class="ie-change">Change</span></button></div>';
      id = o.next;
    });

    if (Q[id]) {
      var q = Q[id];
      html += '<fieldset class="ie-step"><legend>' + esc(q.q) + '</legend><div class="ie-opts">';
      q.options.forEach(function (o, j) {
        html += '<button type="button" class="opt ie-opt" data-pick="' + j + '"><span class="opt-text">' + esc(o.label) + '</span>' +
                (o.sub ? '<span class="ie-sub">' + esc(o.sub) + '</span>' : '') + '</button>';
      });
      html += '</div></fieldset>';
    } else if (R[id]) {
      html += renderResult(R[id]);
    }

    if (path.length) html += '<div class="ie-actions"><button type="button" class="reset" data-restart>Start again</button></div>';
    host.innerHTML = html;
    host.setAttribute('data-node', id);

    if (focusLast) {
      var target = host.querySelector('.ie-result, .ie-step');
      if (target) {
        var first = target.querySelector('.ie-opt') || target;
        if (first === target) target.setAttribute('tabindex', '-1');
        first.focus({ preventScroll: true });
        var r = target.getBoundingClientRect();
        if (r.top < 80 || r.bottom > window.innerHeight) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function renderResult(r) {
    var h = '<section class="ie-result" aria-live="polite"><p class="ie-eyebrow">Suggested therapy</p><h2>' + esc(r.title) + '</h2>';
    if (r.verify) h += '<p class="ie-verify">' + esc(r.verify) + '</p>';
    r.regimens.forEach(function (g, gi) {
      if (gi > 0) h += '<p class="ie-or">or</p>';
      var head = (g.name ? '<span>' + esc(g.name) + '</span>' : '<span>Regimen</span>') +
                 (g.cls ? '<span class="ie-cls" title="ESC class of recommendation and level of evidence">ESC class ' + esc(g.cls.split(' ')[0]) + ', level ' + esc(g.cls.split(' ')[1]) + '</span>' : '');
      h += '<div class="ie-regimen"><p class="ie-rname">' + head + '</p><ul>';
      g.items.forEach(function (it) {
        h += '<li><span class="ie-drug">' + esc(it.drug) + '</span><span class="ie-dose">' + esc(it.dose) + '</span>' +
             '<span class="ie-dur">' + esc(it.dur) + '</span></li>';
      });
      h += '</ul></div>';
    });
    if (r.notes && r.notes.length) {
      h += '<ul class="ie-notes">' + r.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    }
    h += '<p class="ie-ref">From the 2023 ESC Guidelines for the management of endocarditis. ' + esc(N.renal) + '</p></section>';
    return h;
  }

  host.addEventListener('click', function (e) {
    var pick = e.target.closest('[data-pick]');
    var back = e.target.closest('[data-back]');
    if (pick) {
      var id = path.length ? Q[path[path.length - 1].id].options[path[path.length - 1].choice].next : 'start';
      path.push({ id: id, choice: Number(pick.getAttribute('data-pick')) });
      render(true);
    } else if (back) {
      path = path.slice(0, Number(back.getAttribute('data-back')));
      render(true);
    } else if (e.target.closest('[data-restart]')) {
      path = [];
      render(true);
    }
  });

  // Expose for testing
  window.IE_TREE = { Q: Q, R: R };
  render(false);
})();
