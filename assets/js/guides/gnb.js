/*
 * Gram-negative bacteraemia in adults: empirical choice, targeted therapy by organism and resistance, duration and oral step-down.
 * Resistant organisms: IDSA 2024 guidance on the treatment of antimicrobial-resistant Gram-negative infections (Tamma PD et al.).
 * ESBL and piperacillin–tazobactam: MERINO trial (Harris PNA et al. JAMA 2018).
 * Duration: BALANCE trial (Daneman N et al. N Engl J Med 2025), 7 vs 14 days.
 * IV-to-oral: UKHSA national IVOS criteria (2024). Empirical choices are examples only: local policy takes precedence.
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    cro:  'Ceftriaxone 2 g IV once daily',
    coam: 'Co-amoxiclav 1.2 g IV every 8 hours',
    gent: 'Gentamicin 5–7 mg/kg IV once daily (local nomogram)',
    amik: 'Amikacin 15 mg/kg IV once daily (25–30 mg/kg in septic shock, local policy)',
    tazo: 'Piperacillin–tazobactam 4.5 g IV every 8 hours (every 6 hours if severe; extended infusion)',
    mero: 'Meropenem 1 g IV every 8 hours (2 g every 8 hours for CNS infection or Pseudomonas with high MIC)',
    erta: 'Ertapenem 1 g IV once daily',
    temo: 'Temocillin 2 g IV every 12 hours (every 8 hours if severe)',
    fep:  'Cefepime 2 g IV every 8 hours',
    caz:  'Ceftazidime 2 g IV every 8 hours',
    cza:  'Ceftazidime–avibactam 2.5 g IV every 8 hours over 2 hours',
    azt:  'Aztreonam 2 g IV every 8 hours, given at the same time as ceftazidime–avibactam',
    fdc:  'Cefiderocol 2 g IV every 8 hours over 3 hours',
    ct:   'Ceftolozane–tazobactam 1.5–3 g IV every 8 hours',
    metro:'Metronidazole 500 mg IV every 8 hours',
    cipro:'Ciprofloxacin 500–750 mg orally every 12 hours',
    sxt:  'Co-trimoxazole 960 mg orally every 12 hours',
    sxtH: 'Co-trimoxazole high dose: trimethoprim component 8–12 mg/kg/day in 2–3 divided doses'
  };
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var N = {
    local: 'Empirical regimens are examples: follow your local antimicrobial policy, which reflects local resistance rates.',
    source: 'Source control is the most important step: relieve obstruction (urinary or biliary), drain collections and remove infected lines or devices.',
    repeat: 'Repeat blood cultures are not routinely needed for Gram-negative bacteraemia that is responding, but do take them if there is no improvement after 48–72 hours, an endovascular source is possible, or the source is uncontrolled.',
    narrow: 'Narrow to the most targeted agent once susceptibilities are known. Check the isolate in the EUCAST breakpoint interpreter and the coverage checker.',
    shock: 'Septic shock: a single dose of an aminoglycoside (gentamicin or amikacin) can be added to the β-lactam while susceptibilities are awaited.',
    ivos: 'Switch to oral when the UKHSA IV-to-oral criteria are met (see the IV-to-oral and durations page). Highly bioavailable options by susceptibility: ciprofloxacin, levofloxacin, co-trimoxazole; oral β-lactams are reasonable for a urinary source with good response.',
    dur7: 'Duration: 7 days is non-inferior to 14 days for most bloodstream infections with clinical improvement and source control (BALANCE trial; excluded S. aureus, candidaemia and severe immunosuppression).',
    micro: 'Discuss with microbiology now and inform infection prevention and control: carbapenemase producers need contact precautions and screening of contacts.',
    mic: 'Ask the laboratory for carbapenemase typing (KPC, OXA-48-like, NDM, VIM, IMP): the enzyme decides the drug.'
  };

  var Q = {
    start: {
      q: 'What do you know so far?',
      options: [
        { label: 'Gram-negative rods in blood, organism not yet identified', sub: 'Choose empirical treatment', next: 'src' },
        { label: 'Organism identified', sub: 'Targeted treatment', next: 'org' },
        { label: 'Responding to treatment', sub: 'Duration and oral switch', next: 'dur' }
      ]
    },
    src: {
      q: 'What is the likely source?',
      options: [
        { label: 'Urinary tract', next: 'risk' },
        { label: 'Biliary or intra-abdominal', next: 'risk' },
        { label: 'Line or device', next: 'risk' },
        { label: 'Hospital-acquired pneumonia', next: 'risk' },
        { label: 'Neutropenic', sub: 'See the neutropenic sepsis guide', next: 'R_neut' },
        { label: 'Unknown', next: 'risk' }
      ]
    },
    risk: {
      q: 'Any risk of a resistant organism?',
      help: 'Check previous microbiology (including screening swabs), antibiotics in the last 3 months, hospital admission abroad or in a high-prevalence unit in the last 12 months, and long-term care.',
      options: [
        { label: 'No particular risk', next: 'R_emp' },
        { label: 'ESBL risk or previous ESBL', next: 'R_emp' },
        { label: 'Known or suspected carbapenemase producer (CPE)', sub: 'Carrier, contact, or hospital care abroad', next: 'R_emp' },
        { label: 'Pseudomonas risk', sub: 'Previous Pseudomonas, structural lung disease, long admission, recent broad-spectrum antibiotics', next: 'R_emp' }
      ]
    },
    org: {
      q: 'Which organism?',
      options: [
        { label: 'E. coli, Klebsiella or Proteus, no ESBL', next: 'R_ent' },
        { label: 'ESBL-producing Enterobacterales', next: 'R_esbl' },
        { label: 'Enterobacter, K. aerogenes or C. freundii', sub: 'High-risk chromosomal AmpC', next: 'R_ampc' },
        { label: 'Serratia, Morganella or Providencia', sub: 'Low-risk AmpC', next: 'R_ampcLow' },
        { label: 'Carbapenemase producer (CPE)', next: 'cpe' },
        { label: 'Pseudomonas aeruginosa', next: 'psa' },
        { label: 'Acinetobacter baumannii', next: 'R_acb' },
        { label: 'Stenotrophomonas maltophilia', next: 'R_steno' },
        { label: 'Salmonella Typhi or Paratyphi', next: 'R_typh' }
      ]
    },
    cpe: {
      q: 'Which carbapenemase?',
      options: [
        { label: 'KPC', next: 'R_kpc' },
        { label: 'OXA-48-like', next: 'R_oxa' },
        { label: 'Metallo-β-lactamase (NDM, VIM or IMP)', next: 'R_mbl' },
        { label: 'Not known yet', next: 'R_cpeUnk' }
      ]
    },
    psa: {
      q: 'What is the susceptibility pattern?',
      options: [
        { label: 'Susceptible to standard antipseudomonal agents', next: 'R_psa' },
        { label: 'Difficult to treat', sub: 'Resistant to piperacillin–tazobactam, ceftazidime, cefepime, aztreonam, carbapenems and quinolones', next: 'R_dtr' }
      ]
    },
    dur: {
      q: 'Is this uncomplicated?',
      help: 'Uncomplicated means: source controlled, clinically improving within 72 hours, not severely immunosuppressed (e.g. neutropenia, recent transplant), and no endovascular, bone, abscess or other deep-seated focus.',
      options: [
        { label: 'Yes, uncomplicated', next: 'R_7' },
        { label: 'No', sub: 'Undrained focus, endovascular or deep infection, slow response or severe immunosuppression', next: 'R_long' }
      ]
    }
  };

  function emp(a) {
    var s = a.src ? a.src.i : 5, r = a.risk ? a.risk.i : 0;
    var names = ['Urinary source', 'Biliary or intra-abdominal source', 'Line-related', 'Hospital-acquired pneumonia', '', 'Unknown source'];
    var regs, tone = 'amber', summary = 'Take blood cultures from all sites first, then treat within 1 hour if septic.';
    if (r === 2) {
      tone = 'red';
      summary = 'Suspected carbapenemase producer: start a carbapenem-sparing agent active against the likely enzyme and call microbiology.';
      regs = [
        { name: 'If the enzyme is known from screening', noOr: true, items: [I('KPC or OXA-48', D.cza), I('Metallo-β-lactamase', D.cza + ' plus ' + D.azt + '; or ' + D.fdc)] },
        { name: 'If not known', items: [I('Discuss urgently with microbiology', 'Often ' + D.cza + ' plus ' + D.azt + ' until typing is back, plus ' + D.amik)] }
      ];
    } else if (r === 1) {
      regs = [{ name: 'ESBL risk', items: [I('Meropenem', D.mero)] }, { name: 'Stable, no Pseudomonas risk', items: [I('Ertapenem', D.erta)] }];
      if (s === 0) regs.push({ name: 'Urinary source, stable', items: [I('Amikacin', D.amik), I('or Temocillin', D.temo)] });
    } else if (r === 3) {
      regs = [{ name: 'Antipseudomonal', items: [I('Piperacillin–tazobactam', D.tazo)] }, { name: 'Alternatives', items: [I('Ceftazidime', D.caz), I('or Meropenem (if ESBL risk too)', D.mero)] }];
    } else if (s === 0) {
      regs = [{ name: 'Example regimens', items: [I('Ceftriaxone', D.cro)] }, { items: [I('Co-amoxiclav', D.coam), I('plus Gentamicin', D.gent)] }, { name: 'Severe penicillin allergy', items: [I('Gentamicin', D.gent + ' (alone, or with a second agent per local policy)')] }];
    } else if (s === 1) {
      regs = [{ name: 'Example regimens', items: [I('Piperacillin–tazobactam', D.tazo)] }, { items: [I('Co-amoxiclav', D.coam), I('plus Gentamicin', D.gent)] }, { name: 'Severe penicillin allergy', items: [I('Gentamicin', D.gent), I('plus Metronidazole', D.metro)] }];
    } else {
      regs = [{ name: 'Example regimen', items: [I('Piperacillin–tazobactam', D.tazo)] }, { name: 'Severe penicillin allergy', items: [I('Gentamicin or ciprofloxacin', D.gent + '; or ciprofloxacin 400 mg IV every 8–12 hours')] }];
    }
    var notes = [N.local, N.source, N.shock];
    if (s === 2) notes.unshift('Line-related: remove a short-term catheter. Pseudomonas, Acinetobacter and Stenotrophomonas usually mean the line must come out.');
    if (s === 3) notes.unshift('Hospital-acquired pneumonia: cover Pseudomonas if risk factors or local rates are high.');
    if (r === 2) notes.unshift(N.micro, N.mic);
    notes.push(N.repeat, N.narrow);
    return { title: 'Empirical treatment: ' + (names[s] || 'Gram-negative bacteraemia').toLowerCase().replace(/^\w/, function (c) { return c.toUpperCase(); }), tone: tone, summary: summary, regimens: regs, notes: notes };
  }

  var R = {
    R_emp: emp,
    R_neut: {
      title: 'Gram-negative bacteraemia in neutropenia', tone: 'red',
      summary: 'Treat as neutropenic sepsis: see the neutropenic sepsis guide.',
      regimens: [{ name: 'Usual empirical choice (NICE)', items: [I('Piperacillin–tazobactam', D.tazo)] }],
      notes: ['Use meropenem if ESBL colonised or previous ESBL infection.', 'Do not step down to oral or shorten treatment while still neutropenic without haematology agreement.', N.shock]
    },
    R_ent: {
      title: 'Susceptible Enterobacterales (E. coli, Klebsiella, Proteus)', tone: 'green',
      regimens: [{ name: 'Narrow to the most targeted agent the isolate is susceptible to', items: [I('Ceftriaxone', D.cro), I('or Co-amoxiclav or amoxicillin', 'If susceptible')] }, { name: 'Oral step-down', noOr: true, items: [I('By susceptibility', D.cipro + '; or ' + D.sxt + '; or an oral β-lactam for a urinary source')] }],
      notes: [N.dur7, N.ivos, N.source]
    },
    R_esbl: {
      title: 'ESBL-producing Enterobacterales bacteraemia', tone: 'amber',
      summary: 'A carbapenem is preferred for bloodstream infection. Avoid piperacillin–tazobactam even if reported susceptible (MERINO).',
      regimens: [{ name: 'Preferred', items: [I('Meropenem', D.mero), I('or Ertapenem (if stable and albumin not very low)', D.erta)] }, { name: 'Carbapenem-sparing, urinary source (local policy)', items: [I('Temocillin', D.temo), I('or Amikacin', D.amik)] }, { name: 'Oral step-down when criteria met', noOr: true, items: [I('By susceptibility', D.cipro + '; or ' + D.sxt + '; pivmecillinam or nitrofurantoin only for cystitis, not bacteraemia')] }],
      notes: ['IDSA 2024 prefers ciprofloxacin, levofloxacin or co-trimoxazole for oral step-down once improving, if susceptible.', N.dur7, N.ivos, N.source]
    },
    R_ampc: {
      title: 'High-risk AmpC producer (Enterobacter, K. aerogenes, C. freundii)', tone: 'amber',
      summary: 'Avoid ceftriaxone, cefotaxime, ceftazidime and piperacillin–tazobactam for serious infection: resistance can emerge during treatment.',
      regimens: [{ name: 'Preferred if cefepime MIC ≤ 2 mg/L', items: [I('Cefepime', D.fep)] }, { name: 'Otherwise, or if ESBL also produced', items: [I('Meropenem or ertapenem', D.mero + '; or ' + D.erta)] }, { name: 'Alternative', items: [I('Temocillin', D.temo)] }, { name: 'Oral step-down', noOr: true, items: [I('By susceptibility', D.cipro + '; or ' + D.sxt)] }],
      notes: ['A cefepime MIC of 4–8 mg/L suggests ESBL co-production: use a carbapenem.', N.dur7, N.ivos, N.source]
    },
    R_ampcLow: {
      title: 'Low-risk AmpC producer (Serratia, Morganella, Providencia)', tone: 'green',
      summary: 'Clinically significant AmpC derepression is uncommon: treat according to the susceptibility results (IDSA 2024).',
      regimens: [{ name: 'If susceptible', items: [I('Ceftriaxone', D.cro), I('or Cefepime', D.fep)] }, { name: 'Oral step-down', noOr: true, items: [I('By susceptibility', D.cipro + '; or ' + D.sxt)] }],
      notes: ['Serratia, Morganella and Providencia are intrinsically resistant to colistin and nitrofurantoin; Morganella and Providencia also to tetracyclines and tigecycline.', N.dur7, N.ivos]
    },
    R_kpc: {
      title: 'KPC-producing Enterobacterales', tone: 'red',
      regimens: [{ name: 'Preferred (IDSA 2024)', items: [I('Ceftazidime–avibactam', D.cza), I('or Meropenem–vaborbactam', '4 g IV every 8 hours (where available)'), I('or Imipenem–relebactam', '1.25 g IV every 6 hours (where available)')] }, { name: 'Alternative', items: [I('Cefiderocol', D.fdc)] }],
      notes: [N.micro, 'Polymyxin-based regimens are a last resort. Monitor for resistance to ceftazidime–avibactam on treatment.', N.source]
    },
    R_oxa: {
      title: 'OXA-48-like carbapenemase producer', tone: 'red',
      regimens: [{ name: 'Preferred (IDSA 2024)', items: [I('Ceftazidime–avibactam', D.cza)] }, { name: 'Alternative', items: [I('Cefiderocol', D.fdc)] }],
      notes: [N.micro, 'Temocillin is not active against OXA-48 producers. Meropenem–vaborbactam and imipenem–relebactam are not reliable.', N.source]
    },
    R_mbl: {
      title: 'Metallo-β-lactamase producer (NDM, VIM or IMP)', tone: 'red',
      regimens: [{ name: 'Preferred (IDSA 2024)', items: [I('Ceftazidime–avibactam plus aztreonam', D.cza + ' plus ' + D.azt)] }, { name: 'Alternative', items: [I('Cefiderocol', D.fdc)] }],
      notes: [N.micro, 'Aztreonam is stable to metallo-β-lactamases but is broken down by the ESBL or AmpC enzymes these isolates usually also carry: avibactam protects it.', 'Aztreonam–avibactam (single product) may be available: discuss with microbiology.', N.source]
    },
    R_cpeUnk: {
      title: 'Carbapenemase producer, enzyme not yet known', tone: 'red',
      summary: 'Treat for the worst case until the enzyme is known.',
      regimens: [{ items: [I('Ceftazidime–avibactam plus aztreonam', D.cza + ' plus ' + D.azt)] }, { items: [I('Cefiderocol', D.fdc)] }],
      notes: [N.mic, N.micro, 'Rapid lateral-flow or PCR enzyme tests are often available the same day: ask the laboratory.']
    },
    R_psa: {
      title: 'Pseudomonas aeruginosa bacteraemia', tone: 'amber',
      regimens: [{ name: 'By susceptibility', items: [I('Piperacillin–tazobactam', D.tazo), I('or Ceftazidime', D.caz), I('or Cefepime', D.fep), I('or Meropenem', D.mero)] }, { name: 'Oral step-down', noOr: true, items: [I('Ciprofloxacin', 'Ciprofloxacin 750 mg orally every 12 hours, if susceptible')] }],
      notes: ['Combination therapy is not needed once susceptibilities are known (IDSA 2024). Use extended infusions of β-lactams in critical illness.', 'Remove any infected line or device.', N.dur7, N.ivos]
    },
    R_dtr: {
      title: 'Difficult-to-treat Pseudomonas aeruginosa', tone: 'red',
      regimens: [{ name: 'Preferred (IDSA 2024), by susceptibility', items: [I('Ceftolozane–tazobactam', D.ct), I('or Ceftazidime–avibactam', D.cza), I('or Imipenem–relebactam', '1.25 g IV every 6 hours (where available)')] }, { name: 'Alternative', items: [I('Cefiderocol', D.fdc)] }],
      notes: [N.micro, 'Aminoglycosides alone are not recommended except for a urinary source. Tobramycin or amikacin can be added while susceptibilities are pending.', 'Send the isolate for full susceptibility testing including newer agents; metallo-β-lactamase producers need cefiderocol or combination therapy.']
    },
    R_acb: {
      title: 'Acinetobacter baumannii bacteraemia', tone: 'red',
      summary: 'Check the line: Acinetobacter bacteraemia is often catheter-related. Discuss with microbiology.',
      regimens: [{ name: 'Carbapenem-susceptible', items: [I('Meropenem', D.mero)] }, { name: 'Carbapenem-resistant (IDSA 2024)', items: [I('Sulbactam–durlobactam plus a carbapenem', 'Where available'), I('or High-dose ampicillin–sulbactam combination, cefiderocol, or colistin combinations', 'Microbiology advice')] }],
      notes: ['Remove the infected line.', 'Intrinsically resistant to ertapenem, aztreonam, trimethoprim and tetracycline. Tigecycline levels in blood are too low for bacteraemia.', 'Cefiderocol was associated with higher mortality in Acinetobacter infection in CREDIBLE-CR: use only in combination and with specialist advice.']
    },
    R_steno: {
      title: 'Stenotrophomonas maltophilia bacteraemia', tone: 'amber',
      summary: 'Usually line-related or in immunocompromised or ventilated patients: remove the line.',
      regimens: [{ name: 'IDSA 2024: combination while improving, then often monotherapy', noOr: true, items: [I('Co-trimoxazole', D.sxtH), I('plus Minocycline, levofloxacin or cefiderocol', 'By susceptibility')] }, { name: 'Alternative', items: [I('Ceftazidime–avibactam plus aztreonam', D.cza + ' plus ' + D.azt)] }],
      notes: ['Intrinsically resistant to carbapenems (L1 metallo-β-lactamase) and aminoglycosides.', 'Check potassium, renal function and blood count on high-dose co-trimoxazole.']
    },
    R_typh: {
      title: 'Enteric fever (Salmonella Typhi or Paratyphi)', tone: 'amber',
      regimens: [{ name: 'Uncomplicated, no XDR risk', items: [I('Ceftriaxone', D.cro + ', then azithromycin orally once improving'), I('or Azithromycin', '500 mg–1 g orally once daily (if susceptible)')] }, { name: 'XDR Typhi (Pakistan) or severe', items: [I('Meropenem', D.mero + ', with or without azithromycin')] }],
      notes: ['Most isolates from South Asia are resistant to ciprofloxacin.', 'Usual course 7–14 days. Notify the case (food handlers and children need exclusion and clearance samples).', 'See the returned traveller guide.']
    },
    R_7: {
      title: 'Uncomplicated Gram-negative bacteraemia: duration', tone: 'green',
      summary: '7 days in total (from the first effective dose) is enough for most patients.',
      regimens: [{ name: 'Oral step-down by susceptibility', items: [I('Ciprofloxacin or levofloxacin', D.cipro + '; or levofloxacin 500–750 mg once daily')] }, { items: [I('Co-trimoxazole', D.sxt)] }, { items: [I('Oral β-lactam', 'e.g. co-amoxiclav or cefalexin for a urinary source with good response')] }],
      notes: [N.dur7, N.ivos, 'Longer courses are still needed for undrained collections, endovascular infection, bone and joint infection, prostatitis and severe immunosuppression.']
    },
    R_long: {
      title: 'Complicated Gram-negative bacteraemia: duration', tone: 'amber',
      summary: 'Treat for at least 14 days and guide the duration by the focus.',
      regimens: [],
      notes: ['Undrained abscess: treat until drained or radiologically resolved.', 'Endovascular infection or infected graft: usually 4–6 weeks, with specialist input.', 'Osteomyelitis: about 6 weeks. Prostatitis: 2–4 weeks with a quinolone or co-trimoxazole.', 'Neutropenia: continue until neutrophil recovery and clinical response (haematology).', 'Look for the reason the response is slow: repeat imaging and blood cultures, and review source control.', N.ivos]
    }
  };

  window.GUIDES.gnb = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the IDSA 2024 guidance on antimicrobial-resistant Gram-negative infections, the MERINO and BALANCE trials and the UKHSA IV-to-oral switch criteria. Empirical choices are examples: follow local policy. Adult doses; adjust for renal function and weight.'
  };
})();
