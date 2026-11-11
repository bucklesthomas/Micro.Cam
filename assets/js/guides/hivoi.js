/*
 * HIV-associated opportunistic infections in adults: treatment and ART timing.
 * PCP: BHIVA guidelines for pulmonary opportunistic infections (2024).
 * CNS infections (toxoplasmosis, PML): BHIVA/BIA opportunistic infection guidelines 2011 (HIV Med 2011;12 Suppl 2).
 * Cryptococcal ART timing: ECMM/ISHAM/ASM 2024 and WHO 2022. TB ART timing: BHIVA TB/HIV guideline (2019).
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }
  var G6PD = 'Check G6PD before co-trimoxazole, dapsone or primaquine (do not delay treatment).';

  var Q = {
    start: {
      q: 'Which opportunistic infection?',
      options: [
        { label: 'Pneumocystis pneumonia (PCP)', next: 'pcp' },
        { label: 'Cerebral toxoplasmosis', sub: 'Ring-enhancing lesions, Toxoplasma IgG positive', next: 'R_toxo' },
        { label: 'Cryptococcal meningitis or positive CrAg', next: 'R_crypto' },
        { label: 'Tuberculosis', next: 'tb' },
        { label: 'CMV retinitis', next: 'R_cmv' },
        { label: 'Oesophageal candidiasis', next: 'R_cand' },
        { label: 'Disseminated MAC', sub: 'Mycobacterium avium complex', next: 'R_mac' },
        { label: 'PML', sub: 'Progressive multifocal leukoencephalopathy', next: 'R_pml' }
      ]
    },
    pcp: {
      q: 'How severe?',
      help: 'Moderate to severe: PaO2 < 9.3 kPa or SaO2 ≤ 92% on air at rest, or desaturation of 3% or more on exercise.',
      options: [
        { label: 'Mild to moderate', sub: 'Can take oral treatment', next: 'R_pcpMild' },
        { label: 'Moderate to severe', next: 'R_pcpSev' },
        { label: 'Intolerant of co-trimoxazole', next: 'R_pcpAlt' }
      ]
    },
    tb: {
      q: 'Which applies?',
      options: [
        { label: 'TB meningitis', next: 'R_tbm' },
        { label: 'Other TB, CD4 < 50', next: 'R_tb50' },
        { label: 'Other TB, CD4 ≥ 50', next: 'R_tbHigh' }
      ]
    }
  };

  var STEROID = 'Prednisolone 40 mg twice daily (days 1–5), 40 mg once daily (days 6–10), then 20 mg once daily (days 11–21); start within 72 hours of PCP treatment';
  var R = {
    R_pcpMild: {
      title: 'Mild to moderate PCP', tone: 'amber',
      regimens: [{ name: 'First line (BHIVA 2024)', items: [I('Co-trimoxazole orally', 'Trimethoprim 15–20 mg/kg/day in 3 divided doses (rounded to the nearest 480 mg tablet; e.g. two 960 mg tablets three times daily)', '21 days')] }],
      notes: ['Start ART within 2 weeks of diagnosis.', 'Then secondary prophylaxis: co-trimoxazole 480–960 mg once daily until CD4 > 200 for 3 months on ART (or > 100 with undetectable viral load for 3–6 months).', 'Wait at least 4 days before calling treatment failure.', G6PD]
    },
    R_pcpSev: {
      title: 'Moderate to severe PCP', tone: 'red',
      regimens: [
        { name: 'First line (BHIVA 2024)', noOr: true, items: [I('Co-trimoxazole IV', 'Trimethoprim 15–20 mg/kg/day in 3–4 divided doses; oral once improving', '21 days'), I('plus Prednisolone', STEROID)] },
        { name: 'Alternatives', items: [I('Clindamycin plus primaquine', 'Clindamycin 600 mg IV 4 times daily (or 900 mg 3 times daily) plus primaquine 30 mg orally once daily'), I('or Pentamidine', '4 mg/kg IV once daily over 60 minutes')] }
      ],
      notes: ['Corticosteroids reduce mortality when hypoxic (IV methylprednisolone at 75% of the prednisolone dose if nil by mouth).', 'Early critical care review if worsening. ART within 2 weeks (some defer in ventilated patients).', 'Monitor full blood count, potassium, creatinine and LFTs on high-dose co-trimoxazole.', G6PD]
    },
    R_pcpAlt: {
      title: 'PCP: co-trimoxazole not tolerated', tone: 'amber',
      regimens: [
        { name: 'Mild to moderate', items: [I('Clindamycin plus primaquine', 'Clindamycin 450 mg 4 times daily or 600 mg 3 times daily, plus primaquine 30 mg once daily'), I('or Dapsone plus trimethoprim', 'Dapsone 100 mg once daily plus trimethoprim 15 mg/kg/day in 3 doses'), I('or Atovaquone', '750 mg twice daily with food')] },
        { name: 'Moderate to severe', items: [I('Clindamycin IV plus primaquine', '600 mg 4 times daily plus primaquine 30 mg'), I('or Pentamidine IV', '4 mg/kg once daily')] }
      ],
      notes: ['Minor rash: co-trimoxazole can often be continued or reintroduced by desensitisation. Never rechallenge after SJS/TEN.', G6PD]
    },
    R_toxo: {
      title: 'Cerebral toxoplasmosis', tone: 'red',
      regimens: [
        { name: 'Induction, 6 weeks (BHIVA)', noOr: true, items: [I('Pyrimethamine', '200 mg loading dose, then 50 mg daily (< 60 kg) or 75 mg daily (≥ 60 kg)'), I('plus Sulfadiazine', '1 g 4 times daily (< 60 kg) or 1.5 g 4 times daily (≥ 60 kg)'), I('plus Folinic acid', '15 mg daily')] },
        { name: 'Sulfadiazine intolerant', items: [I('Clindamycin', '600 mg 4 times daily, with pyrimethamine and folinic acid')] },
        { name: 'Alternative if pyrimethamine unavailable', items: [I('Co-trimoxazole', 'Trimethoprim 10 mg/kg/day in divided doses (IV or oral)')] }
      ],
      notes: ['Expect clinical improvement within 1–2 weeks and radiological improvement by 2–3 weeks; if not, consider lymphoma (EBV PCR in CSF) and brain biopsy.', 'Dexamethasone only for mass effect.', 'Then maintenance (pyrimethamine 25 mg daily, sulfadiazine 500 mg–1 g 4 times daily, folinic acid) until CD4 > 200 for 6 months on ART.', 'Start ART about 2 weeks after starting treatment, once stable.', 'Hydrate well on sulfadiazine (crystalluria); monitor full blood count.']
    },
    R_crypto: {
      title: 'Cryptococcal disease in HIV', tone: 'red',
      summary: 'See the cryptococcal disease guide for induction, consolidation and pressure management.',
      regimens: [{ items: [I('Liposomal amphotericin B plus flucytosine', 'See the cryptococcal guide')] }],
      notes: ['Defer ART until 4–6 weeks after starting antifungal treatment (early ART increases mortality in cryptococcal meningitis).', 'Positive serum CrAg without symptoms (CD4 < 100–200): do an LP; if no CNS disease, pre-emptive fluconazole.']
    },
    R_tbm: {
      title: 'TB meningitis with HIV', tone: 'red',
      summary: 'Do not start ART early: early ART increases severe adverse events and death in TB meningitis.',
      regimens: [{ name: 'Standard', noOr: true, items: [I('Rifampicin, isoniazid, pyrazinamide, ethambutol', '2 months, then rifampicin and isoniazid for 10 months'), I('plus Dexamethasone', 'Weight-based tapering course over 6–8 weeks')] }],
      notes: ['Timing of ART: discuss with the HIV team (usually after the first weeks of TB treatment; WHO suggests 4–8 weeks).', 'Rifampicin interacts with many antiretrovirals (boosted PIs, some integrase inhibitors need dose changes): check the Liverpool HIV drug interactions site.']
    },
    R_tb50: {
      title: 'TB (not meningitis), CD4 < 50', tone: 'red',
      summary: 'Start ART within 2 weeks of starting TB treatment (BHIVA).',
      regimens: [{ items: [I('Standard TB treatment', 'Rifampicin, isoniazid, pyrazinamide and ethambutol for 2 months, then rifampicin and isoniazid for 4 months')] }],
      notes: ['Watch for TB immune reconstitution inflammatory syndrome (IRIS); prednisolone prophylaxis can be considered (PredART trial).', 'Co-trimoxazole prophylaxis. Pyridoxine with isoniazid.', 'Check interactions with rifampicin (e.g. double-dose dolutegravir).']
    },
    R_tbHigh: {
      title: 'TB (not meningitis), CD4 ≥ 50', tone: 'amber',
      summary: 'Start ART after 2 weeks and within 8–12 weeks of starting TB treatment (BHIVA).',
      regimens: [{ items: [I('Standard TB treatment', '6 months (longer for CNS, bone or other complicated disease)')] }],
      notes: ['Check interactions with rifampicin (Liverpool HIV drug interactions).', 'Co-trimoxazole prophylaxis if CD4 < 200.']
    },
    R_cmv: {
      title: 'CMV retinitis', tone: 'red',
      summary: 'Urgent ophthalmology review.',
      regimens: [
        { name: 'Induction (14–21 days)', items: [I('Valganciclovir', '900 mg orally twice daily with food'), I('or Ganciclovir', '5 mg/kg IV twice daily, with or without intravitreal therapy for sight-threatening lesions')] },
        { name: 'Then maintenance', noOr: true, items: [I('Valganciclovir', '900 mg once daily until CD4 > 100 for 3–6 months on ART, and inactive retinitis')] }
      ],
      notes: ['Start ART within 2 weeks; watch for immune recovery uveitis.', 'Monitor full blood count (neutropenia) and renal function; adjust doses in renal impairment.', 'Screen for retinitis (dilated fundoscopy) in people with CD4 < 50.']
    },
    R_cand: {
      title: 'Oesophageal candidiasis', tone: 'amber',
      regimens: [{ items: [I('Fluconazole', '200–400 mg orally once daily', '14–21 days')] }, { name: 'Fluconazole resistant or failing', items: [I('Itraconazole, posaconazole, voriconazole or an echinocandin', 'Guided by species and susceptibility')] }],
      notes: ['An AIDS-defining illness: start ART promptly and PCP prophylaxis if CD4 < 200.', 'Endoscopy if no response within a week.']
    },
    R_mac: {
      title: 'Disseminated Mycobacterium avium complex', tone: 'amber',
      regimens: [{ noOr: true, items: [I('Clarithromycin', '500 mg twice daily (or azithromycin 500 mg daily)'), I('plus Ethambutol', '15 mg/kg once daily'), I('with or without Rifabutin', '300 mg once daily (check ART interactions)')] }],
      notes: ['Usually CD4 < 50. Primary prophylaxis is not needed if ART is started promptly.', 'Start ART within 2 weeks. Treat for at least 12 months and until CD4 > 100 for 6 months.']
    },
    R_pml: {
      title: 'Progressive multifocal leukoencephalopathy', tone: 'red',
      summary: 'No specific antiviral works: start effective ART as soon as possible.',
      regimens: [],
      notes: ['Diagnosis: typical MRI (white matter lesions without mass effect) plus JC virus PCR in CSF.', 'Watch for PML-IRIS after starting ART; corticosteroids may be used for severe inflammatory IRIS.']
    }
  };

  window.GUIDES.hivoi = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From BHIVA opportunistic infection guidelines (pulmonary 2024; CNS 2011), BHIVA TB/HIV (2019), ECMM/ISHAM 2024 and WHO. Always discuss with the HIV team and check antiretroviral interactions.'
  };
})();
