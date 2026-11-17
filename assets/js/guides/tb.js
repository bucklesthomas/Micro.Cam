/*
 * Tuberculosis in adults: latent TB testing and treatment, active TB treatment with weight-banded doses,
 * drug-induced liver injury, and infection control.
 * NICE NG33 Tuberculosis (last updated February 2024); BNF adult doses; ATS/CDC/IDSA 2016 treatment guideline and
 * ATS 2006 statement on hepatotoxicity of TB therapy (stop criteria and reintroduction); BTS 1998 (sequential reintroduction).
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var N = {
    tbs: 'Refer every case to the local TB service (TB nurse) for enhanced case management, contact tracing and adherence support.',
    notify: 'Notify on clinical suspicion (Health Protection (Notification) Regulations 2010).',
    base: 'Before starting: LFTs, U&E, FBC, HIV, hepatitis B and C; visual acuity and colour vision (ethambutol); pregnancy test where relevant.',
    rif: 'Rifampicin is a strong enzyme inducer: check every interaction (contraceptives, warfarin, DOACs, antiretrovirals, azoles, steroids, immunosuppressants, methadone). It turns urine, tears and contact lenses orange.',
    hiv: 'HIV: manage with the HIV team (antiretroviral interactions, timing of ART): see the HIV opportunistic infections guide.',
    ltbiAge: 'NICE NG33: offer LTBI treatment up to age 65. Aged 35–65: only if hepatotoxicity is not a concern.',
    ltbiTests: 'Before LTBI treatment: exclude active TB (symptoms, chest X-ray), and offer HIV, hepatitis B and C tests and baseline LFTs.'
  };
  var DOSE = {
    lo: { r: '450 mg', z: '1.5 g', rifater: '3 tablets (under 40 kg) or 4 tablets (40–49 kg)', rifinah: 'Rifinah 150/100: 3 tablets' },
    hi: { r: '600 mg', z: '2 g', rifater: '5 tablets (50–64 kg) or 6 tablets (65 kg or over)', rifinah: 'Rifinah 300/150: 2 tablets' }
  };

  var Q = {
    start: {
      q: 'What do you need?',
      options: [
        { label: 'Latent TB: testing or treatment', next: 'ltbi' },
        { label: 'Active TB: starting treatment', next: 'site' },
        { label: 'Abnormal liver tests on TB treatment', next: 'R_dili' },
        { label: 'Isolation and public health', next: 'R_ipc' }
      ]
    },
    ltbi: {
      q: 'Which situation?',
      options: [
        { label: 'Before a biologic (e.g. anti-TNF), transplant or other immunosuppression', next: 'R_ltbiImm' },
        { label: 'Contact of a case of active TB', next: 'R_ltbiContact' },
        { label: 'New entrant from a high-incidence country, or other screening', next: 'R_ltbiNew' },
        { label: 'Positive test: which treatment?', next: 'R_ltbiTx' }
      ]
    },
    site: {
      q: 'Which site, and any drug resistance?',
      help: 'Ask for a rapid molecular test for rifampicin resistance if there was previous TB treatment, contact with drug-resistant TB, or birth or residence in a country with high MDR-TB rates.',
      options: [
        { label: 'Pulmonary or other non-CNS TB', sub: 'Including lymph node, pleural, bone and spinal TB without CNS involvement', next: 'wt' },
        { label: 'CNS TB', sub: 'Meningitis, tuberculoma, spinal cord involvement', next: 'wt' },
        { label: 'Pericardial TB', next: 'wt' },
        { label: 'Rifampicin resistance detected, or MDR-TB likely', next: 'R_mdr' }
      ]
    },
    wt: {
      q: 'Body weight?',
      options: [
        { label: 'Under 50 kg', next: 'R_act' },
        { label: '50 kg or over', next: 'R_act' }
      ]
    }
  };

  function act(a) {
    var s = a.site ? a.site.i : 0, d = (a.wt && a.wt.i === 1) ? DOSE.hi : DOSE.lo;
    var cont = s === 1 ? '10 months' : '4 months';
    var regs = [
      { name: 'Initial phase: 2 months, once daily', noOr: true, items: [I('Rifampicin', d.r), I('Isoniazid', '300 mg'), I('Pyrazinamide', d.z), I('Ethambutol', '15 mg/kg, rounded to the nearest 100 mg'), I('Pyridoxine', '10 mg (with isoniazid)')] },
      { name: 'Continuation phase: ' + cont + ', once daily', noOr: true, items: [I('Rifampicin', d.r), I('Isoniazid', '300 mg, with pyridoxine 10 mg')] },
      { name: 'Combination tablets (BNF; take before breakfast)', noOr: true, items: [I('Initial phase', 'Rifater ' + d.rifater + ', plus ethambutol'), I('Continuation phase', d.rifinah)] }
    ];
    var notes = [];
    if (s === 1) {
      regs.push({ name: 'Plus corticosteroid (NICE NG33)', noOr: true, items: [I('Dexamethasone or prednisolone', 'High dose at the start, tapered over 4–8 weeks (NICE NG33 table 12 gives an example regimen)')] });
      notes.push('CNS TB: 12 months in total. MRI brain and spine; involve neurology or neurosurgery for hydrocephalus or cord compression.', 'With HIV, delay ART in TB meningitis: discuss with the HIV team.');
    }
    if (s === 2) {
      regs.push({ name: 'Plus corticosteroid (NICE NG33)', noOr: true, items: [I('Prednisolone', '60 mg once daily at the start, withdrawn gradually 2–3 weeks after starting treatment')] });
      notes.push('Pericardial TB: 6 months in total.');
    }
    if (s === 0) notes.push('6 months in total. Spinal TB without CNS involvement: do not extend beyond 6 months for residual changes.', 'Ethambutol can be stopped once the isolate is known to be susceptible to isoniazid and rifampicin (ATS/CDC/IDSA 2016).');
    return {
      title: (s === 1 ? 'CNS TB' : s === 2 ? 'Pericardial TB' : 'Drug-susceptible TB (non-CNS)') + ': standard treatment, ' + (a.wt && a.wt.i === 1 ? '50 kg or over' : 'under 50 kg'),
      tone: 'amber',
      summary: 'Start once samples are sent (3 sputum samples, or tissue or fluid for culture and molecular testing), and adjust to susceptibility results.',
      regimens: regs,
      notes: notes.concat([N.base, 'Ethambutol: reduce in renal impairment and warn about visual symptoms (stop and seek help). Isoniazid: peripheral neuropathy (pyridoxine). Pyrazinamide: hepatotoxicity, gout.', N.rif, 'Directly observed treatment for people with adherence risks; daily dosing is preferred (NICE).', N.hiv, N.tbs, N.notify])
    };
  }

  var R = {
    R_act: act,
    R_mdr: {
      title: 'Rifampicin-resistant or MDR-TB', tone: 'red',
      summary: 'Specialist management only: discuss with the regional TB service and the British Thoracic Society MDR-TB Clinical Advice Service.',
      regimens: [{ name: 'Principles (NICE NG33)', noOr: true, items: [I('Regimen', 'At least 6 drugs likely to be active, guided by full susceptibility testing (molecular and phenotypic)'), I('Adherence', 'Directly observed treatment throughout')] }],
      notes: ['Isolate in a negative pressure room; FFP3 for staff and visitors.', 'Send isolates for whole-genome sequencing and extended susceptibility testing (national mycobacterium reference service).', 'Do not add a single drug to a failing regimen.', N.notify]
    },
    R_ltbiImm: {
      title: 'Latent TB screening before immunosuppression', tone: 'amber',
      summary: 'Test before starting: an IGRA, plus a Mantoux in the severely immunocompromised (NICE NG33).',
      regimens: [{ name: 'Testing', noOr: true, items: [I('Other immunocompromise (including anti-TNF and other biologics)', 'IGRA alone, or IGRA plus Mantoux'), I('Severe immunocompromise (e.g. HIV with CD4 < 200, after transplant)', 'IGRA plus a concurrent Mantoux test')] }],
      notes: ['Also take a TB exposure and travel history, and a chest X-ray if there are risk factors or symptoms.', 'Positive test: exclude active TB, then treat latent TB (choose "Positive test: which treatment?").', 'Timing of the biologic: many specialty guidelines allow it to start after at least 1 month of latent TB treatment; follow the relevant specialty guidance.', 'An IGRA can be falsely negative or indeterminate on high-dose steroids or with lymphopenia: interpret with the history.', 'Screen for hepatitis B, hepatitis C and HIV at the same time.']
    },
    R_ltbiContact: {
      title: 'Contact of active TB', tone: 'amber',
      summary: 'The TB service runs contact tracing: household and other close contacts of pulmonary or laryngeal TB are screened.',
      regimens: [{ name: 'Testing (NICE NG33)', noOr: true, items: [I('Adults 18–65', 'Mantoux; if positive, assess for active TB, and offer treatment if an IGRA is also positive'), I('Children 2–17', 'Mantoux; if negative, IGRA and a repeat Mantoux after 6 weeks'), I('Under 2', 'Specialist assessment; contact of smear-positive TB: start isoniazid while being assessed')] }],
      notes: ['Many UK services now use an IGRA as the first test for adults: follow the local TB service.', 'Contacts of MDR-TB: specialist advice (standard LTBI treatment will not work).', 'Symptomatic contacts (cough, fever, weight loss, night sweats): investigate for active TB, not latent TB.', N.ltbiAge]
    },
    R_ltbiNew: {
      title: 'Latent TB screening of new entrants and other groups', tone: 'green',
      regimens: [{ name: 'Testing (NICE NG33)', noOr: true, items: [I('New entrants from high-incidence countries', 'Mantoux first (IGRA if Mantoux unavailable); the national programme uses an IGRA for people aged 16–35'), I('Under-served groups under 65', 'Single IGRA')] }],
      notes: ['Positive test: exclude active TB, then offer treatment (choose "Positive test: which treatment?").', N.ltbiAge]
    },
    R_ltbiTx: {
      title: 'Treatment of latent TB', tone: 'green',
      summary: 'Two NICE regimens. Choose by age, liver risk and interactions.',
      regimens: [
        { name: '3 months (preferred under 35 if no hepatotoxicity concern)', noOr: true, items: [I('Isoniazid', '300 mg once daily'), I('plus Rifampicin', '450 mg (under 50 kg) or 600 mg (50 kg or over) once daily'), I('plus Pyridoxine', '10 mg once daily')] },
        { name: '6 months (if rifamycin interactions matter, e.g. HIV or transplant)', noOr: true, items: [I('Isoniazid', '300 mg once daily'), I('plus Pyridoxine', '10 mg once daily')] }
      ],
      notes: [N.ltbiTests, N.ltbiAge, 'Combination tablet for the 3-month regimen: Rifinah (150/100 under 50 kg, 3 tablets; 300/150 50 kg or over, 2 tablets).', 'Severe liver disease (Child–Pugh B or C): specialist TB team.', N.rif, 'Warn about hepatitis symptoms: stop and seek help for nausea, vomiting, abdominal pain or jaundice.']
    },
    R_dili: {
      title: 'Abnormal liver tests on TB treatment', tone: 'red',
      summary: 'Stop rifampicin, isoniazid and pyrazinamide if ALT is over 5× the upper limit of normal, over 3× with symptoms, or bilirubin is raised (ATS).',
      regimens: [
        { name: 'If not stopping', noOr: true, items: [I('ALT under 5× ULN, no symptoms, normal bilirubin', 'Continue and repeat LFTs within 1–2 weeks (a mild rise is common and often settles)')] },
        { name: 'While the drugs are stopped', noOr: true, items: [I('Infectious, severe or CNS disease', 'Interim liver-sparing regimen, e.g. ethambutol plus levofloxacin, with amikacin or linezolid: specialist decision')] },
        { name: 'Reintroduction (once ALT is below 2× ULN)', noOr: true, items: [I('One drug at a time, checking LFTs before each', 'ATS: rifampicin (with ethambutol) first, then isoniazid 3–7 days later; BTS: isoniazid first, then rifampicin, then pyrazinamide'), I('If pyrazinamide caused it, or the injury was severe', 'Leave pyrazinamide out and extend treatment to 9 months')] }
      ],
      notes: ['Check for other causes: viral hepatitis (A, B, C, E), alcohol, other drugs, biliary obstruction.', 'A rise in bilirubin or ALP alone is more typical of rifampicin (cholestasis).', 'Always discuss with the TB service before changing treatment.']
    },
    R_ipc: {
      title: 'Isolation and public health for TB', tone: 'amber',
      regimens: [{ name: 'Inpatients (NICE NG33)', noOr: true, items: [I('Suspected or confirmed pulmonary or laryngeal TB', 'Single room until 2 weeks of effective treatment with clinical improvement (negative pressure if MDR is possible)'), I('Possible MDR-TB', 'Negative pressure room; FFP3 for staff and visitors'), I('Extrapulmonary TB only', 'No isolation, once pulmonary TB is excluded; care with aerosol-generating procedures on lesions')] }],
      notes: ['Avoid placing infectious patients near immunocompromised patients (HIV, transplant, haematology).', 'Discharge home during the first 2 weeks is possible if there are no vulnerable household members and the TB service agrees; avoid congregate settings.', 'Schools and workplaces: back after 2 weeks of treatment for pulmonary TB (UKHSA).', N.notify, N.tbs, 'See the isolation and precautions page.']
    }
  };

  window.GUIDES.tb = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From NICE NG33 (updated 2024), BNF adult doses, and ATS/BTS guidance on drug-induced liver injury. Adults only: children need specialist dosing. Manage with your local TB service.'
  };
})();
