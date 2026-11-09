/*
 * Neutropenic sepsis in adults having anticancer treatment: initial management and when to add antifungals.
 * Initial management: NICE CG151 (2012), recommendations 1.4–1.5.
 * Antifungals: IDSA 2010 febrile neutropenia guideline (Freifeld AG et al. Clin Infect Dis 2011;52:e56), recommendations 21 and 28–30;
 * empirical agents, grades and doses: ECIL-3 (2009). Caspofungin loading dose from the UK product licence.
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    tazo: 'Piperacillin–tazobactam 4.5 g IV every 6–8 hours (local policy)',
    casp: 'Caspofungin 70 mg IV on day 1, then 50 mg once daily (70 mg daily if > 80 kg)',
    lamb: 'Liposomal amphotericin B 3 mg/kg IV once daily',
    mica: 'Micafungin 100 mg IV once daily',
    vori: 'Voriconazole IV 6 mg/kg 12-hourly for 2 doses, then 3 mg/kg 12-hourly'
  };

  var N = {
    workup: 'Investigate for fungal infection: CT chest (and sinuses if symptomatic), serum galactomannan, beta-D-glucan, blood cultures and cultures from any other site; bronchoscopy with BAL galactomannan if CT shows infiltrates.',
    classify: 'If imaging or mycology are positive, classify with the EORTC/MSGERC criteria (Scores page) and treat as invasive fungal disease (see the aspergillosis and candidaemia guides).',
    choose: 'Echinocandins do not cover Mucorales and are not reliable for moulds: use liposomal amphotericin B if a mould infection is suspected.',
    review: 'Review daily with haematology. If no fungal infection is found, empirical antifungals are usually stopped once the neutrophils recover and the fever settles.',
    other: 'Look for other causes of persistent fever: resistant bacteria, line infection, Clostridioides difficile, viral infection, drug fever, thrombosis.',
    highrisk: 'High risk (IDSA 2010): neutropenia expected to last > 7 days and profound (< 0.1 × 10⁹/L), or significant comorbidity such as hypotension, pneumonia, new abdominal pain, neurological change, or hepatic or renal impairment (CrCl < 30 ml/min). MASCC score < 21 also indicates high risk.'
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }

  var EMPIRIC = [
    { name: 'Recommended (ECIL-3 grade A)', items: [I('Caspofungin', D.casp, ''), I('or Liposomal amphotericin B', D.lamb, '')] },
    { name: 'Alternatives (ECIL-3 grade B)', items: [I('Micafungin', D.mica, ''), I('or Voriconazole', D.vori + ' (avoid if on azole prophylaxis)', '')] }
  ];

  var Q = {
    start: {
      q: 'Where are you in the episode?',
      help: 'Neutropenic sepsis (NICE): neutrophils ≤ 0.5 × 10⁹/L with temperature > 38 °C or other signs of clinically significant sepsis, in a patient having anticancer treatment.',
      options: [
        { label: 'Presenting now', sub: 'Starting empirical antibiotics', next: 'R_initial' },
        { label: 'Still febrile after 4–7 days of antibiotics', sub: 'Should an antifungal be added?', next: 'risk' },
        { label: 'Fever settled', sub: 'When can antibiotics stop?', next: 'R_stop' }
      ]
    },
    risk: {
      q: 'Is the patient high risk for invasive fungal infection?',
      help: N.highrisk,
      options: [
        { label: 'No', sub: 'Neutropenia expected < 7 days, no high-risk features', next: 'R_lowrisk' },
        { label: 'Yes', sub: 'Prolonged, profound neutropenia or high-risk features', next: 'prophy' }
      ]
    },
    prophy: {
      q: 'Is the patient on mould-active antifungal prophylaxis?',
      help: 'For example posaconazole, voriconazole or itraconazole. Fluconazole is not mould-active.',
      options: [
        { label: 'No', sub: 'None, or fluconazole only', next: 'stable' },
        { label: 'Yes', next: 'R_breakthrough' }
      ]
    },
    stable: {
      q: 'Is the patient clinically stable?',
      options: [
        { label: 'No', sub: 'Unstable or deteriorating', next: 'R_empiric' },
        { label: 'Yes', next: 'tests' }
      ]
    },
    tests: {
      q: 'What have the fungal investigations shown?',
      help: 'CT chest (± sinuses), serum galactomannan, beta-D-glucan, and cultures from all sites.',
      options: [
        { label: 'Not done yet', next: 'R_investigate' },
        { label: 'Signs of fungal infection', sub: 'Suggestive CT, positive galactomannan, or fungi grown', next: 'R_target' },
        { label: 'All negative', next: 'R_preempt' }
      ]
    }
  };

  var R = {
    R_initial: {
      title: 'Suspected neutropenic sepsis: initial management',
      tone: 'red',
      summary: 'Treat as a medical emergency and give empirical antibiotics immediately (NICE).',
      regimens: [{ name: 'Initial empirical antibiotic (NICE)', items: [I('Piperacillin–tazobactam monotherapy', D.tazo, '')] }],
      notes: [
        'Before or alongside antibiotics: history and examination, full blood count, renal and liver function (with albumin), CRP, lactate and blood cultures. No chest X-ray unless clinically indicated.',
        'Do not add an aminoglycoside or a glycopeptide (e.g. vancomycin) routinely, even with a central line, unless there is a patient-specific or local microbiological reason (e.g. MRSA colonisation, line infection, shock).',
        'Do not remove a central venous access device as part of initial management.',
        'Penicillin allergy: follow local policy.',
        'Within 24 hours, assess the risk of complications with a validated score such as MASCC. Low-risk patients can be considered for outpatient care.',
        'Review daily. Do not change antibiotics just because the fever persists, unless the patient deteriorates or microbiology indicates it. Switch to oral antibiotics after 48 hours if reassessed as low risk.',
        'Antifungals are not part of initial empirical treatment. If high risk and still febrile after 4–7 days, come back to this guide.'
      ]
    },
    R_stop: {
      title: 'Stopping antibiotics after response',
      tone: 'green',
      regimens: [],
      notes: [
        'NICE: stop empirical antibiotics once the neutropenic sepsis has responded to treatment, whatever the neutrophil count.',
        'Continue antibiotics in patients with unresponsive fever, unless another cause of fever is likely.',
        'Treat any documented infection for its usual course.'
      ]
    },
    R_lowrisk: {
      title: 'Persistent fever in a low-risk patient',
      tone: 'green',
      summary: 'Empirical antifungal therapy is not routinely recommended: the risk of invasive fungal infection is low (IDSA 2010, A-III).',
      regimens: [],
      notes: [N.other, 'Reassess the risk daily: if neutropenia becomes prolonged or the patient deteriorates, re-enter the guide as high risk.']
    },
    R_breakthrough: {
      title: 'Persistent fever on mould-active prophylaxis',
      tone: 'amber',
      summary: 'If an antifungal is started, switch to a different class given IV, rather than another azole (IDSA 2010, B-III).',
      regimens: [{ name: 'Switch class', items: [I('Liposomal amphotericin B', D.lamb, '')] }],
      notes: [
        'Check the prophylactic azole level: a low level suggests poor absorption rather than resistance.',
        'Galactomannan is less sensitive in patients on mould-active prophylaxis: rely more on CT and bronchoscopy.',
        'Breakthrough infections include Mucorales and other resistant moulds: aim for a tissue or BAL diagnosis.',
        N.workup, N.classify, N.other, N.review
      ]
    },
    R_empiric: {
      title: 'High risk, persistent fever, unstable: start empirical antifungal therapy',
      tone: 'red',
      summary: 'Start empirical antifungal therapy and investigate at the same time (IDSA 2010, A-I).',
      regimens: EMPIRIC,
      notes: [N.choose, N.workup, N.classify, N.other, N.review]
    },
    R_investigate: {
      title: 'High risk, persistent fever, stable: investigate now',
      tone: 'amber',
      summary: 'Arrange fungal investigations urgently. Either start empirical antifungals now, or, if stable and results will be back within about 24–48 hours, wait for them (pre-emptive approach).',
      regimens: EMPIRIC,
      notes: [N.workup, 'Empirical therapy (IDSA A-I) and a diagnostics-driven pre-emptive approach (IDSA B-II) are both acceptable in a stable high-risk patient. Agree the approach with haematology.', N.choose, N.other]
    },
    R_target: {
      title: 'High risk with evidence of fungal infection',
      tone: 'red',
      summary: 'Start antifungal treatment for the likely infection now (IDSA 2010).',
      regimens: [
        { name: 'Suspected mould (e.g. nodules, halo, positive galactomannan)', items: [I('Voriconazole or isavuconazole', 'See the aspergillosis guide for doses', ''), I('or Liposomal amphotericin B', D.lamb + ' (if Mucorales possible, or azole not suitable)', '')] },
        { name: 'Candida in blood cultures', items: [I('An echinocandin', 'See the candidaemia guide', '')] }
      ],
      notes: [N.classify, 'Bronchoscopy with BAL (galactomannan, culture, PCR) or biopsy can confirm the diagnosis and the species.', N.review]
    },
    R_preempt: {
      title: 'High risk, stable, investigations negative',
      tone: 'green',
      summary: 'Antifungals can be withheld and the patient monitored closely (pre-emptive approach, IDSA 2010 B-II).',
      regimens: [],
      notes: [
        'This applies only if the patient is clinically stable, CT chest and sinuses show no sign of fungal infection, serological tests are negative, and no fungi have been grown from any site.',
        'Start antifungal therapy if any of these change. Repeat galactomannan (e.g. twice weekly) and repeat the CT if fever persists.',
        'Empirical antifungal therapy remains a reasonable alternative, particularly if investigations cannot be repeated promptly.',
        N.other
      ]
    }
  };

  window.GUIDES.neutsep = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From NICE CG151 (2012), the IDSA febrile neutropenia guideline (2010) and ECIL-3 empirical antifungal recommendations (2009). Check local haematology and antimicrobial policies.'
  };
})();
