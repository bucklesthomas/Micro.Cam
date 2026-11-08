/*
 * Imported malaria in adults — UK malaria treatment guidelines 2016 (Lalloo DG et al. J Infect 2016;72:635–49),
 * with UKHSA interim guidance on treatment failure (2024, updated 2025).
 * Doses checked against NHS trust guidance based on these; the full 2016 text could not be accessed.
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    artesunate: 'Artesunate 2.4 mg/kg IV at 0, 12 and 24 hours, then once daily',
    quinineIV:  'Quinine dihydrochloride: loading 20 mg/kg (max 1.4 g) IV over 4 hours (omit the loading dose if quinine or mefloquine taken recently), then 10 mg/kg (max 700 mg) IV over 4 hours every 8 hours',
    al:         'Artemether–lumefantrine (Riamet) 4 tablets at 0, 8, 24, 36, 48 and 60 hours (6 doses; adults ≥ 35 kg), taken with fatty food or milk',
    ap:         'Atovaquone–proguanil (Malarone) 4 standard tablets (1 g/400 mg) once daily, with food',
    dhap:       'Artenimol–piperaquine (Eurartesim) once daily on an empty stomach: 36 to < 75 kg, 3 tablets; ≥ 75 kg, 4 tablets (320 mg/40 mg). Check the ECG first',
    quinine:    'Quinine sulfate 600 mg orally every 8 hours',
    doxy:       'Doxycycline 200 mg orally once daily',
    clinda:     'Clindamycin 450 mg orally every 8 hours',
    chloro:     'Chloroquine 620 mg base orally, then 310 mg base at 6, 24 and 48 hours',
    pqV:        'Primaquine 30 mg orally once daily',
    pqO:        'Primaquine 15 mg orally once daily'
  };

  var N = {
    notify: 'Malaria is notifiable: inform the local health protection team.',
    admit: 'Admission is generally advised for falciparum malaria, at least initially. Repeat blood films to confirm the parasitaemia is falling.',
    prophylaxis: 'Do not treat with the drug the patient took as prophylaxis.',
    resistance: 'Artemisinin partial resistance is spreading (Uganda, Kenya, Tanzania, Rwanda, Ethiopia, Eritrea; established in the Greater Mekong). Discuss travellers from these areas, and any treatment failure, with an ID consultant.',
    recurrence: 'Tell the patient to attend for a same-day blood film if fever returns after treatment.',
    haemolysis: 'After IV artesunate, check haemoglobin about 2 weeks later: delayed haemolysis can occur 1–4 weeks after treatment.',
    g6pd: 'Check G6PD before primaquine. In G6PD deficiency, pregnancy or breastfeeding (until the infant’s G6PD is known), seek expert advice.',
    expert: 'Discuss with an infectious diseases consultant or the local tropical medicine service.',
    verify: 'Check doses against the full UK malaria treatment guideline (2016): it could not be accessed in full when this was written.'
  };

  var SEVERE_HELP = 'Severe if any of: impaired consciousness or seizures; renal impairment (oliguria or creatinine > 265 µmol/L); acidosis (pH < 7.3) or lactate > 4 mmol/L; hypoglycaemia (< 2.2 mmol/L); pulmonary oedema or ARDS; Hb ≤ 80 g/L; spontaneous bleeding or DIC; shock (SBP < 90 mmHg); haemoglobinuria; or parasitaemia > 2%.';

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
      q: 'Any features of severe malaria?',
      help: SEVERE_HELP,
      options: [
        { label: 'Yes', sub: 'Severe or complicated', next: 'R_severe' },
        { label: 'No', sub: 'Uncomplicated', next: 'falc_preg' }
      ]
    },
    falc_preg: {
      q: 'Is the patient pregnant?',
      options: [
        { label: 'No', next: 'R_falc' },
        { label: 'Yes', next: 'R_falc_preg' }
      ]
    },
    nf_sev: {
      q: 'Any features of severe malaria?',
      help: SEVERE_HELP + ' Severe disease is uncommon with non-falciparum species but does occur, particularly with P. knowlesi and P. vivax.',
      options: [
        { label: 'Yes', sub: 'Severe or complicated', next: 'R_severe' },
        { label: 'No', sub: 'Uncomplicated', next: 'nf_preg' }
      ]
    },
    nf_preg: {
      q: 'Is the patient pregnant?',
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
      var notes = ['Manage in a high-dependency or intensive care setting. Monitor glucose, fluid balance and parasitaemia closely.',
                   'IV artesunate is recommended in all trimesters of pregnancy for severe malaria.'];
      if (nf) notes.push('After treatment, give primaquine for radical cure (P. vivax 30 mg daily, P. ovale 15 mg daily, for 14 days). ' + N.g6pd);
      notes.push(N.haemolysis, N.resistance, N.notify, N.expert);
      return {
        title: 'Severe malaria (' + sp + ')',
        tone: 'red',
        verify: N.verify,
        regimens: [
          { name: 'First line', items: [I('Artesunate', D.artesunate, 'At least 24 hours'), I('then a full oral course', 'Once improving and able to take oral treatment: ' + D.al, '3 days')] },
          { name: 'If artesunate is not immediately available', items: [I('Quinine IV', D.quinineIV, 'Until artesunate available or able to take oral'), I('then', 'Complete treatment with an oral regimen (e.g. artemether–lumefantrine, or quinine with doxycycline or clindamycin)', 'Total 7 days for quinine')] }
        ],
        notes: notes
      };
    },
    R_falc: {
      title: 'Uncomplicated falciparum malaria',
      verify: N.verify,
      regimens: [
        { name: 'First line', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Alternative', items: [I('Artenimol–piperaquine', D.dhap, '3 days')] },
        { name: 'If an artemisinin combination is unsuitable', items: [I('Atovaquone–proguanil', D.ap, '3 days')] },
        { name: 'Or', noOr: true, items: [I('Quinine', D.quinine, '5–7 days'), I('plus Doxycycline or clindamycin', D.doxy + '; or ' + D.clinda, '7 days')] }
      ],
      notes: [N.admit, 'If vomiting prevents oral treatment, treat as severe with IV artesunate.', N.prophylaxis, N.resistance, N.recurrence, N.notify]
    },
    R_falc_preg: {
      title: 'Uncomplicated falciparum malaria in pregnancy',
      tone: 'amber',
      verify: N.verify,
      summary: 'Admit and discuss with an ID consultant and the obstetric team.',
      regimens: [
        { name: 'All trimesters', items: [I('Quinine', D.quinine, '7 days'), I('plus Clindamycin', D.clinda, '7 days')] },
        { name: 'Second and third trimesters', items: [I('Artemether–lumefantrine', D.al, '3 days')] }
      ],
      notes: ['Doxycycline is avoided in pregnancy; use clindamycin with quinine. Avoid primaquine.', 'WHO (2022) also allows artemether–lumefantrine in the first trimester: decide with the specialist team.', 'Watch closely for hypoglycaemia with quinine.', N.resistance, N.notify]
    },
    R_nf: function (a) {
      var sp = species(a), preg = a.nf_preg && a.nf_preg.i === 1;
      var vivax = /vivax/.test(sp), ovale = /ovale/.test(sp), knowlesi = /knowlesi/.test(sp);
      var regs = [
        { name: 'Option 1', items: [I('Artemether–lumefantrine', D.al, '3 days')] },
        { name: 'Option 2', items: [I('Chloroquine', D.chloro, '3 days')] }
      ];
      var notes = [];
      if (vivax) notes.push('Use an artemisinin combination rather than chloroquine for P. vivax from areas of chloroquine resistance (e.g. Indonesia, Papua New Guinea, Timor-Leste, Pacific islands), or if mixed infection is possible.');
      if (knowlesi) notes.push('P. knowlesi can progress rapidly: an artemisinin combination is preferred, and treat as severe if parasitaemia is high or the patient deteriorates.');
      if (vivax || ovale) {
        if (preg) {
          notes.push('Primaquine is contraindicated in pregnancy: give weekly chloroquine prophylaxis (300 mg base) until delivery, then primaquine after delivery and breastfeeding, with expert advice.');
        } else {
          regs.push({ name: 'Then radical cure (after G6PD check)', noOr: true, items: [I('Primaquine', vivax ? D.pqV : D.pqO, '14 days')] });
          notes.push(N.g6pd);
        }
      }
      if (preg) notes.push('In pregnancy, chloroquine is safe; discuss artemisinin combinations in the first trimester with the specialist team.');
      notes.push('Admission is usually not required if well and able to take oral treatment.', N.prophylaxis, N.recurrence, N.notify);
      return {
        title: 'Uncomplicated ' + sp + ' malaria' + (preg ? ' in pregnancy' : ''),
        tone: preg ? 'amber' : null,
        verify: N.verify,
        regimens: regs,
        notes: notes
      };
    }
  };

  window.GUIDES.malaria = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From the UK malaria treatment guidelines 2016 and UKHSA interim guidance on falciparum treatment failure (2024–25). Adult doses; check weight-based dosing, interactions and local guidelines.'
  };
})();
