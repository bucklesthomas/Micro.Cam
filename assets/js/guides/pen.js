/*
 * Penicillin allergy label: what kind of reaction, and which β-lactams can be used.
 * BSACI guideline on allergy to penicillins and other β-lactams (Mirakian R et al. Clin Exp Allergy 2015);
 * BSACI guidance on penicillin allergy de-labelling by non-allergists (Savic L et al. 2019);
 * Drug allergy: a 2022 practice parameter update (Khan DA et al. J Allergy Clin Immunol 2022); PEN-FAST (Trubiano JA et al. JAMA Intern Med 2020).
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }
  var CHECK = 'Use the cross-reactivity checker below to see which β-lactams share a side chain with the culprit.';
  var DOC = 'Document the reaction precisely (drug, date, what happened, treatment) in the allergy record.';

  var Q = {
    start: {
      q: 'What happened with the penicillin?',
      help: 'Get the details from the patient, the GP record or old notes: drug, when, how soon after the dose, what the reaction looked like, and whether they have had a penicillin or cephalosporin since.',
      options: [
        { label: 'Side effect only, or family history only', sub: 'Nausea, diarrhoea, thrush, headache; or a relative is allergic', next: 'R_none' },
        { label: 'Mild delayed rash', sub: 'Itchy or maculopapular rash days into the course, no blistering, mucosal or organ involvement', next: 'time' },
        { label: 'Immediate reaction', sub: 'Hives, swelling, wheeze or collapse within about 1 hour of a dose', next: 'imm' },
        { label: 'Severe delayed reaction', sub: 'SJS/TEN, DRESS, AGEP, blistering, mucosal involvement, hepatitis, nephritis, haemolysis, serum sickness', next: 'R_scar' },
        { label: 'Not known', sub: 'No details available', next: 'R_unknown' }
      ]
    },
    time: {
      q: 'When was it?',
      options: [
        { label: 'More than 5 years ago, or in childhood', next: 'R_low' },
        { label: 'Within the last 5 years', next: 'R_lowRecent' }
      ]
    },
    imm: {
      q: 'How severe was it?',
      options: [
        { label: 'Anaphylaxis', sub: 'Breathing difficulty, hypotension, collapse, or needed adrenaline', next: 'R_ana' },
        { label: 'Urticaria or angioedema only', next: 'R_urt' }
      ]
    }
  };

  var R = {
    R_none: {
      title: 'Not an allergy', tone: 'green',
      summary: 'Intolerance or family history does not make someone allergic: penicillins can be given.',
      regimens: [],
      notes: ['Remove the allergy label (de-label) after explaining this to the patient, and update the GP record.', 'A family history of penicillin allergy does not increase the patient’s risk.']
    },
    R_low: {
      title: 'Low-risk history (mild rash more than 5 years ago)', tone: 'green',
      summary: 'Most of these patients are not allergic (PEN-FAST < 3 means low risk: under 5% have a positive test). They can usually be de-labelled with a direct oral challenge.',
      regimens: [{ name: 'Direct oral challenge, where your trust has a pathway', items: [I('Amoxicillin', '500 mg orally, observe for 1 hour (some pathways also check for a delayed rash over the next days)')] }],
      notes: ['While waiting: any cephalosporin or carbapenem can be used without testing.', 'Score PEN-FAST on the Scores page to confirm low risk.', 'Children often get viral rashes on antibiotics; most childhood labels are wrong.', DOC]
    },
    R_lowRecent: {
      title: 'Mild delayed rash within the last 5 years', tone: 'amber',
      summary: 'Avoid penicillins for now. Cephalosporins and carbapenems can be used.',
      regimens: [{ name: 'Options', items: [I('A cephalosporin', 'Prefer one without the culprit’s side chain (e.g. avoid cefalexin after an amoxicillin rash)'), I('or a carbapenem', 'Cross-reactivity under 1%')] }],
      notes: ['Refer to allergy, or use a local de-labelling pathway (PEN-FAST may still be low).', CHECK, DOC]
    },
    R_urt: {
      title: 'Immediate reaction: urticaria or angioedema', tone: 'amber',
      summary: 'Avoid penicillins. Cephalosporins with a dissimilar side chain and carbapenems can be given, usually without testing.',
      regimens: [{ name: 'Options', items: [I('Cephalosporin with a dissimilar side chain', 'e.g. ceftriaxone, cefuroxime, cefazolin after an amoxicillin reaction'), I('or a carbapenem', 'Cross-reactivity under 1%'), I('or aztreonam', 'No cross-reactivity, except with ceftazidime-type side chains')] }],
      notes: ['Avoid cephalosporins sharing the culprit’s side chain (e.g. cefalexin, cefadroxil, cefaclor after amoxicillin).', 'Give the first dose where a reaction can be treated.', 'Refer to allergy for testing.', CHECK, DOC]
    },
    R_ana: {
      title: 'Immediate reaction: anaphylaxis', tone: 'red',
      summary: 'Avoid all penicillins. Use a non-β-lactam, or a β-lactam with a different side chain with appropriate monitoring.',
      regimens: [{ name: 'If a β-lactam is needed', items: [I('Carbapenem', 'Cross-reactivity under 1%; give under observation'), I('or Cephalosporin with a dissimilar side chain', 'e.g. cefazolin or ceftriaxone after amoxicillin; give in a monitored setting, or as a graded (test-dose) challenge per local policy'), I('or Aztreonam', 'Unless the reaction was to ceftazidime')] }],
      notes: ['Refer to an allergy clinic: skin testing can show which β-lactams are safe.', 'Penicillin-allergic patients who react to cephalosporins can have severe reactions: avoid shared side chains.', CHECK, DOC]
    },
    R_scar: {
      title: 'Severe delayed reaction (SJS/TEN, DRESS, AGEP, organ involvement)', tone: 'red',
      summary: 'Avoid all β-lactams unless an allergy specialist advises otherwise. Never rechallenge.',
      regimens: [{ name: 'Use non-β-lactam alternatives', items: [I('By indication', 'e.g. vancomycin or teicoplanin, doxycycline, co-trimoxazole, quinolones, aminoglycosides, clindamycin, linezolid')] }],
      notes: ['Drug challenge and desensitisation are contraindicated after SJS/TEN or DRESS (BSACI).', 'Refer to allergy (patch testing may be possible in specialist units).', DOC]
    },
    R_unknown: {
      title: 'Reaction not known', tone: 'amber',
      summary: 'Try to find out more (GP record, old notes, the patient’s family). Meanwhile assume an immediate, non-severe allergy.',
      regimens: [{ name: 'Options', items: [I('Cephalosporin with a dissimilar side chain', 'e.g. ceftriaxone, cefazolin'), I('or a carbapenem', 'Cross-reactivity under 1%')] }],
      notes: ['If the history becomes low risk, consider PEN-FAST and a direct oral challenge.', CHECK]
    }
  };

  window.GUIDES.pen = {
    Q: Q, R: R, eyebrow: 'Suggested approach',
    ref: 'From the BSACI β-lactam allergy guideline (2015) and de-labelling guidance, the 2022 US drug allergy practice parameter and PEN-FAST. Follow local allergy and de-labelling policies.'
  };
})();
