/*
 * Rabies post-exposure risk assessment and treatment (England).
 * UKHSA: Guidelines on managing rabies post-exposure (January 2023); Summary of risk assessment and treatment (updated June 2025);
 * Interim recommendations for HRIG use (27 June 2025, supersede HRIG guidance in the main guideline); RIgS page (July 2026).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var CAT_LAND = [
    { label: 'Category 1: no contact with saliva', sub: 'Touching, stroking or feeding the animal; licks on intact skin' },
    { label: 'Category 2: minimal contact', sub: 'Scratches, abrasions or bruising; bites that do not break the skin; licks on broken skin' },
    { label: 'Category 3: direct contact with saliva', sub: 'Bites that break the skin, deep lacerations, or saliva on mucous membranes' }
  ];
  var CAT_BAT = [
    { label: 'Category 1: no direct contact', sub: 'Touching a dead bat, contact through a barrier such as gloves, or a bat in the same room (UK or Ireland)' },
    { label: 'Category 2: uncertain contact', sub: 'Handling a live bat without gloves, or a bat in the room of a sleeping person (outside the UK or Ireland)' },
    { label: 'Category 3: direct contact', sub: 'Any bite or scratch, or saliva on mucous membranes' }
  ];

  function cats(list) { return list.map(function (c) { return { label: c.label, sub: c.sub, next: route }; }); }

  // Composite risk from animal/country risk and exposure category
  var RISK = { none: ['green', 'green', 'green'], low: ['green', 'amber', 'amber'], high: ['green', 'amber', 'red'], confirmed: ['greenamber', 'red', 'red'] };

  function riskLevel(a) {
    var animal = a.start.i;
    if (animal === 4) return 'confirmed';
    if (animal === 0) return a.bat_country.i === 0 ? 'low' : 'high';
    if (animal === 1) return ['none', 'low', 'high'][a.land_country.i];
    return a.pr_country.i === 0 ? 'low' : 'none'; // primate or rodent
  }
  function category(a) { return (a.cat_bat || a.cat_land).i; } // 0, 1, 2 = categories 1, 2, 3
  function composite(a) { return RISK[riskLevel(a)][category(a)]; }

  // Does this route need the HRIG questions? (red composite, or confirmed rabid category 3, in a non-immunised person)
  function hrigRoute(a) {
    var animal = a.start.i, c = composite(a);
    return a.immune.i === 0 && c === 'red' && animal !== 2 && animal !== 3 && category(a) === 2;
  }

  function route(a) {
    if (!a.immune) {
      var c = composite(a);
      return c === 'green' || c === 'greenamber' ? 'R_rabies' : 'immune';
    }
    if (hrigRoute(a)) {
      if (!a.hrig_prior) return 'hrig_prior';
      if (a.hrig_prior.i === 1) return 'R_rabies';
      if (a.start.i === 4) return 'R_rabies';           // confirmed rabid: group 3
      if (!a.age) return 'age';
      if (a.age.i === 0) return 'R_rabies';             // under 16: group 2
      if (!a.healed) return 'healed';
    }
    return 'R_rabies';
  }

  var Q = {
    start: {
      q: 'What kind of animal?',
      options: [
        { label: 'Bat', next: 'bat_country' },
        { label: 'Dog, cat, fox or other land mammal', next: 'land_country' },
        { label: 'Monkey or other primate', next: 'pr_country' },
        { label: 'Rodent', sub: 'e.g. rat, mouse, squirrel', next: 'pr_country' },
        { label: 'Animal confirmed to have rabies', next: 'cat_land' }
      ]
    },
    bat_country: {
      q: 'Where did the bat exposure happen?',
      options: [
        { label: 'UK or Ireland', sub: 'Low risk', next: 'cat_bat' },
        { label: 'Any other country', sub: 'High risk', next: 'cat_bat' }
      ]
    },
    land_country: {
      q: 'What is the rabies risk for that country and animal?',
      help: 'Check the country on the UKHSA “Rabies risks by country” list (linked below the guide).',
      options: [
        { label: 'No risk', next: 'cat_land' },
        { label: 'Low risk', next: 'cat_land' },
        { label: 'High risk', next: 'cat_land' }
      ]
    },
    pr_country: {
      q: 'Is rabies present in land animals in that country?',
      help: 'Rodent and primate exposures count as low risk in any country where rabies is present in land animals.',
      options: [
        { label: 'Yes', sub: 'Low risk', next: 'cat_land' },
        { label: 'No', sub: 'No risk', next: 'cat_land' }
      ]
    },
    cat_bat: { q: 'What kind of contact?', options: cats(CAT_BAT) },
    cat_land: { q: 'What kind of contact?', options: cats(CAT_LAND) },
    immune: {
      q: 'Rabies vaccination history and immune status?',
      options: [
        { label: 'Never vaccinated, or partially vaccinated', sub: 'Not immunosuppressed', next: route },
        { label: 'Fully vaccinated', sub: '≥ 3 documented doses on ≥ 2 days, a completed PET course, or antibody ≥ 0.5 IU/ml; not immunosuppressed', next: route },
        { label: 'Immunosuppressed', sub: 'Whatever the vaccination history', next: route }
      ]
    },
    hrig_prior: {
      q: 'Has the patient already had rabies immunoglobulin, or started vaccine more than 7 days ago?',
      help: 'For example treatment started abroad, including equine RIG or a monoclonal antibody.',
      options: [
        { label: 'No', next: route },
        { label: 'Yes', sub: 'HRIG no longer indicated', next: route }
      ]
    },
    age: {
      q: 'Is the patient under 16?',
      options: [
        { label: 'Yes', next: route },
        { label: 'No', next: route }
      ]
    },
    healed: {
      q: 'Is the wound fully healed, or was the exposure more than a month ago?',
      options: [
        { label: 'No', next: route },
        { label: 'Yes', next: route }
      ]
    }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }

  var N = {
    wound: 'Clean the wound thoroughly with soap and running water as soon as possible, and disinfect it. Consider tetanus and antibiotic prophylaxis for the bite itself.',
    rigs: 'Call the UKHSA Rabies and Immunoglobulin Service (RIgS) on 0330 128 1020 (9:30am–5pm, 7 days) to complete the risk assessment and arrange vaccine or HRIG. England only: in Scotland, Wales and Northern Ireland, contact local health protection.',
    ooh: 'Out of hours, RIgS only takes the highest-risk calls: head or neck exposures (not UK bats) or a confirmed rabid animal, where no vaccine dose has been given. Otherwise give a vaccine dose if available locally and call RIgS after 9:30am.',
    timing: 'Rabies treatment is not usually an emergency and there is no time limit: assess even if the exposure was months ago. Start vaccine ideally within 24 hours of contacting UKHSA, or within 12 hours for head and neck exposures needing HRIG or a confirmed rabid animal.',
    observe: 'For a dog or cat: if the animal stays well and behaves normally for 15 days after the exposure, it was not infectious at the time. If in doubt, start treatment.',
    abroad: 'If treatment was started abroad, map the doses to the nearest UK schedule (two doses on the same day count as one) and seek RIgS advice if the vaccine is not compatible.',
    vacc: 'Give vaccine intramuscularly into the deltoid, alternating sides. Do not give dose 4 before day 21; if it is given early, add a fifth dose 2 weeks later.'
  };

  var R = {
    R_rabies: function (a) {
      var c = composite(a), risk = riskLevel(a), cat = category(a), animal = a.start.i;
      var animalName = a.start.label.toLowerCase();
      var catLabel = (a.cat_bat || a.cat_land).label.split(':')[0];

      if (c === 'green') {
        return {
          title: 'Green: no rabies treatment needed',
          tone: 'green',
          summary: (risk === 'none' ? 'No rabies risk for this country and animal.' : catLabel + ' exposures do not need post-exposure treatment.'),
          regimens: [],
          notes: [N.wound, 'Reassure the patient. Seek RIgS advice if unsure about the country risk or exposure.']
        };
      }
      if (c === 'greenamber') {
        return {
          title: 'Green or amber: discuss with RIgS',
          tone: 'amber',
          summary: 'Category 1 contact with an animal confirmed to have rabies: RIgS will advise whether vaccine is needed.',
          regimens: [],
          notes: [N.rigs, N.wound]
        };
      }

      var im = a.immune.i, regs = [], notes = [], hrig = null;
      // Vaccine schedule
      if (im === 0) regs.push({ name: 'Rabies vaccine', items: [I('4 doses', 'Days 0, 3, 7 and 21', '')] });
      if (im === 1) regs.push({ name: 'Rabies vaccine (previously vaccinated)', items: [I('2 doses', 'Day 0, then one dose between days 3 and 7', '')] });
      if (im === 2) regs.push({ name: 'Rabies vaccine (immunosuppressed)', items: [I('5 doses', 'Days 0, 3, 7, 14 and 30; send blood for rabies antibodies with the day 30 dose', '')] });

      // HRIG (UKHSA interim recommendations, June 2025)
      var noRig = a.hrig_prior && a.hrig_prior.i === 1;
      if (im === 2 && animal !== 2 && animal !== 3) {
        hrig = { group: 'Group 1 (severely immunosuppressed)', full: true };
      } else if (im === 2) {
        notes.push('Primate and rodent exposures do not need HRIG, even when immunosuppressed: discuss with RIgS.');
      } else if (hrigRoute(a) && !noRig) {
        if (animal === 4) hrig = { group: 'Group 3 (confirmed rabid animal)', full: true };
        else if (a.age && a.age.i === 0) hrig = { group: 'Group 2 (child under 16 in a high-risk country)', full: true };
        else if (a.healed && a.healed.i === 0) hrig = { group: 'Group 4 (category 3 in a high-risk country)', full: false };
        else notes.push('HRIG is not indicated: the wound has healed or the exposure was more than a month ago.');
      } else if (noRig) {
        notes.push('HRIG is not indicated: rabies immunoglobulin was already given, or vaccine was started more than 7 days ago.');
      }

      if (hrig) {
        regs.push({ name: 'Human rabies immunoglobulin (HRIG)', tag: hrig.group, noOr: true, items: [
          hrig.full
            ? I('HRIG', 'Up to 20 IU/kg. Infiltrate into and around the cleaned wound as far as anatomically possible; any remainder may be given IM (anterolateral thigh)', 'With the first vaccine dose')
            : I('HRIG', 'One vial, infiltrated into and around the cleaned wound only (not IM); total no more than 20 IU/kg', 'With the first vaccine dose')
        ] });
        notes.push('Calculate the HRIG dose from the potency on the vial, not the packaging (use the UKHSA form calculator). Never give HRIG and vaccine at the same site. HRIG is not given more than 7 days after the first vaccine dose or more than 1 day after the second.');
      } else if (c === 'red' && im === 1) {
        notes.push('HRIG is not needed for a previously vaccinated patient.');
      } else if (c === 'red' && im === 0 && cat === 1) {
        notes.push('HRIG is not given for category 2 exposures unless the patient is immunosuppressed: confirm with RIgS.');
      } else if (c === 'amber' && im === 0) {
        notes.push('HRIG is not needed for amber (category 2 or low-risk) exposures unless the patient is immunosuppressed.');
      }

      notes.push(N.wound, N.rigs, N.ooh, N.timing);
      if (animal === 1) notes.push(N.observe);
      notes.push(N.vacc, N.abroad);

      return {
        title: (c === 'red' ? 'Red' : 'Amber') + ': ' + (hrig ? 'vaccine and HRIG' : 'vaccine'),
        tone: c,
        summary: catLabel + ' exposure · ' + a.start.label + (risk === 'confirmed' ? '' : ' · ' + risk.charAt(0).toUpperCase() + risk.slice(1) + ' risk') + '.',
        regimens: regs,
        notes: notes
      };
    }
  };

  window.GUIDES.rabies = {
    Q: Q, R: R, eyebrow: 'Composite risk',
    ref: 'From UKHSA guidelines on managing rabies post-exposure (2023), the risk assessment summary (updated June 2025), and the interim HRIG recommendations (June 2025). England only; RIgS makes the final assessment.'
  };
})();
