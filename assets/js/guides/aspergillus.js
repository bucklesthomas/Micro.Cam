/*
 * Invasive pulmonary aspergillosis (IPA) in adults: first-line treatment.
 * Recommendations: 2017 ESCMID-ECMM-ERS Aspergillus guideline (Ullmann AJ et al. Clin Microbiol Infect 2018).
 * TDM targets: BSMM (Ashbee 2014) as used by the UKHSA Mycology Reference Laboratory; ECIL-6 (2015).
 * Doses: UK product licences (voriconazole, isavuconazole, posaconazole, liposomal amphotericin B, anidulafungin).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    voriIV:  'Voriconazole IV 6 mg/kg 12-hourly for 2 doses, then 4 mg/kg 12-hourly',
    voriPO:  'Voriconazole orally (≥ 40 kg) 400 mg 12-hourly for 2 doses, then 200 mg 12-hourly (up to 300 mg 12-hourly)',
    isa:     'Isavuconazole 200 mg IV or orally 8-hourly for 6 doses (48 hours), then 200 mg once daily',
    posa:    'Posaconazole 300 mg IV or tablets 12-hourly on day 1, then 300 mg once daily',
    lamb:    'Liposomal amphotericin B 3 mg/kg IV once daily',
    anid:    'Anidulafungin 200 mg IV on day 1, then 100 mg once daily'
  };

  var N = {
    tdmV: 'Voriconazole: check a trough level at day 2–5 and again in week 2. Aim for 1–5.5 mg/L (2–5.5 mg/L for severe or bulky disease); see the antifungal TDM helper.',
    tdmP: 'Posaconazole: check a trough after about 3 days on tablets or IV; aim for > 1 mg/L for treatment.',
    response: 'Assess the response at about 2 weeks. A rise in lesion size on CT in the first 1–2 weeks is common and does not by itself mean failure, especially during neutrophil recovery.',
    duration: 'There is no fixed duration (reported courses range from 3 to over 50 weeks): continue until clinical and radiological resolution and recovery of immunosuppression, often at least 6–12 weeks.',
    reduce: 'Reduce immunosuppression where possible. Consider surgery for lesions near great vessels or the pericardium, haemoptysis from a single lesion, or invasion of the chest wall.',
    sus: 'Send respiratory samples for culture and, if Aspergillus grows, azole susceptibility testing (UKHSA Mycology Reference Laboratory).',
    interact: 'Azoles have many serious interactions (e.g. tacrolimus, ciclosporin, sirolimus, venetoclax, ibrutinib, vincristine): check every drug on the antifungal interactions database.',
    classify: 'Classify the episode with the EORTC/MSGERC criteria on the Scores page.'
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }

  var Q = {
    start: {
      q: 'Is azole resistance a concern?',
      help: 'Consider local rates of azole resistance in A. fumigatus, the patient’s previous azole exposure, and any susceptibility results.',
      options: [
        { label: 'No', sub: 'Susceptible isolate, or no isolate and local resistance < 10%', next: 'azole_ok' },
        { label: 'Local resistance > 10%, no isolate yet', next: 'R_highres' },
        { label: 'Isolate with intermediate voriconazole MIC', sub: 'MIC 2 mg/L', next: 'R_inter' },
        { label: 'Azole-resistant isolate', sub: 'Voriconazole MIC > 2 mg/L', next: 'R_res' }
      ]
    },
    azole_ok: {
      q: 'Can a triazole be used?',
      options: [
        { label: 'Yes', next: 'R_first' },
        { label: 'No', sub: 'Interactions, liver toxicity, QT prolongation or intolerance', next: 'R_noazole' },
        { label: 'Breakthrough infection on mould-active azole prophylaxis', sub: 'e.g. posaconazole', next: 'R_breakthrough' }
      ]
    }
  };

  var R = {
    R_first: {
      title: 'Invasive pulmonary aspergillosis: first-line treatment',
      regimens: [
        { name: 'Option 1', items: [I('Voriconazole', D.voriIV + '; or ' + D.voriPO, '')] },
        { name: 'Option 2', items: [I('Isavuconazole', D.isa, '')] },
        { name: 'Alternative', items: [I('Posaconazole', D.posa, '')] }
      ],
      notes: ['Voriconazole and isavuconazole are the preferred first-line agents. Isavuconazole has fewer side effects (liver, visual, skin), shortens rather than lengthens the QT interval, and does not routinely need TDM.', 'Posaconazole was non-inferior to voriconazole for invasive aspergillosis (Maertens 2021).', 'Combination antifungal therapy is not recommended as routine first-line treatment.', N.tdmV, N.interact, N.response, N.duration, N.reduce, N.sus, N.classify]
    },
    R_noazole: {
      title: 'Invasive pulmonary aspergillosis when a triazole cannot be used',
      regimens: [{ name: 'Recommended', items: [I('Liposomal amphotericin B', D.lamb, '')] }],
      notes: ['Monitor renal function, potassium and magnesium.', 'Review whether an azole becomes possible later (e.g. once an interacting drug stops), particularly for oral step-down.', N.response, N.duration, N.reduce, N.sus]
    },
    R_breakthrough: {
      title: 'Breakthrough aspergillosis on mould-active azole prophylaxis',
      tone: 'amber',
      summary: 'Switch to a different antifungal class and discuss with microbiology.',
      regimens: [{ name: 'Switch class', items: [I('Liposomal amphotericin B', D.lamb, '')] }],
      notes: ['Check the prophylactic azole level: low levels suggest poor absorption rather than resistance.', 'Look hard for a microbiological diagnosis, including Mucorales and other resistant moulds, with BAL or biopsy if possible.', N.sus, N.response, N.duration, N.reduce]
    },
    R_highres: {
      title: 'Aspergillosis where local azole resistance is > 10%',
      tone: 'amber',
      regimens: [
        { name: 'Option 1', items: [I('Voriconazole', D.voriIV, ''), I('plus an echinocandin', D.anid, 'Until susceptibility is known')] },
        { name: 'Option 2', items: [I('Liposomal amphotericin B', D.lamb, '')] }
      ],
      notes: ['Once the isolate is shown to be susceptible, continue voriconazole or isavuconazole alone.', N.sus, N.tdmV, N.interact, N.response, N.duration]
    },
    R_inter: {
      title: 'Aspergillosis with an intermediate voriconazole MIC (2 mg/L)',
      tone: 'amber',
      regimens: [
        { name: 'Option 1', items: [I('Voriconazole', D.voriIV, ''), I('plus an echinocandin', D.anid, '')] },
        { name: 'Option 2', items: [I('Liposomal amphotericin B', D.lamb, '')] }
      ],
      notes: ['Discuss with microbiology and the Mycology Reference Laboratory.', N.tdmV, N.interact, N.response, N.duration, N.reduce]
    },
    R_res: {
      title: 'Azole-resistant aspergillosis (voriconazole MIC > 2 mg/L)',
      tone: 'red',
      regimens: [{ name: 'Recommended', items: [I('Liposomal amphotericin B', D.lamb, '')] }],
      notes: ['Discuss with microbiology and the Mycology Reference Laboratory.', 'Monitor renal function, potassium and magnesium.', N.response, N.duration, N.reduce]
    }
  };

  window.GUIDES.aspergillus = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the 2017 ESCMID-ECMM-ERS Aspergillus guideline, with BSMM and ECIL-6 TDM targets. Doses from the UK product licences; adjust for weight, organ function and interactions.'
  };
})();
