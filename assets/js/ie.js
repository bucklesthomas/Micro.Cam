/*
 * Endocarditis therapy guide — decision tree.
 * Based on the 2023 ESC Guidelines for the management of endocarditis (Delgado V et al. Eur Heart J 2023;44:3948),
 * using the ESC 2015 doses where the 2023 guideline kept those regimens unchanged.
 *
 * Questions: { q, help?, options: [{ label, sub?, next }] }   next = another question id or a result id
 * Results:   { title, regimens: [{ name?, items: [{ drug, dose, dur }] }], notes: [...] , verify? }
 */
(function () {
  var D = {
    penS:    'Benzylpenicillin 12–18 million units/day IV (7.2–10.8 g/day) in 4–6 divided doses or continuous infusion',
    penR:    'Benzylpenicillin 24 million units/day IV (14.4 g/day) in 4–6 divided doses or continuous infusion',
    amoxS:   'Amoxicillin 100–200 mg/kg/day IV in 4–6 divided doses',
    amoxH:   'Amoxicillin 200 mg/kg/day IV in 4–6 divided doses',
    cro:     'Ceftriaxone 2 g IV/IM once daily',
    croE:    'Ceftriaxone 2 g IV 12-hourly (4 g/day)',
    gent:    'Gentamicin 3 mg/kg IV once daily',
    vancS:   'Vancomycin 30 mg/kg/day IV in 2 divided doses, adjusted to levels',
    vancSt:  'Vancomycin 30–60 mg/kg/day IV in 2–3 divided doses, adjusted to levels',
    fluclox: 'Flucloxacillin 12 g/day IV in 4–6 divided doses',
    cefaz:   'Cefazolin 6 g/day IV in 3 divided doses',
    dapto:   'Daptomycin 10 mg/kg IV once daily',
    rif:     'Rifampicin 900–1200 mg/day IV or orally in 2–3 divided doses',
    amp:     'Ampicillin 12 g/day IV in 4–6 divided doses',
    cipro:   'Ciprofloxacin 400 mg IV 8–12-hourly, or 750 mg orally 12-hourly'
  };

  var N = {
    // Shared notes
    duration: 'Count the course from the first day of negative blood cultures, not from the day of surgery. A full new course after surgery is only needed if valve cultures are positive.',
    gent: 'Gentamicin: monitor renal function and levels (pre-dose < 1 mg/L). Avoid where possible in renal impairment.',
    oral: 'Partial oral (step-down) therapy can be considered for streptococci, E. faecalis, S. aureus and CoNS once stable, after ≥ 10 days IV (≥ 7 days after surgery) and with no abscess on TOE. This is an Endocarditis Team decision.',
    team: 'Discuss every case with microbiology/ID and the Endocarditis Team.',
    rif: 'Rifampicin: start only after 3–5 days of effective therapy, once bacteraemia has cleared. Check interactions and monitor liver function.',
    renal: 'Adjust doses to weight and renal function; check local guidelines.'
  };

  var Q = {
    start: {
      q: 'What organism has been isolated?',
      options: [
        { label: 'Not known yet', sub: 'Empirical therapy', next: 'emp_setting' },
        { label: 'Streptococcus', sub: 'Oral streptococci, S. gallolyticus', next: 'strep_mic' },
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
    emp_allergy: {
      q: 'Penicillin allergy?',
      options: [
        { label: 'No', next: 'R_emp_ca' },
        { label: 'Yes', next: 'R_emp_ca_allergy' }
      ]
    },

    /* ── Streptococci ────────────────────────── */
    strep_mic: {
      q: 'Penicillin susceptibility?',
      options: [
        { label: 'Susceptible', sub: 'Penicillin MIC ≤ 0.125 mg/L', next: 'strepS_valve' },
        { label: 'Resistant or intermediate', sub: 'Penicillin MIC 0.25–2 mg/L', next: 'strepR_valve' }
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
      { label: 'Yes, not severe', sub: 'No anaphylaxis or severe immediate reaction', next: 'R_staph_nat_ms_mild' },
      { label: 'Yes, severe', sub: 'Anaphylaxis or severe immediate reaction', next: 'R_staph_nat_severe' } ] },
    staph_pro_allergy: { q: 'Penicillin allergy?', options: [
      { label: 'No', next: 'R_staph_pro_ms' },
      { label: 'Yes, not severe', sub: 'No anaphylaxis or severe immediate reaction', next: 'R_staph_pro_ms_mild' },
      { label: 'Yes, severe', sub: 'Anaphylaxis or severe immediate reaction', next: 'R_staph_pro_severe' } ] },

    /* ── Enterococci ─────────────────────────── */
    ent_amox: {
      q: 'Susceptibility?',
      options: [
        { label: 'Amoxicillin-susceptible', sub: 'Usually E. faecalis', next: 'ent_allergy' },
        { label: 'Amoxicillin-resistant', sub: 'Often E. faecium; vancomycin-susceptible', next: 'R_ent_amoxR' },
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
        { label: 'Yes', next: 'R_ent_HLAR' },
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

  var R = {
    /* Empirical */
    R_emp_ca: {
      title: 'Empirical: community-acquired native valve or late prosthetic valve IE',
      verify: true,
      regimens: [
        { name: 'Option 1', items: [I('Ampicillin', D.amp, 'Until organism identified'), I('Ceftriaxone', D.croE, 'Until organism identified')] },
        { name: 'Option 2', items: [I('Ampicillin', D.amp, 'Until organism identified'), I('Flucloxacillin', D.fluclox, 'Until organism identified'), I('Gentamicin', D.gent, 'Until organism identified')] }
      ],
      notes: ['Take 3 sets of blood cultures before starting.', 'Switch to targeted therapy within 24–48 hours of identifying the organism.', N.gent, N.team]
    },
    R_emp_ca_allergy: {
      title: 'Empirical: community-acquired IE with penicillin allergy',
      verify: true,
      regimens: [
        { name: 'Option 1 (non-severe allergy)', items: [I('Cefazolin', D.cefaz, 'Until organism identified'), I('Gentamicin', D.gent, 'Until organism identified')] },
        { name: 'Option 2', items: [I('Vancomycin', D.vancSt, 'Until organism identified'), I('Gentamicin', D.gent, 'Until organism identified')] }
      ],
      notes: ['Take 3 sets of blood cultures before starting.', 'Avoid cephalosporins after penicillin anaphylaxis.', N.gent, N.team]
    },
    R_emp_hc: {
      title: 'Empirical: early prosthetic valve or healthcare-associated IE',
      verify: true,
      regimens: [
        { items: [I('Vancomycin (or daptomycin)', D.vancSt + '; or ' + D.dapto, 'Until organism identified'), I('Gentamicin', D.gent, 'Until organism identified'), I('Rifampicin (prosthetic valve only)', D.rif, 'Until organism identified')] }
      ],
      notes: ['Covers methicillin-resistant staphylococci and enterococci. Consider adding Gram-negative cover according to local epidemiology.', N.rif, N.gent, N.team]
    },

    /* Streptococci, penicillin-susceptible */
    R_strepS_nat: {
      title: 'Penicillin-susceptible streptococcus, native valve',
      regimens: [
        { name: 'Standard: 4 weeks', items: [I('One of', D.penS + '; or ' + D.amoxS + '; or ' + D.cro, '4 weeks')] },
        { name: 'Short course: 2 weeks', items: [I('Beta-lactam', 'Benzylpenicillin, amoxicillin or ceftriaxone as above', '2 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: ['The 2-week course is only for uncomplicated native valve IE with normal renal function.', 'S. gallolyticus: arrange colonoscopy.', N.duration, N.oral]
    },
    R_strepS_pro: {
      title: 'Penicillin-susceptible streptococcus, prosthetic valve',
      regimens: [{ items: [I('One of', D.penS + '; or ' + D.amoxS + '; or ' + D.cro, '6 weeks')] }],
      notes: ['The 2-week course is not recommended for prosthetic valve IE.', 'S. gallolyticus: arrange colonoscopy.', N.duration, N.oral]
    },
    R_strepS_nat_allergy: {
      title: 'Penicillin-susceptible streptococcus, native valve, beta-lactam allergy',
      regimens: [{ items: [I('Vancomycin', D.vancS, '4 weeks')] }],
      notes: ['Discuss with microbiology/allergy whether a cephalosporin can be used if the allergy is not severe.', N.duration, N.oral]
    },
    R_strepS_pro_allergy: {
      title: 'Penicillin-susceptible streptococcus, prosthetic valve, beta-lactam allergy',
      regimens: [{ items: [I('Vancomycin', D.vancS, '6 weeks')] }],
      notes: ['Discuss with microbiology/allergy whether a cephalosporin can be used if the allergy is not severe.', N.duration, N.oral]
    },

    /* Streptococci, penicillin-resistant / intermediate */
    R_strepR_nat: {
      title: 'Penicillin-resistant streptococcus, native valve',
      regimens: [{ items: [I('One of', D.penR + '; or ' + D.amoxH + '; or ' + D.cro, '4 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.gent, N.duration, N.oral]
    },
    R_strepR_pro: {
      title: 'Penicillin-resistant streptococcus, prosthetic valve',
      regimens: [{ items: [I('One of', D.penR + '; or ' + D.amoxH + '; or ' + D.cro, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.gent, N.duration, N.oral]
    },
    R_strepR_nat_allergy: {
      title: 'Penicillin-resistant streptococcus, native valve, beta-lactam allergy',
      regimens: [{ items: [I('Vancomycin', D.vancS, '4 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.gent, N.duration]
    },
    R_strepR_pro_allergy: {
      title: 'Penicillin-resistant streptococcus, prosthetic valve, beta-lactam allergy',
      regimens: [{ items: [I('Vancomycin', D.vancS, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.gent, N.duration]
    },

    /* Staphylococci, native valve */
    R_staph_nat_ms: {
      title: 'Methicillin-susceptible staphylococcus, native valve',
      regimens: [
        { name: 'Option 1', items: [I('Flucloxacillin', D.fluclox, '4–6 weeks')] },
        { name: 'Option 2', items: [I('Cefazolin', D.cefaz, '4–6 weeks')] }
      ],
      notes: ['Gentamicin is not recommended for staphylococcal native valve IE.', 'Uncomplicated right-sided IE may suit a shorter course: Endocarditis Team decision.', N.duration, N.oral]
    },
    R_staph_nat_ms_mild: {
      title: 'Methicillin-susceptible staphylococcus, native valve, non-severe penicillin allergy',
      regimens: [{ items: [I('Cefazolin', D.cefaz, '4–6 weeks')] }],
      notes: ['Gentamicin is not recommended for staphylococcal native valve IE.', N.duration, N.oral]
    },
    R_staph_nat_severe: {
      title: 'Methicillin-susceptible staphylococcus, native valve, severe penicillin allergy',
      regimens: [
        { name: 'Preferred', items: [I('Vancomycin', D.vancSt, '4–6 weeks')] },
        { name: 'Alternative', items: [I('Daptomycin', D.dapto + ', often combined with fosfomycin', '4–6 weeks')] }
      ],
      notes: ['Vancomycin is less effective than beta-lactams against MSSA. Consider formal allergy assessment or desensitisation.', N.duration, N.team]
    },
    R_staph_nat_mr: {
      title: 'Methicillin-resistant staphylococcus, native valve',
      regimens: [
        { name: 'Preferred', items: [I('Vancomycin', D.vancSt, '4–6 weeks')] },
        { name: 'Alternative', items: [I('Daptomycin', D.dapto + ', combined with cloxacillin, ceftaroline or fosfomycin', '4–6 weeks')] }
      ],
      notes: ['Gentamicin is not recommended for staphylococcal native valve IE.', 'Other agents (ceftaroline, dalbavancin, linezolid) only with Endocarditis Team approval.', N.duration, N.team]
    },

    /* Staphylococci, prosthetic valve */
    R_staph_pro_ms: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve',
      regimens: [{ items: [I('Flucloxacillin or cefazolin', D.fluclox + '; or ' + D.cefaz, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.rif, N.gent, N.duration, N.team]
    },
    R_staph_pro_ms_mild: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve, non-severe penicillin allergy',
      regimens: [{ items: [I('Cefazolin', D.cefaz, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: [N.rif, N.gent, N.duration, N.team]
    },
    R_staph_pro_severe: {
      title: 'Methicillin-susceptible staphylococcus, prosthetic valve, severe penicillin allergy',
      regimens: [{ items: [I('Vancomycin', D.vancSt, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Consider formal allergy assessment or desensitisation.', N.rif, N.gent, N.duration, N.team]
    },
    R_staph_pro_mr: {
      title: 'Methicillin-resistant staphylococcus, prosthetic valve',
      regimens: [
        { name: 'Preferred', items: [I('Vancomycin', D.vancSt, '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] },
        { name: 'Alternative', items: [I('Daptomycin', D.dapto + ', combined with ceftaroline or fosfomycin', '≥ 6 weeks'), I('plus Rifampicin', D.rif, '≥ 6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: [N.rif, N.gent, N.duration, N.team]
    },

    /* Enterococci */
    R_ent_noHLAR: {
      title: 'Amoxicillin-susceptible enterococcus, no HLAR',
      regimens: [
        { name: 'Option 1', items: [I('Amoxicillin', D.amoxH + ' (or ampicillin 12 g/day)', '6 weeks'), I('plus Ceftriaxone', D.croE, '6 weeks')] },
        { name: 'Option 2', items: [I('Amoxicillin', D.amoxH + ' (or ampicillin 12 g/day)', '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: ['Applies to native and prosthetic valves.', 'Amoxicillin plus ceftriaxone avoids aminoglycoside toxicity; it relies on synergy against E. faecalis, not E. faecium.', N.gent, N.duration, N.oral]
    },
    R_ent_HLAR: {
      title: 'Amoxicillin-susceptible enterococcus with HLAR, or HLAR not known',
      regimens: [{ items: [I('Amoxicillin', D.amoxH + ' (or ampicillin 12 g/day)', '6 weeks'), I('plus Ceftriaxone', D.croE, '6 weeks')] }],
      notes: ['Applies to native and prosthetic valves.', 'Relies on synergy against E. faecalis, not E. faecium.', N.duration, N.oral]
    },
    R_ent_allergy: {
      title: 'Amoxicillin-susceptible enterococcus, penicillin allergy',
      verify: true,
      regimens: [{ items: [I('Vancomycin', D.vancS, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Check for HLAR before relying on gentamicin.', 'Consider formal allergy assessment or desensitisation, since beta-lactam regimens are preferred.', N.gent, N.duration, N.team]
    },
    R_ent_amoxR: {
      title: 'Amoxicillin-resistant, vancomycin-susceptible enterococcus',
      regimens: [{ items: [I('Vancomycin', D.vancS, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }],
      notes: ['Check for HLAR before relying on gentamicin.', N.gent, N.duration, N.team]
    },
    R_ent_vre: {
      title: 'Vancomycin-resistant enterococcus',
      regimens: [{ items: [I('Daptomycin (high dose)', 'Daptomycin 10–12 mg/kg IV once daily', '≥ 6 weeks'), I('plus one of', 'Ampicillin, ertapenem, ceftaroline or fosfomycin', '≥ 6 weeks')] }],
      notes: ['Specialist regimen: agree it with microbiology/ID and the Endocarditis Team. Linezolid is an alternative in some cases.', N.duration, N.team]
    },

    /* HACEK */
    R_hacek_bl_nat: {
      title: 'HACEK, beta-lactamase producing or not known, native valve',
      regimens: [
        { name: 'Preferred', items: [I('Ceftriaxone', D.cro, '4 weeks')] },
        { name: 'Alternative', items: [I('Ciprofloxacin', D.cipro, '4 weeks')] }
      ],
      notes: ['Ciprofloxacin is less well documented.', N.duration]
    },
    R_hacek_bl_pro: {
      title: 'HACEK, beta-lactamase producing or not known, prosthetic valve',
      regimens: [
        { name: 'Preferred', items: [I('Ceftriaxone', D.cro, '6 weeks')] },
        { name: 'Alternative', items: [I('Ciprofloxacin', D.cipro, '6 weeks')] }
      ],
      notes: ['Ciprofloxacin is less well documented.', N.duration]
    },
    R_hacek_nbl_nat: {
      title: 'HACEK, non-beta-lactamase producing, native valve',
      regimens: [
        { name: 'Option 1', items: [I('Ceftriaxone', D.cro, '4 weeks')] },
        { name: 'Option 2', items: [I('Ampicillin', D.amp, '4 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: [N.gent, N.duration]
    },
    R_hacek_nbl_pro: {
      title: 'HACEK, non-beta-lactamase producing, prosthetic valve',
      regimens: [
        { name: 'Option 1', items: [I('Ceftriaxone', D.cro, '6 weeks')] },
        { name: 'Option 2', items: [I('Ampicillin', D.amp, '6 weeks'), I('plus Gentamicin', D.gent, '2 weeks')] }
      ],
      notes: [N.gent, N.duration]
    },

    /* Culture-negative */
    R_culneg: {
      title: 'Blood culture-negative endocarditis',
      regimens: [],
      notes: [
        'Continue empirical therapy (go back and choose “Not known yet”) while investigating.',
        'Check whether antibiotics were given before cultures; repeat cultures off antibiotics if safe.',
        'Send serology for Coxiella burnetii, Bartonella, Brucella, Legionella and Mycoplasma, and consider Tropheryma whipplei. Send valve tissue for culture, histology and 16S PCR if operated.',
        'Consider non-infective causes (antiphospholipid syndrome, marantic endocarditis).',
        'Targeted regimens depend on the organism found: agree them with microbiology/ID.'
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
    if (r.verify) h += '<p class="ie-verify">Check this regimen against the full ESC 2023 guideline before use: it could not be confirmed against the original tables.</p>';
    r.regimens.forEach(function (g, gi) {
      if (gi > 0) h += '<p class="ie-or">or</p>';
      h += '<div class="ie-regimen">' + (g.name ? '<p class="ie-rname">' + esc(g.name) + '</p>' : '') + '<ul>';
      g.items.forEach(function (it) {
        h += '<li><span class="ie-drug">' + esc(it.drug) + '</span><span class="ie-dose">' + esc(it.dose) + '</span>' +
             '<span class="ie-dur">' + esc(it.dur) + '</span></li>';
      });
      h += '</ul></div>';
    });
    if (r.notes && r.notes.length) {
      h += '<ul class="ie-notes">' + r.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    }
    h += '<p class="ie-ref">Based on the 2023 ESC Guidelines for the management of endocarditis. ' + esc(N.renal) + '</p></section>';
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
