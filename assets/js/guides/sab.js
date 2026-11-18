/*
 * Staphylococcus aureus bacteraemia (SAB) in adults.
 * Risk stratification, follow-up blood cultures, echocardiography, whole-body imaging and duration:
 *   IDSA/ESCMID 2026 consensus statements, "Staphylococcus aureus bacteremia: risk stratification, diagnostic evaluation, and management of adults and children".
 * Agent: SNAP trial (cefazolin vs flucloxacillin/cloxacillin, NEJM 2026). Oral switch: SABATO (Kaasch AJ et al. Lancet Infect Dis 2024).
 * Adjuncts: ARREST (rifampicin, Lancet 2018); CAMERA2 (β-lactam plus vancomycin or daptomycin for MRSA, JAMA 2020).
 * Vancomycin dosing: 2020 ASHP/IDSA/PIDS/SIDP consensus (AUC 400–600 mg·h/L). Partial oral treatment of focal infection: POET (endocarditis), OVIVA (bone and joint).
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var D = {
    cfz: 'Cefazolin 2 g IV every 8 hours',
    fluc: 'Flucloxacillin 2 g IV every 6 hours (every 4 hours for endocarditis if over 85 kg)',
    vanc: 'Vancomycin IV: loading dose 25–30 mg/kg (max 3 g), then dose by levels to an AUC of 400–600 mg·h/L (or trough 15–20 mg/L)',
    dapt: 'Daptomycin 8–10 mg/kg IV once daily (not for pneumonia)',
    teic: 'Teicoplanin 12 mg/kg IV every 12 hours for 3–5 doses, then 12 mg/kg daily, to a trough above 20 mg/L (used in some UK centres; less trial evidence)'
  };
  var N = {
    fubc: 'Follow-up blood cultures: at least 2 sets at 48 hours after the first positive set, then 1–2 sets every 24–48 hours until negative (IDSA/ESCMID 2026).',
    echo: 'TTE for every adult. TOE after a negative TTE if any of: intracardiac device, predisposing valve disease or previous endocarditis, positive culture 48 hours or more after the first, embolic events, or more than one separate focus. Consider TOE for community onset or injecting drug use.',
    source: 'Remove intravascular lines and drain collections. Examine daily for a focus: spine and back pain, joints, skin, chest, new murmur, embolic signs.',
    idc: 'Infection specialist review for every patient: bedside consultation reduces mortality.',
    day1: 'Count the duration from the first negative blood culture, or from the date of source removal if later (IDSA/ESCMID 2026).',
    adj: 'Do not add rifampicin routinely (ARREST: no benefit, more adverse events and interactions). Do not routinely combine a β-lactam with vancomycin or daptomycin for MRSA (CAMERA2: more kidney injury, no benefit).',
    risk: 'Increased-risk features (IDSA/ESCMID 2026): community onset, positive blood culture 48 hours or more after the first, intracardiac device, predisposing valve disease, injecting drug use, endovascular graft, SAB in the previous 90 days, embolic events, more than one separate focus, or no focus found.',
    pet: 'Increased risk with no focus found: whole-body imaging, such as FDG-PET/CT, or CT chest, abdomen and pelvis with targeted imaging of likely sites.'
  };

  var Q = {
    start: {
      q: 'Where are you in the episode?',
      options: [
        { label: 'New S. aureus bacteraemia', sub: 'Choose treatment and start the workup', next: 'sus' },
        { label: 'Workup done: deciding duration and oral switch', next: 'focus' },
        { label: 'Still bacteraemic', sub: 'Blood cultures positive 48 hours or more after the first, or not clearing', next: 'R_persist' }
      ]
    },
    sus: {
      q: 'Susceptibility?',
      help: 'Rapid mecA or PBP2a testing is often available the same day: ask the laboratory.',
      options: [
        { label: 'MSSA', next: 'allergy' },
        { label: 'MRSA', next: 'R_init' },
        { label: 'Not known yet', next: 'R_init' }
      ]
    },
    allergy: {
      q: 'Penicillin allergy?',
      options: [
        { label: 'No', next: 'R_init' },
        { label: 'Yes, not severe', sub: 'Rash or urticaria, no anaphylaxis or severe skin reaction', next: 'R_init' },
        { label: 'Anaphylaxis or severe delayed reaction', sub: 'SJS/TEN, DRESS, organ involvement', next: 'R_init' }
      ]
    },
    focus: {
      q: 'After echocardiography and imaging, is there a deep-seated or metastatic focus?',
      options: [
        { label: 'No focus beyond a removed line or a superficial source', next: 'riskf' },
        { label: 'Endocarditis or cardiac device infection', next: 'R_ie' },
        { label: 'Vertebral osteomyelitis, epidural abscess, septic arthritis or other bone infection', next: 'R_bone' },
        { label: 'Prosthetic joint or other retained implant', next: 'R_pji' },
        { label: 'Deep abscess, septic thrombophlebitis or septic emboli', next: 'R_deep' }
      ]
    },
    riskf: {
      q: 'Any increased-risk features?',
      help: 'Community onset; positive culture 48 hours or more after the first; intracardiac device; predisposing valve disease; injecting drug use; endovascular graft; SAB in the last 90 days; embolic events; more than one separate focus; no focus found.',
      options: [
        { label: 'None', sub: 'Low risk: usually a line or other removed or superficial source', next: 'R_low' },
        { label: 'One or more', sub: 'Increased risk, no deep focus found', next: 'R_inc' }
      ]
    }
  };

  function init(a) {
    var s = a.sus ? a.sus.i : 2, al = a.allergy ? a.allergy.i : 0;
    var regs, title, summary = null, notes = [];
    if (s === 0 && al === 0) {
      title = 'MSSA bacteraemia: first-line treatment';
      regs = [{ name: 'Either', noOr: true, items: [I('Cefazolin', D.cfz), I('or Flucloxacillin', D.fluc)] }];
      notes.push('SNAP (NEJM 2026): cefazolin was non-inferior to flucloxacillin for 90-day mortality, with less acute kidney injury. Endocarditis data were limited.', 'Use flucloxacillin if there is CNS infection: cefazolin penetrates the CNS poorly.');
    } else if (s === 0 && al === 1) {
      title = 'MSSA bacteraemia with a non-severe penicillin allergy';
      summary = 'Cefazolin is usually safe: its side chain is not shared with any penicillin.';
      regs = [{ items: [I('Cefazolin', D.cfz + '; first dose where a reaction can be treated')] }];
      notes.push('Assess and, where possible, de-label the allergy: see the penicillin allergy guide.', 'Use flucloxacillin, after allergy assessment, if there is CNS infection.');
    } else if (s === 0) {
      title = 'MSSA bacteraemia with a severe penicillin allergy';
      summary = 'Glycopeptides and daptomycin do less well than β-lactams for MSSA: involve the allergy service early.';
      regs = [{ items: [I('Vancomycin', D.vanc), I('or Daptomycin', D.dapt)] }];
      notes.push('After anaphylaxis, cefazolin is often still possible with specialist advice. After SJS/TEN or DRESS, avoid all β-lactams.', 'See the penicillin allergy guide.');
    } else if (s === 1) {
      title = 'MRSA bacteraemia';
      regs = [{ items: [I('Vancomycin', D.vanc), I('or Daptomycin', D.dapt)] }, { name: 'Alternative', items: [I('Teicoplanin', D.teic)] }];
      notes.push('Check the vancomycin MIC. Consider daptomycin if the vancomycin MIC is 2 mg/L, there is kidney injury, or the bacteraemia persists.', 'MRSA screen and contact precautions; decolonise once treated.');
    } else {
      title = 'S. aureus bacteraemia, susceptibility pending';
      summary = 'Start vancomycin and switch to cefazolin or flucloxacillin as soon as MSSA is confirmed: vancomycin is inferior for MSSA.';
      regs = [{ items: [I('Vancomycin', D.vanc)] }];
      notes.push('Low MRSA risk and very unwell: some centres add cefazolin or flucloxacillin until the result is back (follow local policy).');
    }
    return { title: title, tone: 'red', summary: summary || 'Never a contaminant. Treat, find the source, and follow the SAB bundle.', regimens: regs,
      notes: notes.concat([N.fubc, N.echo, N.source, N.idc, N.adj, 'Then come back to this guide when the workup is done, to decide duration and oral switch.']) };
  }

  var R = {
    R_init: init,
    R_low: {
      title: 'Low-risk SAB, no deep focus', tone: 'amber',
      summary: '14 days of treatment (IDSA/ESCMID 2026). Shorter courses only on infection specialist advice.',
      regimens: [
        { name: 'Duration', noOr: true, items: [I('14 days', 'From the first negative blood culture, or from line removal if later')] },
        { name: 'Early oral switch (SABATO)', noOr: true, items: [I('After 5–7 days of IV treatment', 'By susceptibility, with specialist input: for example co-trimoxazole, linezolid or clindamycin (check the D-test)')] }
      ],
      notes: ['SABATO (Lancet Infect Dis 2024) criteria: IV treatment started within 72 hours, follow-up cultures negative, afebrile, no septic shock in the previous 4 days, line removed within 4 days, and none of: endocarditis, deep-seated or implant infection, pneumonia, injecting drug use, prosthetic valve, vascular graft or severe immunosuppression. Early switch was non-inferior, with fewer adverse events. Few MRSA patients were included.', 'Choose an oral agent with good bioavailability; linezolid beyond 2 weeks needs blood count monitoring.', 'Confirm low risk before shortening anything: TTE done, follow-up cultures negative, no new symptoms.', N.idc]
    },
    R_inc: {
      title: 'Increased-risk SAB, no deep focus found', tone: 'amber',
      summary: '14 days once a deep focus has been looked for and not found (IDSA/ESCMID 2026). A focus found later sets the duration.',
      regimens: [{ name: 'Duration', noOr: true, items: [I('14 days', 'From the first negative blood culture; consider longer if a device or endovascular infection cannot be excluded (e.g. retained intracardiac device, recent graft)')] }],
      notes: ['Make sure the workup is complete: TOE if indicated, and whole-body imaging if no focus has been found.', N.pet, 'IV treatment for the whole course is the usual approach here: these patients were excluded from SABATO. Discuss any oral switch with an infection specialist.', N.risk, N.day1]
    },
    R_ie: {
      title: 'S. aureus endocarditis or cardiac device infection', tone: 'red',
      summary: 'Treat as endocarditis: see the endocarditis guide for regimens and durations.',
      regimens: [{ name: 'Usual durations (ESC 2023)', noOr: true, items: [I('Native valve', '4–6 weeks'), I('Prosthetic valve', 'At least 6 weeks, with rifampicin once cultures are negative (and gentamicin for the first 2 weeks)'), I('Cardiac device', 'Remove the whole device; then 4–6 weeks if the leads or valves are involved')] }],
      notes: ['Early referral to the endocarditis team and cardiac surgery.', 'Partial oral treatment (POET) can be considered for stable left-sided endocarditis after at least 10 days of IV treatment, with specialist input.', 'POET II (NEJM 2026): response-tailored shorter courses (minimum 2–4 weeks) were non-inferior for death, surgery or embolism in stable left-sided IE, with more relapses; not yet in guidelines.', N.day1]
    },
    R_bone: {
      title: 'SAB with bone, joint or spinal infection', tone: 'amber',
      summary: 'Usually 6 weeks in total, guided by source control.',
      regimens: [{ name: 'Duration', noOr: true, items: [I('Vertebral osteomyelitis or discitis', '6 weeks (longer if an undrained abscess)'), I('Native septic arthritis', 'Usually 4–6 weeks with joint washout'), I('Epidural abscess', 'Urgent MRI and neurosurgical review; often 6–8 weeks')] }],
      notes: ['Oral switch after the bacteraemia has cleared and the patient is improving is supported for bone and joint infection (OVIVA), with good-bioavailability agents chosen by susceptibility.', 'Rifampicin is not routinely added for native bone infection.', N.day1, N.idc]
    },
    R_pji: {
      title: 'SAB with a prosthetic joint or other retained implant', tone: 'red',
      summary: 'Specialist surgical and infection management: DAIR, one- or two-stage revision, or removal.',
      regimens: [{ name: 'Typical approach', noOr: true, items: [I('IV β-lactam (or glycopeptide/daptomycin for MRSA)', 'Until bacteraemia cleared and improving'), I('Then rifampicin-based combination', 'Rifampicin plus a second agent once cultures are negative and the wound is dry'), I('Duration', 'Usually 12 weeks after DAIR or a one-stage revision (DATIPO)')] }],
      notes: ['Rifampicin has a specific role with retained staphylococcal implants: never give it alone, and check interactions.', 'Look for endocarditis and other foci: haematogenous implant infection is often part of a wider picture.', N.day1]
    },
    R_deep: {
      title: 'SAB with a deep abscess, septic thrombophlebitis or septic emboli', tone: 'red',
      summary: 'Drain what can be drained; the focus decides the duration (usually at least 4 weeks).',
      regimens: [{ name: 'Duration', noOr: true, items: [I('Usually 4–6 weeks', 'From the first negative culture or from drainage, guided by repeat imaging and clinical response')] }],
      notes: ['Septic pulmonary emboli: look for right-sided endocarditis, injecting drug use or a septic thrombophlebitis (Lemierre-like) source.', 'Septic thrombophlebitis: remove the line; anticoagulation case by case.', N.day1, N.idc]
    },
    R_persist: {
      title: 'Persistent S. aureus bacteraemia', tone: 'red',
      summary: 'Positive blood cultures 48 hours or more after the first mean increased risk: find and control the source.',
      regimens: [
        { name: 'MSSA', noOr: true, items: [I('Check the β-lactam dose', 'Cefazolin 2 g every 8 hours or flucloxacillin 2 g every 4–6 hours; continue; do not switch to vancomycin')] },
        { name: 'MRSA', noOr: true, items: [I('Consider switching to daptomycin', '10 mg/kg IV once daily; combination salvage (e.g. with fosfomycin or a β-lactam) only with specialist advice')] }
      ],
      notes: ['TOE now if not done. Whole-body imaging (e.g. FDG-PET/CT) if no focus found.', 'Remove every line and device that can be removed; repeat imaging of any known collection.', 'Check vancomycin levels and the MIC.', 'Repeat blood cultures every 24–48 hours until negative; the duration counts from the first negative.', 'Expect at least 4–6 weeks of treatment.', N.idc]
    }
  };

  window.GUIDES.sab = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From the IDSA/ESCMID 2026 consensus on S. aureus bacteraemia, the SNAP, SABATO, ARREST and CAMERA2 trials, and ESC 2023 for endocarditis. Adult doses; adjust for renal function. Discuss every case with an infection specialist.'
  };
})();
