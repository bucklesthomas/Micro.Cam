/*
 * Imported malaria in adults — checked against the UK malaria treatment guidelines 2016
 * (Lalloo DG et al. J Infect 2016;72:635–49): summary points, Boxes 3–6 and 10, and the pregnancy section.
 * Artenimol–piperaquine weight bands follow the UKHSA treatment-failure guidance (corrected February 2025).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    artesunate: 'Artesunate 2.4 mg/kg IV at 0, 12 and 24 hours, then once daily',
    quinineIV:  'Quinine dihydrochloride: loading dose 20 mg/kg in 5% dextrose or dextrose/saline over 4 hours, then 10 mg/kg over 4 hours every 8 hours for the first 48 hours (12-hourly if IV quinine continues beyond 48 hours). No loading dose if quinine or mefloquine was taken in the previous 12 hours',
    al:         'Artemether–lumefantrine (Riamet) 4 tablets, then 4 tablets at 8, 24, 36, 48 and 60 hours (weight > 35 kg)',
    dhap:       'Artenimol–piperaquine (Eurartesim) once daily: 36 to < 75 kg, 3 tablets; ≥ 75 kg, 4 tablets (320 mg/40 mg). Take on an empty stomach and check the ECG first',
    ap:         'Atovaquone–proguanil (Malarone) 4 standard tablets once daily',
    quinine:    'Quinine sulfate 600 mg orally every 8 hours',
    doxy:       'Doxycycline 200 mg orally once daily',
    clinda:     'Clindamycin 450 mg orally every 8 hours',
    chloro:     'Chloroquine 620 mg base, then 310 mg base 6–8 hours later, then 310 mg base on days 2 and 3',
    pqV:        'Primaquine 30 mg (0.5 mg/kg) orally once daily',
    pqO:        'Primaquine 15 mg (0.25 mg/kg) orally once daily',
    pqWeekly:   'Primaquine 0.75 mg/kg (45 mg) orally once weekly'
  };

  var N = {
    notify: 'Malaria is notifiable: inform the local health protection team.',
    admitF: 'Admit most patients with falciparum malaria for at least 24 hours: they can deteriorate suddenly early in treatment. Admit all patients over 65.',
    films: 'Check parasite clearance with daily blood films. The count can rise in the first 24–36 hours of treatment without meaning treatment failure.',
    prophylaxis: 'Do not treat with the drug the patient took as prophylaxis.',
    resistance: 'Artemisinin partial resistance is spreading (Uganda, Kenya, Tanzania, Rwanda, Ethiopia, Eritrea; established in the Greater Mekong). Discuss travellers from these areas, and any treatment failure, with an ID consultant (UKHSA 2024–25).',
    recurrence: 'Tell the patient to attend for a same-day blood film if fever returns after treatment.',
    haemolysis: 'Delayed haemolysis occurs 7–21 days after IV artesunate in about 10–15% of patients: warn the patient and check haemoglobin about 14 days after treatment.',
    glucose: 'Check blood glucose every 4 hours, every 2 hours during IV quinine, and whenever consciousness falls.',
    g6pd: 'Check G6PD before primaquine. Give primaquine alongside the chloroquine or ACT (overlapping improves relapse prevention). In mild to moderate G6PD deficiency, a weekly regimen can be used with expert advice.',
    expert: 'Discuss every falciparum case with an infectious diseases or tropical medicine specialist.'
  };

  var SEVERE_HELP = 'Severe (UK Box 3) if any of: impaired consciousness or seizures; renal impairment (oliguria < 0.4 ml/kg/hour or creatinine > 265 µmol/L); acidosis (pH < 7.3); hypoglycaemia (< 2.2 mmol/L); pulmonary oedema or ARDS; Hb ≤ 80 g/L; spontaneous bleeding or DIC; shock (BP < 90/60 mmHg); haemoglobinuria (without G6PD deficiency); parasitaemia > 10%. Also give IV treatment if parasitaemia is > 2%, the patient cannot swallow or keep tablets down, or for pregnant women on specialist advice.';

  var Q = {
    start: {
      q: 'Which species?',
      options: [
        { label: 'P. falciparum or mixed', next: 'falc_sev' },
        { label: 'Species not known yet', sub: 'Treat as falciparum until confirmed', next: 'falc_sev' },
        { label: 'P. vivax', next: 'nf_sev' },
        { label: 'P. ovale', next: 'nf_sev' },
        { label: 'P. malariae', next: 'nf_sev' },
        { label: 'P. knowlesi', next: 'nf_sev' }
      ]
    },
    falc_sev: {
      q: 'Severe malaria, or another reason for IV treatment?',
      help: SEVERE_HELP,
      options: [
        { label: 'Yes', sub: 'Severe, or needs IV treatment', next: 'R_severe' },
        { label: 'No', sub: 'Uncomplicated', next: 'falc_preg' }
      ]
    },
    falc_preg: {
      q: 'Is the patient pregnant?',
      options: [
        { label: 'No', next: 'R_falc' },
        { label: 'Yes, first trimester', next: 'R_falc_preg1' },
        { label: 'Yes, second or third trimester', next: 'R_falc_preg23' }
      ]
    },
    nf_sev: {
      q: 'Severe or complicated malaria?',
      help: SEVERE_HELP + ' Severe disease is rare with non-falciparum species but is well recognised with P. knowlesi and P. vivax.',
      options: [
        { label: 'Yes', sub: 'Severe or complicated', next: 'R_severe' },
        { label: 'No', sub: 'Uncomplicated', next: 'nf_preg' }
      ]
    },
    nf_preg: {
      q: 'Is the patient pregnant or breastfeeding?',
      options: [
        { label: 'No', next: 'R_nf' },
        { label: 'Yes', next: 'R_nf' }
      ]
    }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }
  function species(a) { return a.start.label; }

  var R = {
    R_severe: function (a) {
      var sp = species(a);
      var nf = /vivax|ovale/.test(sp);
      var notes = ['Manage in a high-dependency or intensive care setting. Watch for ARDS, DIC, acute kidney injury, seizures and Gram-negative sepsis (give broad-spectrum antibiotics if shocked).',
                   'Pregnancy: severe malaria in any trimester is treated as above, with artesunate preferred over quinine. IV quinine with clindamycin is the alternative.',
                   'Give IV quinine immediately if artesunate is not available: never delay treatment while obtaining it. Exchange transfusion is no longer recommended.',
                   N.glucose, N.films];
      if (nf) notes.push('After treatment, give primaquine to prevent relapse (P. vivax 30 mg daily, P. ovale 15 mg daily, for 14 days). ' + N.g6pd);
      notes.push(N.haemolysis, N.resistance, N.notify, N.expert);
      return {
        title: 'Severe or complicated malaria (' + (/^Species/.test(sp) ? 'species not yet known' : sp) + ')',
        tone: 'red',
        regimens: [
          { name: 'First line', items: [I('Artesunate', D.artesunate, 'At least 24 hours, up to 5 days'), I('then a full oral course', 'Once improved and able to take tablets: artemether–lumefantrine or artenimol–piperaquine (doses as for uncomplicated malaria); or quinine with doxycycline; or atovaquone–proguanil', 'Full course')] },
          { name: 'If artesunate is not immediately available', items: [I('Quinine IV', D.quinineIV, 'Until able to swallow'), I('then Quinine orally', D.quinine, 'To complete 5–7 days of quinine'), I('plus Doxycycline', D.doxy + ' (clindamycin 450 mg 8-hourly in pregnancy)', '7 days from when able to swallow')] }
        ],
        notes: notes
      };
    },
    R_falc: {
      title: 'Uncomplicated falciparum malaria',
      regimens: [
        { name: 'Drug of choice', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Alternative', items: [I('Artenimol–piperaquine', D.dhap, '3 days')] },
        { name: 'If an artemisinin combination is not available', items: [I('Atovaquone–proguanil', D.ap, '3 days')] },
        { name: 'Or', noOr: true, items: [I('Quinine', D.quinine, '5–7 days'), I('plus Doxycycline', D.doxy, '7 days')] }
      ],
      notes: [N.admitF, N.films, 'If the patient vomits or cannot take tablets, give IV treatment as for severe malaria.', 'The 2016 guideline gave artenimol–piperaquine bands of 36–60 kg (3 tablets) and > 60 kg (4 tablets); the bands shown follow UKHSA’s corrected 2025 table and the product licence.', N.prophylaxis, N.resistance, N.recurrence, N.notify]
    },
    R_falc_preg1: {
      title: 'Uncomplicated falciparum malaria, first trimester of pregnancy',
      tone: 'amber',
      summary: 'Admit, seek specialist advice, and manage with the obstetric team.',
      regimens: [{ name: 'Usual treatment', items: [I('Quinine', D.quinine, '7 days'), I('plus Clindamycin', D.clinda, '7 days')] }],
      notes: ['Data on artemether–lumefantrine in the first trimester are limited, but no harm has been detected: decide with the specialist.', 'Quinine can cause uterine contractions and hypoglycaemia: monitor glucose and the fetus.', 'Avoid doxycycline and primaquine in pregnancy.', N.resistance, N.notify]
    },
    R_falc_preg23: {
      title: 'Uncomplicated falciparum malaria, second or third trimester',
      tone: 'amber',
      summary: 'Admit and manage with the obstetric team.',
      regimens: [
        { name: 'Treatment of choice', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Alternative (any trimester)', items: [I('Quinine', D.quinine, '7 days'), I('plus Clindamycin', D.clinda, '7 days')] }
      ],
      notes: ['None of the oral ACTs or atovaquone–proguanil are licensed in pregnancy, but no adverse effects of artemether–lumefantrine have been found in the second and third trimesters.', 'Quinine can cause uterine contractions and hypoglycaemia.', 'Avoid doxycycline and primaquine in pregnancy.', N.resistance, N.notify]
    },
    R_nf: function (a) {
      var sp = species(a), preg = a.nf_preg && a.nf_preg.i === 1;
      var vivax = /vivax/.test(sp), ovale = /ovale/.test(sp), knowlesi = /knowlesi/.test(sp);
      var regs = [
        { name: 'Option 1', items: [I('Chloroquine', D.chloro, '3 days')] },
        { name: 'Option 2', items: [I('Artemether–lumefantrine or artenimol–piperaquine', D.al + '; or ' + D.dhap, '3 days')] }
      ];
      var notes = ['Use an ACT (option 2) if there is a mixed infection, the species is uncertain, or falciparum cannot be reliably excluded.'];
      if (vivax) notes.push('Chloroquine resistance in P. vivax is increasing, particularly from Papua New Guinea and Indonesia: an ACT may be preferred for infections from these areas.');
      if (knowlesi) notes.push('P. knowlesi can cause severe disease: measure the parasitaemia and give IV artesunate if severe.');
      if (vivax || ovale) {
        if (preg) {
          notes.push('Primaquine is contraindicated in pregnancy and breastfeeding (until the infant’s G6PD status is known): give weekly chloroquine prophylaxis (500 mg) until after delivery or breastfeeding, then consider primaquine.');
        } else {
          regs.push({ name: 'Then prevent relapse (after G6PD check)', noOr: true, items: [
            I('Primaquine', vivax ? D.pqV : D.pqO, '14 days'),
            I('If mild to moderate G6PD deficiency (expert advice)', D.pqWeekly, '8 weeks')
          ] });
          notes.push(N.g6pd);
        }
      }
      if (preg) notes.push('In pregnancy, chloroquine is safe throughout; ACTs can be used in the second and third trimesters, and quinine in the first trimester if resistant vivax is a concern.');
      notes.push('Most non-falciparum malaria can be treated as an outpatient unless there are complications or other concerns.', N.prophylaxis, N.recurrence, N.notify);
      return {
        title: 'Uncomplicated ' + sp + ' malaria' + (preg ? ' in pregnancy or breastfeeding' : ''),
        tone: preg ? 'amber' : null,
        regimens: regs,
        notes: notes
      };
    }
  };

  window.GUIDES.malaria = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the UK malaria treatment guidelines 2016 (Lalloo DG et al.), with UKHSA interim guidance on falciparum treatment failure (2024–25). Adult doses; children need weight-based dosing. Check interactions and local guidelines.'
  };
})();
