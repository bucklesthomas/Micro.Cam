/*
 * Spontaneous bacterial peritonitis (SBP) in adults with cirrhosis.
 * BSG/BASL guidelines on the management of ascites in cirrhosis (Aithal GP et al. Gut 2021;70:9-29).
 * EASL clinical practice guidelines for decompensated cirrhosis (J Hepatol 2018;69:406-460): albumin for all, duration, nosocomial regimens.
 * Secondary peritonitis criteria: Runyon / Akriviadis 1990. GI bleeding prophylaxis: BSG variceal guideline 2015, Baveno VII 2022.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }
  var ALB = 'Human albumin 20%: 1.5 g/kg IV within 6 hours of diagnosis, then 1 g/kg on day 3';
  var N = {
    local: 'Choose by setting, severity and local resistance: follow your local antimicrobial policy. Review with ascitic and blood culture results.',
    alb: 'Albumin reduces kidney injury and death. BSG recommends it when creatinine is raised or rising; EASL recommends it for all patients with SBP (benefit is greatest with creatinine > 88 µmol/L or bilirubin > 68 µmol/L).',
    tap48: 'Repeat the tap at 48 hours if not improving: a neutrophil fall of less than 25% suggests treatment failure (resistant organism or secondary peritonitis).',
    sec: 'Think secondary peritonitis (perforation or abscess) if: polymicrobial Gram stain or culture, or at least two of ascitic protein > 10 g/L, glucose < 2.8 mmol/L, LDH above the serum upper limit; or no response. Get a CT and a surgical opinion.',
    dur: 'Duration: usually 5–7 days if responding (EASL).',
    nsaid: 'Stop NSAIDs, nephrotoxins and, during the episode, diuretics if creatinine is rising; avoid large-volume paracentesis until resolving.',
    after: 'After an episode of SBP, start secondary prophylaxis and consider referral for liver transplant assessment.',
    bc: 'Inoculate blood culture bottles with ascitic fluid at the bedside (10 ml in each), and take blood cultures.'
  };

  var Q = {
    start: {
      q: 'What is the question?',
      options: [
        { label: 'Possible SBP: should I tap, and what does the result mean?', next: 'pmn' },
        { label: 'SBP confirmed: which antibiotic?', next: 'setting' },
        { label: 'Not improving after 48 hours', next: 'R_fail' },
        { label: 'Prophylaxis', next: 'proph' }
      ]
    },
    pmn: {
      q: 'What is the ascitic neutrophil count?',
      help: 'Tap everyone with cirrhosis and ascites admitted to hospital, and anyone with ascites who has GI bleeding, shock, fever or sepsis, GI symptoms, encephalopathy, or worsening liver or kidney function. Neutrophils = white cells × % neutrophils.',
      options: [
        { label: '250 per mm³ or more', sub: 'SBP', next: 'setting' },
        { label: 'Under 250, but culture positive', sub: 'Bacterascites', next: 'R_bact' },
        { label: 'Under 250, culture negative', next: 'R_no' },
        { label: 'Not tapped yet', next: 'R_tap' }
      ]
    },
    setting: {
      q: 'Where was the infection acquired, and is there a resistance risk?',
      help: 'Healthcare-associated: onset more than 48 hours after admission, or a hospital admission or long-term care in the last 90 days. Resistance risk: recent broad-spectrum antibiotics, quinolone prophylaxis, known ESBL, MRSA or VRE colonisation, ICU, or sepsis or shock.',
      options: [
        { label: 'Community-acquired, no resistance risk', next: 'R_comm' },
        { label: 'Healthcare-associated, or a resistance risk', next: 'R_noso' },
        { label: 'Severe penicillin allergy', next: 'R_allergy' }
      ]
    },
    proph: {
      q: 'Which situation?',
      options: [
        { label: 'After an episode of SBP', sub: 'Secondary prophylaxis', next: 'R_secondary' },
        { label: 'No previous SBP', sub: 'Primary prophylaxis', next: 'R_primary' },
        { label: 'Cirrhosis with GI bleeding', next: 'R_bleed' }
      ]
    }
  };

  var R = {
    R_tap: {
      title: 'Do a diagnostic paracentesis now', tone: 'amber',
      summary: 'Do not wait for a fever: SBP is often silent. A diagnostic tap is safe even with a raised INR or low platelets (no routine correction).',
      regimens: [],
      notes: ['Send for cell count with differential, Gram stain and culture, protein, albumin (for SAAG) and, if secondary peritonitis is possible, glucose and LDH.', N.bc, 'If the tap is delayed and the patient is septic, take blood cultures and start antibiotics; tap as soon as possible.']
    },
    R_comm: {
      title: 'Community-acquired SBP', tone: 'red',
      summary: 'Start antibiotics immediately and give albumin.',
      regimens: [
        { name: 'Example antibiotic (local policy)', items: [I('Ceftriaxone', '1–2 g IV once daily'), I('or Cefotaxime', '2 g IV every 8 hours (most studied)')] },
        { name: 'Plus', noOr: true, items: [I('Albumin', ALB)] }
      ],
      notes: [N.local, 'Avoid a quinolone if the patient was on quinolone prophylaxis.', N.alb, N.tap48, N.dur, N.nsaid, N.after]
    },
    R_noso: {
      title: 'Healthcare-associated SBP or resistance risk', tone: 'red',
      summary: 'Third-generation cephalosporins fail more often here: use broader cover and narrow with cultures.',
      regimens: [
        { name: 'Example antibiotic (local policy)', items: [I('Piperacillin–tazobactam', '4.5 g IV every 8 hours'), I('or Meropenem', '1 g IV every 8 hours (ESBL risk, or sepsis or shock)')] },
        { name: 'If MRSA or VRE risk, or Gram-positive cocci on stain', noOr: true, items: [I('Add vancomycin or daptomycin (VRE)', 'Microbiology advice')] },
        { name: 'Plus', noOr: true, items: [I('Albumin', ALB)] }
      ],
      notes: [N.local, N.alb, N.tap48, N.dur, N.nsaid, N.after]
    },
    R_allergy: {
      title: 'SBP with severe penicillin allergy', tone: 'red',
      regimens: [
        { name: 'Discuss with microbiology', items: [I('Ciprofloxacin', '400 mg IV every 12 hours (only if not on quinolone prophylaxis)'), I('or Meropenem', '1 g IV every 8 hours (carbapenem cross-reactivity is under 1%)')] },
        { name: 'Plus', noOr: true, items: [I('Albumin', ALB)] }
      ],
      notes: ['Many patients can safely receive a cephalosporin: check the reaction history (see the penicillin allergy page).', 'Aminoglycosides are best avoided in cirrhosis (high risk of kidney injury).', N.alb, N.tap48, N.dur]
    },
    R_bact: {
      title: 'Bacterascites (culture positive, neutrophils under 250)', tone: 'amber',
      summary: 'Repeat the tap. Treat if symptomatic or septic, or if the repeat neutrophil count is 250 or more.',
      regimens: [{ name: 'If treating', items: [I('As for SBP', 'Guided by the organism and susceptibility')] }],
      notes: ['Asymptomatic with a single organism: may clear spontaneously; repeat paracentesis when culture grows.', 'Skin organisms (e.g. coagulase-negative staphylococci) after a tap may be contaminants.']
    },
    R_no: {
      title: 'No evidence of SBP', tone: 'green',
      summary: 'Neutrophils under 250 per mm³ with a negative culture: SBP is unlikely.',
      regimens: [],
      notes: ['Look for another source if septic: chest, urine, skin, line, C. difficile.', 'Consider primary prophylaxis if ascitic protein is under 15 g/L.']
    },
    R_fail: {
      title: 'Not improving after 48 hours of treatment', tone: 'red',
      regimens: [{ name: 'While investigating', items: [I('Broaden', 'e.g. meropenem, ± vancomycin or daptomycin; microbiology advice')] }],
      notes: [N.tap48, N.sec, 'Check culture results and susceptibilities; send fungal cultures in severe or nosocomial cases.', 'Check for other infections and for acute kidney injury or hepatorenal syndrome.']
    },
    R_secondary: {
      title: 'Secondary prophylaxis after SBP', tone: 'green',
      summary: 'Recurrence is common (up to 70% at 1 year): offer long-term prophylaxis.',
      regimens: [{ name: 'BSG (start when treatment of the episode finishes)', items: [I('Ciprofloxacin', '500 mg orally once daily'), I('or Co-trimoxazole', '960 mg orally once daily')] }],
      notes: ['Norfloxacin 400 mg daily is an option where available (not marketed in the UK).', 'Review the need when ascites resolves, and refer for transplant assessment.', 'Quinolone warnings apply (tendons, aorta, nerves, mood); co-trimoxazole can raise potassium and creatinine.']
    },
    R_primary: {
      title: 'Primary prophylaxis (no previous SBP)', tone: 'amber',
      summary: 'Offer to high-risk patients (ascitic protein under 15 g/L), after discussing benefits and uncertainties (BSG, weak recommendation).',
      regimens: [{ name: 'Options', items: [I('Ciprofloxacin', '500 mg orally once daily'), I('or Co-trimoxazole', '960 mg orally once daily')] }],
      notes: ['Benefit is greatest with advanced liver failure (e.g. Child–Pugh ≥ 9 with bilirubin ≥ 51 µmol/L) or renal impairment or hyponatraemia (EASL).', 'Weigh the risk of resistant organisms and C. difficile.']
    },
    R_bleed: {
      title: 'Antibiotic prophylaxis in cirrhosis with GI bleeding', tone: 'red',
      summary: 'Give prophylactic antibiotics to all (reduces infection, rebleeding and death).',
      regimens: [{ items: [I('Ceftriaxone', '1 g IV once daily', 'Up to 7 days (usually stopped earlier once bleeding is controlled and well)')] }],
      notes: ['Choose by local resistance (BSG; ceftriaxone per Baveno VII).', 'Tap if ascites is present to exclude SBP before prophylaxis becomes treatment.']
    }
  };

  window.GUIDES.sbp = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From the BSG/BASL ascites guideline (Gut 2021), EASL decompensated cirrhosis guideline (2018) and Baveno VII. Adult doses; follow local policy and adjust for renal function.'
  };
})();
