/*
 * Candidaemia in adults.
 * ECMM/ISHAM/ASM global guideline for candidiasis (Cornely OA et al. Lancet Infect Dis 2025): Figures 1–2 and candidaemia text.
 * Species-specific step-down and neutropenia details from IDSA 2016 (Pappas PG et al. Clin Infect Dis 2016), which the 2025 guideline does not restate.
 * C. auris: UKHSA guidance (updated August 2025).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    anid:  'Anidulafungin 200 mg IV on day 1, then 100 mg once daily',
    casp:  'Caspofungin 70 mg IV on day 1, then 50 mg once daily',
    mica:  'Micafungin 100 mg IV once daily',
    reza:  'Rezafungin 400 mg IV in week 1, then 200 mg once weekly',
    lamb:  'Liposomal amphotericin B 3–5 mg/kg IV once daily',
    fluc:  'Fluconazole 400–800 mg (6–12 mg/kg) orally once daily',
    flucH: 'Fluconazole 800 mg (12 mg/kg) orally once daily',
    vori:  'Voriconazole 200–300 mg (3–4 mg/kg) orally twice daily'
  };

  var N = {
    cvc: 'Remove the central venous catheter as early as possible when it can be done safely, ideally within 48–72 hours (strong recommendation).',
    cultures: 'Take blood cultures daily until three consecutive days are negative. If cultures are still positive on day 5, look again for an intravascular or other uncontrolled source.',
    eyes: 'Fundoscopy for ocular symptoms, persistent candidaemia, immunosuppression, or patients who cannot report symptoms. Ocular involvement changes the drug and duration.',
    echo: 'Echocardiography for suspected endocarditis (skin lesions, new murmur), persistent candidaemia, valve disease or a cardiac device.',
    duration: 'Without deep-seated or metastatic infection: treat for 14 days from the first of three consecutive negative blood cultures.',
    step: 'Step down to an oral azole after ≥ 5 days of echinocandin if all apply: haemodynamically stable, blood cultures cleared, not neutropenic, source controlled (e.g. line removed), able to take oral treatment, and the isolate is susceptible.',
    sus: 'Send the isolate for species identification and antifungal susceptibility testing.',
    source: 'Look for and control the source (line, abdomen, urinary tract).'
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }
  var ECHINO = { name: 'First line: an echinocandin', items: [I('One of', D.anid + '; or ' + D.casp + '; or ' + D.mica + '; or ' + D.reza, 'At least 5 days IV before any step-down')] };

  var Q = {
    start: {
      q: 'Is the patient neutropenic?',
      options: [
        { label: 'No', next: 'species' },
        { label: 'Yes', sub: 'Neutrophils < 0.5 × 10⁹/L', next: 'R_neut' }
      ]
    },
    species: {
      q: 'Which Candida species?',
      help: 'Older names in brackets. If the species is not yet known, start an echinocandin and come back once it is identified.',
      options: [
        { label: 'Not identified yet', next: 'R_unknown' },
        { label: 'C. albicans, C. tropicalis or C. dubliniensis', next: 'R_alb' },
        { label: 'C. parapsilosis', next: 'R_para' },
        { label: 'Nakaseomyces glabratus', sub: '(C. glabrata)', next: 'R_glab' },
        { label: 'Pichia kudriavzevii', sub: '(C. krusei)', next: 'R_krus' },
        { label: 'Candidozyma auris', sub: '(C. auris)', next: 'R_auris' }
      ]
    }
  };

  var common = [N.cvc, N.cultures, N.eyes, N.echo, N.duration];

  var R = {
    R_unknown: {
      title: 'Candidaemia, species not yet identified',
      regimens: [ECHINO, { name: 'If an echinocandin cannot be used', items: [I('Liposomal amphotericin B', D.lamb, '')] }],
      notes: [N.sus, 'Fluconazole is only marginally recommended for initial treatment, because of treatment failure and rising resistance.'].concat(common, [N.step])
    },
    R_alb: {
      title: 'C. albicans, C. tropicalis or C. dubliniensis candidaemia',
      regimens: [ECHINO, { name: 'Step-down when criteria are met', noOr: true, items: [I('Fluconazole', D.fluc, 'To complete 14 days from clearance')] }],
      notes: [N.step, 'Check azole susceptibility before stepping down: fluconazole resistance occurs, particularly in C. tropicalis.'].concat(common)
    },
    R_para: {
      title: 'C. parapsilosis candidaemia',
      regimens: [ECHINO, { name: 'Step-down when criteria are met', noOr: true, items: [I('Fluconazole', D.fluc, 'To complete 14 days from clearance')] }],
      notes: ['C. parapsilosis has naturally higher echinocandin MICs. If the patient is improving and cultures have cleared, the echinocandin can continue; if not, switch to fluconazole if susceptible (IDSA 2016).', 'Azole-resistant C. parapsilosis is increasing in some countries: check susceptibility.', 'C. parapsilosis is strongly associated with central lines and line care: line removal is especially important.', N.step].concat(common)
    },
    R_glab: {
      title: 'Nakaseomyces glabratus (C. glabrata) candidaemia',
      regimens: [ECHINO, { name: 'Step-down only if susceptible', noOr: true, items: [I('Fluconazole (high dose)', D.flucH, 'To complete 14 days from clearance'), I('or Voriconazole', D.vori, 'To complete 14 days from clearance')] }],
      notes: ['N. glabratus has reduced azole susceptibility: step down only if the isolate is fluconazole susceptible (dose-dependent) or voriconazole susceptible, using the higher fluconazole dose (IDSA 2016).', 'Echinocandin resistance (FKS mutations) occurs in about 5–10%, especially after previous echinocandin exposure: request echinocandin susceptibility testing.', 'If resistant to echinocandins and azoles, use liposomal amphotericin B 3–5 mg/kg daily.', N.step].concat(common)
    },
    R_krus: {
      title: 'Pichia kudriavzevii (C. krusei) candidaemia',
      regimens: [ECHINO, { name: 'Step-down only if susceptible', noOr: true, items: [I('Voriconazole', D.vori, 'To complete 14 days from clearance')] }],
      notes: ['P. kudriavzevii is intrinsically resistant to fluconazole: never use fluconazole.', 'Voriconazole is the oral step-down option for susceptible isolates (IDSA 2016).', N.step].concat(common)
    },
    R_auris: {
      title: 'Candidozyma auris (C. auris) infection',
      tone: 'amber',
      summary: 'Isolate the patient, inform infection prevention and control, and seek mycology advice.',
      regimens: [
        ECHINO,
        { name: 'If echinocandin-resistant, failing, or at a poorly penetrated site', items: [I('Liposomal amphotericin B', D.lamb, ''), I('CNS infection: plus flucytosine', 'Flucytosine 25 mg/kg orally four times a day (dose to renal function and levels)', '')] }
      ],
      notes: ['Do not use fluconazole for treatment or step-down: most isolates are resistant.', 'Repeat susceptibility testing during treatment, as resistance can emerge. Flucytosine is only used in combination.', 'Do not treat colonisation (urine, respiratory, wound) without signs of infection. Routine decolonisation is not recommended.', 'Isolate or cohort with contact precautions until discharge, and flag the patient’s record for readmission.'].concat(common)
    },
    R_neut: {
      title: 'Candidaemia in a neutropenic patient',
      tone: 'amber',
      summary: 'Discuss with haematology and microbiology.',
      regimens: [
        ECHINO,
        { name: 'Alternative', items: [I('Liposomal amphotericin B', D.lamb, '')] },
        { name: 'If mould cover is also needed', items: [I('Voriconazole', '6 mg/kg IV twice daily on day 1, then 4 mg/kg twice daily', '')] }
      ],
      notes: [
        'Do not step down to an oral azole while neutropenic.',
        'The source is often the gut rather than the line: decide on catheter removal case by case (IDSA 2016).',
        'Do fundoscopy once neutrophils recover, as eye lesions may not be visible during neutropenia (IDSA 2016).',
        'Treat for at least 2 weeks after clearance, once neutropenia and symptoms have resolved (IDSA 2016).',
        'Persistent fever after recovery with liver or spleen lesions suggests chronic disseminated (hepatosplenic) candidiasis: this needs months of treatment.',
        N.sus, N.cultures, N.echo
      ]
    }
  };

  window.GUIDES.candida = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the ECMM/ISHAM/ASM global candidiasis guideline (2025), with species and neutropenia details from IDSA 2016 and UKHSA C. auris guidance (2025). Adult doses; check renal and hepatic dosing, interactions and local guidelines.'
  };
})();
