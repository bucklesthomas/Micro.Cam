/*
 * Cryptococcosis in adults.
 * ECMM/ISHAM/ASM global guideline for cryptococcosis (Chang CC et al. Lancet Infect Dis 2024).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    lamb:   'Liposomal amphotericin B 3–4 mg/kg IV once daily',
    lamb10: 'Liposomal amphotericin B 10 mg/kg IV, single dose',
    abcd:   'Amphotericin B lipid complex 5 mg/kg IV once daily',
    fc:     'Flucytosine 25 mg/kg orally four times a day (adjust to renal function and levels)',
    flu1200:'Fluconazole 1200 mg orally once daily',
    cons:   'Fluconazole 400–800 mg orally once daily',
    maint:  'Fluconazole 200 mg orally once daily'
  };

  var N = {
    icp: 'Measure the opening pressure at every LP. If ≥ 20 cm CSF with symptoms, do daily therapeutic LPs (usually 20–30 ml) to halve the pressure or bring it to ≤ 20 cm CSF. Repeat the LP at 48–72 hours or at day 7 regardless. If pressure stays high despite LPs, consider a lumbar drain, shunt or ventriculostomy.',
    noSteroids: 'Do not use corticosteroids, mannitol or acetazolamide to lower intracranial pressure: they can be harmful.',
    fcTdm: 'Flucytosine: check levels within 72 hours and monitor blood count and renal function (see the antifungal TDM helper).',
    lambSafety: 'Monitor renal function, potassium and magnesium on amphotericin; give pre-hydration and electrolyte replacement.',
    extend: 'Extend induction if CSF cultures are still positive or symptoms persist at 2 weeks.',
    tx: 'Azoles raise tacrolimus, ciclosporin and sirolimus levels: monitor levels and reduce doses.',
    gattii: 'C. gattii CNS infection in a non-HIV patient: consider 4–6 weeks of induction. Cryptococcomas may also need a longer induction.',
    art: 'Do not start ART immediately. Start ART 4–6 weeks after starting antifungal treatment (individualise after optimal induction).',
    hivTest: 'Test for HIV if the status is unknown.'
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }

  var Q = {
    start: {
      q: 'What is the presentation?',
      options: [
        { label: 'Meningitis or CNS infection', next: 'host' },
        { label: 'Cryptococcaemia or disseminated disease', sub: 'Treat as for CNS disease; do an LP', next: 'host' },
        { label: 'Isolated pulmonary disease', next: 'pulm' },
        { label: 'Positive blood CrAg, no symptoms', sub: 'Advanced HIV, CD4 < 200', next: 'R_crag' },
        { label: 'Primary cutaneous disease', sub: 'Direct inoculation, no dissemination', next: 'R_skin' }
      ]
    },
    host: {
      q: 'Underlying condition?',
      options: [
        { label: 'HIV', next: 'R_cns_hiv' },
        { label: 'Solid organ transplant', next: 'R_cns_tx' },
        { label: 'Neither HIV nor transplant', sub: 'Other immunosuppression, or apparently immunocompetent', next: 'R_cns_other' }
      ]
    },
    pulm: {
      q: 'How severe is the pulmonary disease?',
      help: 'Do an LP and blood CrAg in immunocompromised patients to exclude CNS or disseminated disease first.',
      options: [
        { label: 'Severe, or CNS or other dissemination', next: 'host' },
        { label: 'Mild to moderate, isolated', next: 'R_pulm_mild' }
      ]
    }
  };

  function cnsResult(title, extraNotes, isHiv, isTx) {
    var regs = [
      { name: 'Induction: preferred', items: [I('Liposomal amphotericin B', D.lamb, '2 weeks'), I('plus Flucytosine', D.fc, '2 weeks')] },
      { name: 'Induction: if liposomal amphotericin is unavailable', items: [I('Amphotericin B lipid complex', D.abcd, '2 weeks'), I('plus ' + (isHiv ? 'fluconazole' : 'flucytosine'), isHiv ? 'Fluconazole 800–1200 mg orally once daily' : D.fc, '2 weeks')] },
      { name: 'Then consolidation', noOr: true, items: [I('Fluconazole', D.cons, '8 weeks')] },
      { name: 'Then maintenance', noOr: true, items: [I('Fluconazole', D.maint, isHiv ? '12 months, or until immune recovery' : '12 months')] }
    ];
    var notes = [N.icp, N.noSteroids, N.extend, N.fcTdm, N.lambSafety];
    return { title: title, tone: 'red', regimens: regs, notes: extraNotes.concat(notes) };
  }

  var R = {
    R_cns_hiv: cnsResult('HIV-associated cryptococcal meningitis', [
      'In low-resource settings, a single 10 mg/kg dose of liposomal amphotericin B with 14 days of flucytosine and fluconazole 1200 mg daily (AMBITION regimen) is strongly recommended.',
      N.art,
      'Stopping maintenance: consider after 12 months if virally suppressed on ART with CD4 > 100. Restart if CD4 falls below 100.'
    ], true),
    R_cns_tx: cnsResult('Cryptococcal meningitis in a transplant recipient', [N.tx, 'Reduce immunosuppression gradually and watch for immune reconstitution inflammatory syndrome.', N.gattii, N.hivTest], false, true),
    R_cns_other: cnsResult('Cryptococcal meningitis without HIV or transplant', [N.gattii, N.hivTest, 'Look for an underlying cause (e.g. corticosteroids, biologics, haematological malignancy, anti-GM-CSF antibodies).'], false),
    R_pulm_mild: {
      title: 'Mild to moderate isolated pulmonary cryptococcosis',
      regimens: [{ items: [I('Fluconazole', 'Fluconazole 400 mg orally once daily', '6–12 months, guided by symptoms')] }],
      notes: ['First exclude CNS and disseminated disease with an LP and blood CrAg, especially if immunocompromised.', 'Severe pulmonary disease is treated as for CNS disease.', N.hivTest]
    },
    R_crag: {
      title: 'Asymptomatic cryptococcal antigenaemia in advanced HIV',
      tone: 'amber',
      summary: 'Do a lumbar puncture first: if there is CNS infection, treat as meningitis.',
      regimens: [
        { name: 'Pre-emptive treatment if no CNS or other disease', items: [I('Fluconazole', D.flu1200, '2 weeks')] },
        { name: 'Then', noOr: true, items: [I('Fluconazole', 'Fluconazole 800 mg orally once daily', '8 weeks')] },
        { name: 'Then', noOr: true, items: [I('Fluconazole', D.maint, '6 months')] }
      ],
      notes: ['Start fluconazole when ART can be started.', 'Routine CrAg screening or pre-emptive treatment is not recommended for people without HIV.']
    },
    R_skin: {
      title: 'Primary cutaneous cryptococcosis',
      regimens: [{ items: [I('Fluconazole', 'Fluconazole 400 mg orally once daily', '3–6 months, or until healed')] }],
      notes: ['Only for proven direct inoculation without dissemination: skin lesions are more often a sign of disseminated disease, so check blood CrAg and do an LP if in doubt.', N.hivTest]
    }
  };

  window.GUIDES.crypto = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the ECMM/ISHAM/ASM global guideline for cryptococcosis (Chang CC et al. Lancet Infect Dis 2024). Adult doses; check renal function, interactions and local guidelines.'
  };
})();
