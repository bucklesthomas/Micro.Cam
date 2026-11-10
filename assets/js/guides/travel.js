/*
 * Fever in the returned traveller (adults).
 * Based on: Johnston V et al. Fever in returned travellers presenting in the United Kingdom: recommendations for investigation and initial management. J Infect 2009;59:1-18;
 * ACDP VHF risk assessment algorithm (UKHSA); UK malaria treatment guideline (Lalloo DG et al. J Infect 2016); UKHSA Imported Fever Service and RIPL.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }

  var Q = {
    start: {
      q: 'Could this be a viral haemorrhagic fever or other HCID?',
      help: 'Fever (or history of fever) within 21 days of leaving an area with Ebola, Marburg, Lassa or CCHF, or contact with a case or with body fluids. MERS: respiratory illness within 14 days of travel to the Arabian Peninsula. Use the ACDP VHF risk assessment algorithm (Links page).',
      options: [
        { label: 'Possible VHF or HCID', next: 'R_hcid' },
        { label: 'No', sub: 'VHF risk assessed and excluded', next: 'region' }
      ]
    },
    region: {
      q: 'Where did they travel?',
      help: 'Pick the region that carries the most risk.',
      options: [
        { label: 'Sub-Saharan Africa', next: 'inc' },
        { label: 'South Asia', sub: 'India, Pakistan, Bangladesh, Nepal, Sri Lanka', next: 'inc' },
        { label: 'South-East Asia or Pacific', next: 'inc' },
        { label: 'Latin America or the Caribbean', next: 'inc' },
        { label: 'Middle East or North Africa', next: 'inc' },
        { label: 'Europe, North America or Australia', next: 'inc' }
      ]
    },
    inc: {
      q: 'How long between the likely exposure (or return) and the start of the fever?',
      options: [
        { label: 'Under 10 days', next: 'R_ddx' },
        { label: '10–21 days', next: 'R_ddx' },
        { label: 'Over 21 days', next: 'R_ddx' }
      ]
    }
  };

  // Differential by region (index as in Q.region) and incubation band (0: < 10 d, 1: 10–21 d, 2: > 21 d)
  var X = {
    malF: 'Falciparum malaria (usually within 3 months of return; can be up to 1 year)',
    malV: 'Non-falciparum malaria (P. vivax or ovale can relapse months later)',
    typh: 'Enteric fever (typically 7–21 days; can be up to 60)',
    deng: 'Dengue (3–14 days): headache, retro-orbital pain, myalgia, rash, low platelets',
    chik: 'Chikungunya or Zika (under 12 days): rash, arthralgia',
    rick: 'Rickettsial infection (5–14 days): look for an eschar; African tick bite fever after safari, scrub typhus in Asia',
    lepto: 'Leptospirosis (2–30 days): freshwater, floods, rodents; jaundice, renal failure, conjunctival suffusion',
    schisto: 'Acute schistosomiasis (Katayama fever, 2–8 weeks): freshwater lake or river exposure, high eosinophils',
    hiv: 'Acute HIV seroconversion (2–6 weeks): sexual exposure',
    hep: 'Viral hepatitis A or E (2–8 weeks); B (1–6 months)',
    tb: 'Tuberculosis (weeks to months)',
    amoeb: 'Amoebic liver abscess (weeks to months): right upper quadrant pain',
    leish: 'Visceral leishmaniasis (months): fever, weight loss, splenomegaly, pancytopenia',
    bruc: 'Brucellosis (weeks to months): unpasteurised dairy, livestock',
    mel: 'Melioidosis (1–21 days, or reactivation years later): diabetes, soil and water exposure',
    tryp: 'East African trypanosomiasis (within 3 weeks): safari, tsetse bite chancre',
    flu: 'Influenza, COVID-19 and other respiratory viruses (under 7 days); Legionella after hotels or cruises',
    ent: 'Bacterial gastroenteritis or invasive Salmonella, Shigella, Campylobacter',
    cocc: 'Endemic fungi (histoplasmosis, coccidioidomycosis) after caves or dusty soil',
    mers: 'MERS (within 14 days, respiratory): camels, healthcare in the region',
    qf: 'Q fever (2–3 weeks): livestock exposure',
    tick: 'Tick-borne encephalitis, Lyme disease or tularaemia'
  };
  var DDX = [
    [['malF', 'rick', 'deng', 'flu', 'tryp', 'ent'], ['malF', 'typh', 'rick', 'lepto', 'schisto', 'hiv', 'tryp'], ['malF', 'malV', 'schisto', 'hiv', 'hep', 'tb', 'amoeb', 'leish']],
    [['deng', 'chik', 'typh', 'malV', 'flu', 'ent'], ['typh', 'malV', 'malF', 'deng', 'lepto', 'rick', 'hiv'], ['malV', 'typh', 'tb', 'hep', 'amoeb', 'leish', 'hiv']],
    [['deng', 'chik', 'rick', 'flu', 'malF', 'ent'], ['deng', 'lepto', 'rick', 'mel', 'typh', 'malV', 'hiv'], ['malV', 'tb', 'mel', 'hep', 'hiv', 'amoeb']],
    [['deng', 'chik', 'flu', 'malV', 'lepto', 'ent'], ['deng', 'lepto', 'malV', 'typh', 'cocc', 'hiv'], ['malV', 'tb', 'hep', 'cocc', 'leish', 'hiv']],
    [['flu', 'mers', 'ent', 'deng'], ['bruc', 'typh', 'qf', 'hiv', 'lepto'], ['bruc', 'tb', 'hep', 'leish', 'hiv']],
    [['flu', 'ent', 'tick'], ['qf', 'lepto', 'hiv', 'tick'], ['tb', 'hep', 'hiv']]
  ];
  var NAMES = ['sub-Saharan Africa', 'South Asia', 'South-East Asia', 'Latin America', 'the Middle East or North Africa', 'Europe, North America or Australia'];
  var BAND = ['under 10 days', '10–21 days', 'over 21 days'];

  function ddx(a) {
    var r = a.region ? a.region.i : 0, b = a.inc ? a.inc.i : 0;
    var malariaZone = r <= 3;
    var notes = DDX[r][b].map(function (k) { return 'Consider: ' + X[k]; });
    var regs = [];
    if (malariaZone || r === 4) regs.push({ name: 'First, exclude malaria', noOr: true, items: [I('Malaria blood films and rapid antigen test', 'Same day. If negative, repeat at 12–24 hours and again 24 hours later (3 sets)', '')] });
    regs.push({ name: 'If septic and malaria tests are negative', items: [I('Ceftriaxone', '2 g IV once daily (covers enteric fever and most invasive bacteria)'), I('or Meropenem', '1 g IV every 8 hours if travel to Pakistan (XDR typhoid) or ESBL risk')] });
    regs.push({ name: 'Add if rickettsia or leptospirosis is possible', noOr: true, items: [I('Doxycycline', '100 mg orally every 12 hours', '7 days')] });
    return {
      title: 'Fever after travel to ' + NAMES[r] + ', onset ' + BAND[b],
      tone: malariaZone ? 'amber' : 'green',
      summary: malariaZone ? 'Malaria is the priority: any fever after travel to a malaria area is malaria until proven otherwise.' : null,
      regimens: regs,
      notes: notes.concat([
        'First-line tests: FBC (platelets, eosinophils), U&E, LFT, CRP, glucose, blood cultures, urine dip and culture, chest X-ray, HIV test; save serum for serology. Stool culture if diarrhoea.',
        'Dengue NS1 antigen or PCR in the first week; arbovirus, rickettsia and leptospira tests through the UKHSA Rare and Imported Pathogens Laboratory (RIPL), with travel details on the form.',
        'Ask about: exact dates and itinerary, malaria prophylaxis and adherence, vaccines, freshwater, animal or insect bites, safari, sexual contact, healthcare abroad, food and water, sick contacts.',
        'Avoid NSAIDs and aspirin until dengue is excluded.',
        'Red flags: reduced consciousness, shock, bleeding, jaundice, respiratory distress, acute kidney injury: discuss with infectious diseases now.',
        'Specialist advice: your regional infectious diseases unit, or the UKHSA Imported Fever Service.'
      ])
    };
  }

  var R = {
    R_ddx: ddx,
    R_hcid: {
      title: 'Possible VHF or other high consequence infectious disease', tone: 'red',
      summary: 'Isolate in a side room, minimise staff contact with appropriate PPE, and follow the ACDP VHF algorithm.',
      regimens: [{ name: 'Do not delay', noOr: true, items: [I('Urgent malaria test', 'Still needed: malaria is far more common than VHF. Inform the laboratory first', '')] }],
      notes: ['Discuss immediately with the local infectious diseases or microbiology consultant, who will contact the Imported Fever Service and HCID network.', 'Avoid unnecessary blood tests until the risk is clarified; label any samples as high risk.', 'Notify the local health protection team.', 'MERS or avian influenza: airborne HCID precautions and urgent respiratory samples.', 'If septic, give ceftriaxone after blood cultures while awaiting advice.']
    }
  };

  window.GUIDES.travel = {
    Q: Q, R: R, eyebrow: 'Differential and first steps',
    ref: 'Based on the UK recommendations for fever in returned travellers (Johnston et al. 2009), the ACDP VHF algorithm and the UK malaria guideline. Check outbreak alerts (TravelHealthPro, WHO) for current risks.'
  };
})();
