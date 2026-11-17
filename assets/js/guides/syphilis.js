/*
 * Syphilis serology interpretation, treatment and follow-up in adults.
 * BASHH UK guidelines for the management of syphilis 2024 (Kingston M et al. Int J STD AIDS 2024);
 * BASHH syphilis in pregnancy 2024. UK testing: treponemal EIA/CLIA screen, confirmation with a second treponemal assay
 * (TPPA/TPHA/line immunoassay) on a second sample, and quantitative RPR.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var TX = {
    early: { name: 'Early syphilis (primary, secondary, early latent: infection under 2 years)', items: [I('Benzathine benzylpenicillin', '2.4 MU IM, single dose'), I('or Doxycycline', '100 mg orally twice daily', '14 days'), I('or Procaine benzylpenicillin', '600,000 units IM once daily', '10 days')] },
    late: { name: 'Late latent (over 2 years or unknown duration), cardiovascular or gummatous', items: [I('Benzathine benzylpenicillin', '2.4 MU IM weekly', '3 doses'), I('or Doxycycline', '100 mg orally twice daily', '28 days')] },
    neuro: { name: 'Neurosyphilis, or neurological, ocular or otological involvement', items: [I('Benzylpenicillin', '1.8–2.4 g IV every 4 hours', '14 days'), I('or Procaine benzylpenicillin plus probenecid', '1.8–2.4 MU IM once daily plus probenecid 500 mg orally 4 times daily', '14 days'), I('Plus prednisolone', '40–60 mg once daily for 3 days, starting 24 hours before the antibiotics')] }
  };
  var N = {
    gum: 'Refer to sexual health for staging, treatment, partner notification and a full STI and HIV screen.',
    stage: 'Stage by history and examination: chancre (primary); rash, mucosal lesions, lymphadenopathy, alopecia (secondary); no signs (latent: early if infection within 2 years, otherwise late or unknown).',
    neuro: 'Neurological, eye or ear symptoms at any stage: urgent assessment (ophthalmology or ENT the same day) and treat as neurosyphilis. LP if there are neurological signs; it is rarely useful for isolated ocular or otological syphilis (BASHH).',
    jh: 'Warn about the Jarisch–Herxheimer reaction (fever, myalgia within 24 hours of the first dose): common in early syphilis, managed with paracetamol.',
    rpr: 'Take an RPR on the day of treatment as the baseline for follow-up.',
    fu: 'Follow-up RPR at 3, 6 and 12 months (6-monthly with HIV), until negative or stable.',
    preg: 'Pregnancy: urgent referral to sexual health and obstetrics; penicillin is preferred because it reliably treats the fetus (BASHH syphilis in pregnancy 2024).',
    trep: 'Treponemal tests stay positive for life after infection, whether treated or not: use the RPR to judge activity.',
    allergy: 'Penicillin allergy: doxycycline or ceftriaxone, or desensitisation for neurosyphilis and pregnancy. Macrolides are not recommended.',
    pn: 'Partner notification look-back: 3 months for primary syphilis; 2 years for secondary and early latent.'
  };

  var Q = {
    start: {
      q: 'Treponemal screening test (EIA or CLIA)?',
      options: [
        { label: 'Negative', next: 'risk' },
        { label: 'Positive or equivocal', next: 'conf' }
      ]
    },
    risk: {
      q: 'Possible exposure in the last 3 months, or a possible chancre?',
      options: [
        { label: 'No', next: 'R_neg' },
        { label: 'Yes', next: 'R_window' }
      ]
    },
    conf: {
      q: 'Confirmatory treponemal test?',
      help: 'A different treponemal assay (e.g. TPPA, TPHA or a line immunoassay), ideally on a second sample.',
      options: [
        { label: 'Positive', next: 'rpr' },
        { label: 'Negative or discordant', next: 'R_disc' },
        { label: 'Not done yet', next: 'R_pending' }
      ]
    },
    rpr: {
      q: 'RPR?',
      options: [
        { label: 'Negative', next: 'hx' },
        { label: 'Positive, titre 1:16 or below', next: 'hx' },
        { label: 'Positive, titre above 1:16', next: 'hx' }
      ]
    },
    hx: {
      q: 'Previously treated for syphilis?',
      help: 'Check sexual health records and old results: a documented RPR at the time of treatment is the key comparison.',
      options: [
        { label: 'No, or not known', next: 'R_untx' },
        { label: 'Yes, with a previous RPR to compare', next: 'trend' },
        { label: 'Yes, but no previous RPR available', next: 'R_txNoBase' }
      ]
    },
    trend: {
      q: 'How does the RPR compare with the previous result (or the titre at treatment)?',
      help: 'A fourfold change is 2 dilutions, e.g. 1:8 to 1:32, or 1:64 to 1:16.',
      options: [
        { label: 'Fourfold or greater rise', next: 'R_reinf' },
        { label: 'Fourfold or greater fall, or now negative', next: 'R_resp' },
        { label: 'Stable, or less than a fourfold fall', next: 'R_stable' }
      ]
    }
  };

  function untx(a) {
    var r = a.rpr ? a.rpr.i : 0;
    if (r === 0) return {
      title: 'Treponemal positive, RPR negative, no known treatment', tone: 'amber',
      summary: 'Usually past infection (treated or untreated). Early infection is also possible.',
      regimens: [{ name: 'If no documented adequate treatment and early infection is unlikely', noOr: true, items: [TX.late.items[0], TX.late.items[1]] }],
      notes: ['Possible explanations: previously treated infection not on record (e.g. treated abroad, or antibiotics for something else); late latent syphilis; very early primary syphilis before the RPR turns positive; a false-negative RPR from the prozone effect in secondary syphilis (ask the laboratory to dilute); or yaws or pinta in people from endemic areas.', 'Possible recent exposure or a chancre: repeat serology in 2 weeks, and send a lesion swab for T. pallidum PCR.', N.gum, N.stage, N.neuro, N.preg]
    };
    return {
      title: 'Active syphilis likely: treponemal positive, RPR ' + (r === 2 ? 'above 1:16' : '1:16 or below') + ', not treated', tone: 'red',
      summary: r === 2 ? 'An RPR above 1:16 usually means active disease that needs treatment.' : 'A low RPR does not exclude active infection: treat unless adequate previous treatment is documented.',
      regimens: [TX.early, TX.late, TX.neuro],
      notes: [N.stage, N.neuro, N.rpr, N.jh, N.allergy, N.gum, N.pn, N.preg, N.fu]
    };
  }

  var R = {
    R_untx: untx,
    R_neg: {
      title: 'No serological evidence of syphilis', tone: 'green',
      regimens: [],
      notes: ['No exposure in the last 3 months and no lesions: syphilis is excluded.', 'Regular testing is recommended for people at ongoing risk (e.g. every 3 months for gay, bisexual and other men who have sex with men at higher risk).']
    },
    R_window: {
      title: 'Negative screen, but possibly in the window period', tone: 'amber',
      summary: 'Treponemal tests can be negative before a chancre appears and for up to 2 weeks after.',
      regimens: [{ name: 'Contact of early syphilis: offer epidemiological treatment', items: [I('Benzathine benzylpenicillin', '2.4 MU IM, single dose'), I('or Doxycycline', '100 mg orally twice daily', '14 days')] }],
      notes: ['Possible chancre: swab the lesion for T. pallidum PCR (or dark-ground microscopy) and repeat serology 2 weeks later.', 'Repeat serology 3 months after the last exposure: a negative test within 3 months does not exclude early syphilis.', N.gum]
    },
    R_disc: {
      title: 'Screen positive, confirmatory test negative', tone: 'amber',
      summary: 'Either a false-positive screen or very early infection.',
      regimens: [],
      notes: ['Repeat on a new sample in 2 weeks if early syphilis is possible (exposure in the last 3 months, a lesion).', 'Low-level reactivity with a negative RPR may be cross-reactivity. With no symptoms, history or risk, a single reactive treponemal test is treated as a false positive (BASHH).', 'False positives are more common in older people, autoimmune disease, pregnancy and people who inject drugs.', 'Persistent discordance: the laboratory can send to a reference laboratory for further treponemal testing.']
    },
    R_pending: {
      title: 'Screen positive, awaiting confirmation', tone: 'amber',
      summary: 'Send a second sample for confirmation and a quantitative RPR.',
      regimens: [],
      notes: ['Do not wait to treat if there are signs of primary or secondary syphilis or neurological, eye or ear symptoms: refer the same day.', 'Pregnancy: refer urgently while results are pending.', N.gum]
    },
    R_txNoBase: {
      title: 'Previously treated, no earlier RPR to compare', tone: 'amber',
      summary: 'The treponemal test will stay positive for life; the question is whether the RPR reflects a new infection.',
      regimens: [],
      notes: ['RPR negative: consistent with treated past infection; no treatment if adequate treatment is documented.', 'RPR positive: ask sexual health services and the laboratory for old results, repeat the RPR in a few weeks to see the trend, and look for signs of early syphilis. Treat if there are signs, or if reinfection cannot be excluded and risk is ongoing.', 'A stable low titre after treatment (serofast) is common, especially after late or repeated infection.', N.gum]
    },
    R_reinf: {
      title: 'Fourfold RPR rise: reinfection or treatment failure', tone: 'red',
      summary: 'Retreat according to stage, and look for neurological involvement.',
      regimens: [TX.early, TX.late, TX.neuro],
      notes: ['Reinfection is far more common than treatment failure. Treatment failure needs a fourfold rise or recurrent signs, with reinfection excluded.', N.neuro, N.rpr, N.pn, 'Test for HIV and other STIs.', N.gum]
    },
    R_resp: {
      title: 'Adequate serological response', tone: 'green',
      summary: 'A fourfold fall in RPR after treatment shows response.',
      regimens: [],
      notes: [N.fu, N.trep, 'A later fourfold rise means reinfection or failure: retest after any new exposure.']
    },
    R_stable: {
      title: 'RPR stable, or less than a fourfold fall after treatment', tone: 'amber',
      summary: 'Depends on the time since treatment.',
      regimens: [],
      notes: ['Under 6 months since treatment: too early to judge; keep following up.', 'Early syphilis treated 6–12 months ago with less than a fourfold fall: serological failure. Review for neurological symptoms, check HIV, consider retreatment (and CSF examination if there are neurological features); discuss with sexual health.', 'Stable titre 1–2 years after treatment: serofast. Common, especially after late syphilis, low baseline titres, older age and HIV; no further treatment unless there is a rise or new signs.', N.trep]
    }
  };

  window.GUIDES.syphilis = {
    Q: Q, R: R, eyebrow: 'Interpretation and next steps',
    ref: 'From the BASHH UK guidelines for the management of syphilis 2024 and syphilis in pregnancy 2024. Adults only. Manage with your sexual health service.'
  };
})();
