/*
 * Acute meningitis and encephalitis in adults.
 * Meningitis: NICE NG240, Meningitis (bacterial) and meningococcal disease (March 2024), with drug doses and
 *   penicillin-susceptible pneumococcal options from the UK joint specialist societies guideline (McGill F et al. J Infect 2016).
 * Encephalitis: Management of suspected infectious and autoimmune encephalitis in adults: UK Joint Societies (Michael BD et al. J Infect 2026).
 * Contact prophylaxis: UKHSA meningococcal guidance (December 2025).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    cro:   'Ceftriaxone 2 g IV every 12 hours',
    ctx:   'Cefotaxime 2 g IV every 6 hours',
    amox:  'Amoxicillin 2 g IV every 4 hours',
    vanc:  'Vancomycin 15–20 mg/kg IV every 12 hours (adjust to levels)',
    rif:   'Rifampicin 600 mg IV or orally every 12 hours',
    chlor: 'Chloramphenicol 25 mg/kg IV every 6 hours',
    sxt:   'Co-trimoxazole 10–20 mg/kg/day (trimethoprim component) IV in 4 divided doses',
    benpen:'Benzylpenicillin 2.4 g IV every 4 hours',
    gent:  'Gentamicin 5 mg/kg IV once daily (levels)',
    dex:   'Dexamethasone 10 mg IV every 6 hours for 4 days',
    acv:   'Aciclovir 10 mg/kg IV every 8 hours (ideal body weight if obese)'
  };
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var N = {
    time: 'Give antibiotics within 1 hour of arrival. If the LP cannot be done within 1 hour, take blood cultures and give antibiotics first.',
    ct: 'CT before LP only if there are risk factors for a space-occupying lesion or signs of raised intracranial pressure (NICE NG240): new focal neurological features (including seizures or posturing), abnormal pupillary reactions, GCS ≤ 9, or a progressive, sustained or rapid fall in consciousness. Do not delay antibiotics for the scan.',
    lpNo: 'Do not do an LP with extensive or rapidly spreading purpura, infection at the LP site, or the features above. Treat and stabilise first if there is an unprotected airway, respiratory compromise, shock, uncontrolled seizures or a bleeding risk.',
    csf: 'CSF: opening pressure, cell count, protein, paired glucose, Gram stain, culture, and PCR for meningococcus, pneumococcus, HSV-1/2, VZV and enterovirus. Blood: cultures, meningococcal and pneumococcal PCR, glucose, HIV test.',
    dex: 'Give dexamethasone with or just before the first antibiotic dose, without delaying antibiotics (up to 12 hours after; later only on specialist advice). Continue for 4 days only if pneumococcus or H. influenzae type b is found; stop for other organisms. If no organism is found, take infection specialist advice.',
    notify: 'Notify suspected bacterial meningitis and meningococcal disease to the local health protection team now: they arrange contact prophylaxis (see the contact prophylaxis guide).',
    enc: 'If there are features of encephalitis (altered behaviour, cognition or consciousness, seizures or focal signs), add aciclovir.',
    hiv: 'Test for HIV in everyone with meningitis or encephalitis.'
  };

  var Q = {
    start: {
      q: 'What is the clinical picture?',
      options: [
        { label: 'Suspected bacterial meningitis', sub: 'Fever, headache, neck stiffness, rash or reduced consciousness', next: 'lp' },
        { label: 'Suspected encephalitis', sub: 'Altered behaviour, cognition or consciousness, seizures, focal signs', next: 'R_enc' },
        { label: 'CSF or organism result known', next: 'known' }
      ]
    },
    lp: {
      q: 'Any reason to delay the LP?',
      help: N.ct + ' ' + N.lpNo,
      options: [
        { label: 'No: LP within 1 hour', next: 'host' },
        { label: 'Yes: CT first, or LP contraindicated', sub: 'Blood cultures and antibiotics now, LP later if safe', next: 'host' }
      ]
    },
    host: {
      q: 'Which apply?',
      help: 'Choose the most important one.',
      options: [
        { label: 'None of these', next: 'R_emp' },
        { label: 'Listeria risk factors', sub: 'Older age (e.g. over 60), immunosuppression, pregnancy, cancer, diabetes, kidney or liver disease, alcohol misuse', next: 'R_emp' },
        { label: 'Recent travel outside the UK, or known resistant organisms', sub: 'Risk of penicillin-resistant pneumococci or cephalosporin-resistant Enterobacterales', next: 'R_emp' },
        { label: 'Anaphylaxis to penicillin or cephalosporin', next: 'R_emp' }
      ]
    },
    known: {
      q: 'What has been found?',
      options: [
        { label: 'Bacterial CSF picture, no organism', sub: 'High neutrophils, high protein, low glucose ratio', next: 'R_unk' },
        { label: 'Neisseria meningitidis', next: 'R_men' },
        { label: 'Streptococcus pneumoniae', next: 'pnc' },
        { label: 'Listeria monocytogenes', next: 'R_lis' },
        { label: 'Haemophilus influenzae', next: 'R_hflu' },
        { label: 'Group B streptococcus', next: 'R_gbs' },
        { label: 'Enterobacterales (coliforms)', next: 'R_coli' },
        { label: 'HSV or VZV PCR positive', next: 'R_hsv' },
        { label: 'Enterovirus PCR positive', sub: 'Viral meningitis', next: 'R_ent' },
        { label: 'Cryptococcal antigen positive', next: 'R_crypto' },
        { label: 'Possible TB meningitis', sub: 'Lymphocytic CSF, very low glucose, high protein, subacute', next: 'R_tb' }
      ]
    },
    pnc: {
      q: 'Penicillin and cephalosporin susceptibility?',
      options: [
        { label: 'Penicillin susceptible', sub: 'Benzylpenicillin MIC ≤ 0.06 mg/L', next: 'R_pncS' },
        { label: 'Penicillin resistant, ceftriaxone susceptible', next: 'R_pncR' },
        { label: 'Ceftriaxone resistant', sub: 'MIC > 0.5 mg/L', next: 'R_pncCR' },
        { label: 'Not known yet', next: 'R_pncU' }
      ]
    }
  };

  function emp(a) {
    var h = a.host ? a.host.i : 0, late = a.lp && a.lp.i === 1;
    var regs = [];
    if (h === 3) {
      regs.push({ name: 'Severe penicillin or cephalosporin allergy (NICE)', noOr: true, items: [I('Chloramphenicol', D.chlor), I('plus Co-trimoxazole', D.sxt + ' (if Listeria risk factors)')] });
    } else {
      var items = [I('Ceftriaxone', D.cro + '; or ' + D.ctx)];
      if (h === 1) items.push(I('plus Amoxicillin', D.amox + ' (Listeria cover)'));
      if (h === 2) items.push(I('Get infection specialist advice now (NICE)', 'The UK 2016 guideline adds ' + D.vanc + '; or ' + D.rif + ', for possible penicillin-resistant pneumococci'));
      regs.push({ name: 'Empirical antibiotics', noOr: true, items: items });
    }
    regs.push({ name: 'Adjunct', noOr: true, items: [I('Dexamethasone', D.dex)] });
    var notes = [N.time];
    if (late) notes.push('LP delayed: send blood cultures and blood PCR now, and do the LP once safe (ideally within 4 hours of antibiotics: CSF PCR stays positive for longer than culture).');
    if (h === 3) notes.push('Non-severe allergy: ceftriaxone can still be given (add co-trimoxazole instead of amoxicillin for Listeria risk). Take infection specialist advice, especially in pregnancy.');
    notes.push(N.dex, N.enc, N.csf, N.notify, N.hiv);
    return { title: 'Suspected bacterial meningitis: empirical treatment', tone: 'red', summary: 'Medical emergency: blood cultures, then antibiotics within 1 hour.', regimens: regs, notes: notes };
  }

  var R = {
    R_emp: emp,
    R_enc: {
      title: 'Suspected encephalitis', tone: 'red',
      summary: 'Start IV aciclovir as soon as possible, ideally within 6 hours of admission, and do the LP at the earliest safe opportunity.',
      regimens: [{ name: 'Empirical', noOr: true, items: [I('Aciclovir', D.acv)] }, { name: 'If bacterial meningitis is possible', noOr: true, items: [I('Add empirical meningitis treatment', 'Ceftriaxone ± amoxicillin, with dexamethasone (see the meningitis route)')] }],
      notes: [
        'CT before LP if there may be mass effect: GCS < 13 or a fall of more than 2 points, focal signs, abnormal posture, papilloedema, new seizures or severe immunocompromise. If CT is needed, aim for the LP within 6 hours.',
        'CSF: opening pressure, cells, protein, glucose, culture, and PCR for at least HSV-1, HSV-2, VZV and enterovirus; store spare CSF. Repeat the LP at 24–48 hours if non-diagnostic and suspicion remains.',
        'MRI within 24 hours (no later than 48 hours); consider EEG within 48–72 hours to exclude non-convulsive status.',
        'Test for HIV in everyone. Returned travellers: malaria tests and the UKHSA Imported Fever Service.',
        'Stop aciclovir only if HSV is unlikely or another diagnosis is made, CSF HSV PCR is negative twice 48 hours apart (or once more than 72 hours after symptom onset), and any MRI after 48 hours is not typical of HSV.',
        'Autoimmune encephalitis: send CSF and serum antibodies early (NMDAR, LGI1, CASPR2, AMPAR, GABA-A/B, DPPX). If suspicion is high and infection reasonably excluded, start IV methylprednisolone 1 g daily for 3–7 days with IVIG or plasma exchange (neurology).',
        'Rapid improvement within 48 hours should make you reconsider the diagnosis; deterioration after 48–72 hours: think non-convulsive status, cerebral oedema or aciclovir neurotoxicity.'
      ]
    },
    R_unk: {
      title: 'Bacterial meningitis, no organism identified', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '10 days, then stop if recovered (NICE)')] }, { name: 'If Listeria risk', noOr: true, items: [I('plus Amoxicillin', D.amox, 'Until Listeria is excluded (21 days if not)')] }],
      notes: ['Applies when the CSF suggests bacterial meningitis but blood culture and blood PCR are negative. Take infection specialist advice if not recovered at 10 days.', 'Check blood and CSF PCR results before settling on a duration; a partially treated meningococcal infection is common.', N.dex, N.hiv]
    },
    R_men: {
      title: 'Meningococcal meningitis or septicaemia', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '5 days')] }, { items: [I('Benzylpenicillin', D.benpen + ' (if susceptible)', '5 days')] }],
      notes: ['Stop dexamethasone once meningococcal disease is confirmed (NICE).', 'Ceftriaxone clears carriage; other antibiotics need a dose of ciprofloxacin before discharge.', 'Notify urgently: close contacts need ciprofloxacin and, for serogroups A, C, W and Y, MenACWY vaccine (see the contact prophylaxis guide).', 'Check for complement deficiency after recurrent or unusual-serogroup disease, and offer the missed vaccines.']
    },
    R_pncS: {
      title: 'Pneumococcal meningitis, penicillin susceptible', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '10 days if recovered')] }, { items: [I('Benzylpenicillin', D.benpen + ' (UK 2016 option if MIC ≤ 0.06 mg/L)', '10 days if recovered')] }],
      notes: ['NICE NG240: stop at 10 days if recovered; take specialist advice if not (the UK 2016 guideline used up to 14 days).', 'Continue dexamethasone for 4 days.', 'Look for a source: otitis, sinusitis, CSF leak (recurrent cases), and test for HIV, hyposplenism and immunoglobulin deficiency.', 'Hearing assessment before or soon after discharge.']
    },
    R_pncR: {
      title: 'Pneumococcal meningitis, penicillin resistant, ceftriaxone susceptible', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '10 days if recovered')] }],
      notes: ['Stop vancomycin or rifampicin if they were started empirically.', 'Continue dexamethasone for 4 days.', 'Audiological assessment within 4 weeks of being well enough, preferably before discharge.']
    },
    R_pncCR: {
      title: 'Pneumococcal meningitis, ceftriaxone resistant', tone: 'red',
      regimens: [{ name: 'Discuss with microbiology', noOr: true, items: [I('Ceftriaxone', D.cro), I('plus Vancomycin', D.vanc), I('and/or Rifampicin', D.rif)] }],
      notes: ['Dexamethasone reduces vancomycin penetration into CSF; rifampicin is often added for this reason.', 'Consider a repeat LP at 48 hours if not improving.', 'Duration usually 14 days: specialist advice.']
    },
    R_pncU: {
      title: 'Pneumococcal meningitis, susceptibilities pending', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro)] }, { name: 'If travel risk', noOr: true, items: [I('plus Vancomycin or rifampicin', D.vanc + '; or ' + D.rif)] }],
      notes: ['Continue dexamethasone for 4 days.', 'Rationalise once the penicillin and ceftriaxone MICs are back. Total 10 days if recovered (NICE).']
    },
    R_lis: {
      title: 'Listeria meningitis or rhombencephalitis', tone: 'red',
      regimens: [{ noOr: true, items: [I('Amoxicillin', D.amox, '21 days'), I('Consider adding Co-trimoxazole (specialist advice, NICE)', D.sxt, 'First 7 days')] }, { name: 'Penicillin allergy', items: [I('Co-trimoxazole', D.sxt, '21 days')] }],
      notes: ['Cephalosporins are not active against Listeria.', 'Older guidance (UK 2016) added gentamicin for the first 7 days instead of co-trimoxazole.', 'Observational data suggest dexamethasone may be harmful in Listeria meningitis: stop it once Listeria is confirmed.', 'Look for immunosuppression; pregnancy needs obstetric input.']
    },
    R_hflu: {
      title: 'Haemophilus influenzae meningitis', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '7 days if recovered, otherwise 10 days')] }],
      notes: ['Continue dexamethasone for 4 days (type b).', 'Take infection specialist advice at the start (NICE).', 'Type b (Hib): rifampicin prophylaxis for household contacts if there is a vulnerable member (child under 10 or immunosuppressed), and clearance for the index case.']
    },
    R_gbs: {
      title: 'Group B streptococcal meningitis', tone: 'amber',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '14 days if recovered')] }],
      notes: ['Take infection specialist advice at the start (NICE). Stop dexamethasone.', 'Look for endocarditis and, in adults, underlying diabetes, malignancy or recent pregnancy.']
    },
    R_coli: {
      title: 'Enterobacterales (coliform) meningitis', tone: 'red',
      regimens: [{ items: [I('Ceftriaxone', D.cro, '21 days if recovered')] }, { name: 'While susceptibilities are awaited, or ESBL risk', items: [I('Meropenem', 'Meropenem 2 g IV every 8 hours (specialist advice)')] }],
      notes: ['Review once susceptibilities are known. Stop dexamethasone.', 'Usually follows neurosurgery, head injury or bacteraemia; in adults without these, consider Strongyloides hyperinfection.']
    },
    R_hsv: {
      title: 'HSV or VZV encephalitis', tone: 'red',
      regimens: [{ items: [I('Aciclovir', D.acv, 'At least 14 days IV (21 days if immunocompromised or PCR still positive)')] }],
      notes: ['No oral step-down for HSV encephalitis in immunocompetent adults.', 'Strongly consider a repeat LP at 14–21 days, especially if recovery is limited or immunocompromised; if PCR is still positive, give a further 7 days and discuss with neurological infection specialists.', 'Monitor renal function and hydrate (aciclovir crystal nephropathy); reduce the dose in renal impairment.', 'Relapse within 2 weeks of stopping: restart aciclovir and consider autoimmune (anti-NMDAR) encephalitis after HSV.', 'HSV-2 meningitis without encephalitis in an immunocompetent adult: aciclovir is not routinely needed.', 'VZV: same dose and duration; corticosteroids have more support if there is vasculitis.']
    },
    R_ent: {
      title: 'Enteroviral (viral) meningitis', tone: 'green',
      regimens: [],
      notes: ['Stop antibiotics and aciclovir once bacterial and HSV infection are excluded and the patient is improving.', 'Supportive care; most recover fully within 1–2 weeks.']
    },
    R_crypto: {
      title: 'Cryptococcal meningitis', tone: 'red',
      summary: 'See the cryptococcal disease guide for induction, pressure management and ART timing.',
      regimens: [{ items: [I('Liposomal amphotericin B plus flucytosine', 'See the cryptococcal guide')] }],
      notes: ['Measure the opening pressure and do therapeutic LPs if raised.', N.hiv]
    },
    R_tb: {
      title: 'Possible tuberculous meningitis', tone: 'red',
      summary: 'Start treatment empirically if suspected: delay worsens outcome. Discuss with infectious diseases.',
      regimens: [{ name: 'Standard (BIA guideline)', noOr: true, items: [I('Rifampicin, isoniazid, pyrazinamide and ethambutol', 'Weight-based doses', '2 months, then rifampicin and isoniazid for 10 months'), I('plus Dexamethasone', 'Weight-based tapering course', '6–8 weeks')] }],
      notes: ['Send large-volume CSF (at least 6 ml) for AFB smear, culture and TB PCR.', 'MRI with contrast. Test for HIV. Notify TB.']
    }
  };

  window.GUIDES.cns = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From NICE NG240 (2024), the UK joint specialist societies meningitis guideline (2016) and the UK encephalitis guideline (2026). Adult doses; adjust for renal function and follow local policy.'
  };
})();
