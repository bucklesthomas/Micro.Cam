/*
 * Exclusion and microbiological clearance for cases and contacts of gastrointestinal infections (England).
 * UKHSA public health operational guidelines for typhoid and paratyphoid (enteric fever) (2023, updated 2024);
 * UKHSA public health operational guidelines for STEC v3.1 (2023); PHE interim public health operational guidelines for shigellosis (2017);
 * PHE/UKHSA gastrointestinal infections: recommendations for public health management (2019); UKHSA hepatitis A guidance.
 * Risk groups A–D as defined in these documents.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(what, detail) { return { drug: what, dose: detail, dur: '' }; }

  var H48 = 'Until 48 hours symptom free (no diarrhoea or vomiting)';
  var GRP = ['risk group A (cannot maintain good hygiene)', 'risk group B (child aged 5 or under in childcare or school)', 'risk group C (food handler)', 'risk group D (clinical, social care or nursery staff)', 'not in a risk group'];
  var N = {
    hpt: 'The local health protection team (HPT) decides exclusion and clearance for notified cases, and usually arranges the samples. This summarises UKHSA guidance for England: Scotland, Wales and Northern Ireland have their own.',
    sym: 'A contact who develops diarrhoea or vomiting is managed as a probable case: exclude, and send a stool sample.',
    food: 'Food handlers must report diarrhoea or vomiting to their manager and should not handle food until 48 hours symptom free (Food Standards Agency fitness to work guidance).',
    hyg: 'Hygiene advice for everyone: handwashing with soap and water after the toilet and before food, no food preparation for others while unwell, separate towels, and cleaning of toilets and taps.',
    redeploy: 'Exclusion is from the risk activity only: redeployment to other duties is often possible while awaiting clearance.',
    inpt: 'Inpatients: see the isolation and precautions page for room and precautions.'
  };
  function exc(g) { return g === 1 ? 'From nursery, school or childcare until cleared' : 'From the risk activity (or redeploy) until cleared'; }
  function groupNote(g) {
    return [
      'Group A: assess hygiene facilities and capacity at home, work or residential care.',
      'Group B: children aged 5 or under (up to the sixth birthday) attending nursery, pre-school, childminders or school.',
      'Group C: anyone who prepares or serves unwrapped ready-to-eat food or drink, including informal or voluntary food handling.',
      'Group D: clinical, social care or nursery staff, or childminders, who care for young children, older or other vulnerable people.',
      ''
    ][g];
  }

  var Q = {
    start: {
      q: 'Which infection?',
      options: [
        { label: 'Typhoid or paratyphoid', sub: 'Enteric fever: S. Typhi or Paratyphi A, B or C', next: 'role' },
        { label: 'STEC', sub: 'Shiga toxin-producing E. coli, including O157 and HUS', next: 'role' },
        { label: 'Shigella', next: 'shig' },
        { label: 'Hepatitis A', next: 'role' },
        { label: 'Norovirus, rotavirus or other viral gastroenteritis', next: 'role' },
        { label: 'Salmonella (non-typhoidal), Campylobacter or other bacterial food poisoning', sub: 'Including Yersinia, non-cholera Vibrio, C. perfringens and Bacillus', next: 'role' },
        { label: 'Cryptosporidium or Giardia', next: 'role' },
        { label: 'Cholera', next: 'role' },
        { label: 'Amoebiasis', sub: 'Entamoeba histolytica', next: 'role' },
        { label: 'Diarrhoea and vomiting, cause not known', next: 'role' }
      ]
    },
    shig: {
      q: 'Which Shigella species?',
      help: 'The laboratory or reference unit reports the species. Treat an unspeciated isolate as non-sonnei until known.',
      options: [
        { label: 'S. sonnei', next: 'role' },
        { label: 'S. flexneri, S. boydii, S. dysenteriae (not type 1) or not speciated', next: 'role' },
        { label: 'S. dysenteriae type 1', next: 'role' }
      ]
    },
    role: {
      q: 'Is this person a case or a contact?',
      help: 'A contact who has symptoms counts as a probable case. Household contacts: anyone living or staying overnight in the same household, sharing a bathroom, or eating food prepared by the case while unwell.',
      options: [
        { label: 'Case', sub: 'Confirmed or probable, or a contact with symptoms', next: 'grp' },
        { label: 'Contact without symptoms', sub: 'Household, close or sexual contact, or co-traveller', next: 'grp' }
      ]
    },
    grp: {
      q: 'Are they in a risk group?',
      help: 'Risk groups are people more likely to spread gastrointestinal infection, or whose work brings them into contact with people at risk of serious illness.',
      options: [
        { label: 'Group A', sub: 'Cannot maintain good personal hygiene (capacity, or no access to facilities)', next: 'R_out' },
        { label: 'Group B', sub: 'Child aged 5 or under attending nursery, pre-school, a childminder or school', next: 'R_out' },
        { label: 'Group C', sub: 'Prepares or serves unwrapped ready-to-eat food or drink', next: 'R_out' },
        { label: 'Group D', sub: 'Clinical, social care or nursery staff caring for young, older or vulnerable people', next: 'R_out' },
        { label: 'None of these', next: 'R_out' }
      ]
    }
  };

  function res(title, tone, summary, rows, notes) {
    return { title: title, tone: tone, summary: summary, regimens: rows.length ? [{ name: 'What to do', noOr: true, items: rows }] : [], notes: notes.filter(Boolean) };
  }

  function typhoid(contact, g, risk) {
    if (!contact) {
      if (risk) return res('Enteric fever case in ' + GRP[g], 'red', 'Exclude from risk activities until microbiologically cleared.', [
        I('Exclusion', exc(g)),
        I('Clearance', '3 consecutive negative faecal samples, taken at least 48 hours apart, starting 1 week after finishing antibiotics'),
        I('If a sample is positive', 'Wait at least 1 week before the next sample (the 3 negatives must be consecutive)')
      ], [groupNote(g), 'Still excreting at 12 months: chronic carrier. The HPT does a risk assessment on safe working or redeployment, with strict hygiene.', N.redeploy, 'Screen co-travellers and household contacts: choose "Contact" for their management.', N.hpt]);
      return res('Enteric fever case, not in a risk group', 'amber', 'No clearance samples are needed.', [
        I('Exclusion', H48 + ' (work, school)'),
        I('Clearance', 'Not required')
      ], [N.hyg, 'Notifiable on clinical suspicion. Check co-travellers who are in risk groups (one stool sample each).', N.hpt]);
    }
    return res('Contact of enteric fever', 'amber', 'Well contacts are not excluded, whatever their risk group. Some need one screening stool sample.', [
      I('Exclusion', 'Not needed unless symptomatic'),
      I('Co-travellers in a risk group', 'One faecal sample as soon as possible; if positive, manage as a travel-related case'),
      I('Case not linked to travel', 'Screen household and close contacts, including those not in a risk group, to look for a carrier as the source')
    ], [risk ? groupNote(g) : '', 'Co-traveller: travelled closely with the case and was likely exposed to the same sources (not just the same flight, bus or tour group).', 'Contacts of a chronic carrier: no exclusion, even in risk groups. Typhoid vaccine is not recommended for contacts of carriers.', N.sym, N.hpt]);
  }

  function stec(contact, g, risk) {
    if (!contact) {
      if (risk) return res('STEC case in ' + GRP[g], 'red', 'Exclude until microbiologically cleared.', [
        I('Exclusion', exc(g)),
        I('Clearance', '2 consecutive negative faecal samples taken at least 24 hours apart, once symptom free for at least 48 hours (stx PCR or culture)')
      ], [groupNote(g), g === 1 ? 'Young children often shed STEC for weeks. Still positive at 4 weeks: HPT risk assessment. stx2a or stx2d strains stay excluded; others may be allowed a supervised return. Still positive at 3 months: further measures with the HPT.' : '', 'Persistently PCR positive after 4 weeks: the HPT may send a sample to the reference laboratory (GBRU).', 'Up to 1 in 10 cases develop HUS (most often children): check blood count, film and renal function if unwell. Do not give antibiotics or antimotility drugs.', N.redeploy, N.hpt]);
      return res('STEC case, not in a risk group', 'amber', 'No clearance samples are needed.', [
        I('Exclusion', H48),
        I('Clearance', 'Not required')
      ], [N.hyg, 'Watch for HUS (bloody diarrhoea, pallor, reduced urine): urgent bloods if unwell. Avoid antibiotics and antimotility drugs.', N.hpt]);
    }
    if (g === 1) return res('Child contact (risk group B) of STEC', 'red', 'Exclude from childcare and screen, even if well.', [
      I('Exclusion', 'Until screening is negative'),
      I('Screening (O157)', 'One PCR-negative faecal sample, or 2 culture-negative samples taken at least 24 hours apart'),
      I('Screening (non-O157)', 'PCR or culture, by local laboratory capability')
    ], [N.sym, N.hpt]);
    return res('Contact of STEC' + (risk ? ' in ' + GRP[g] : ''), 'green', 'Well contacts in groups A, C and D, and contacts outside the risk groups, are not routinely excluded or screened.', [
      I('Exclusion', 'Not routinely needed'),
      I('Clearance', 'Not routinely needed')
    ], [g === 0 ? 'Group A contacts who cannot maintain adequate hygiene need an individual risk assessment by the HPT.' : '', 'Household contacts of a case of HUS may be offered screening to help find the organism; they do not need exclusion while awaiting results.', N.hyg, N.sym, N.hpt]);
  }

  function shigella(contact, g, risk, sp) {
    var name = ['S. sonnei', 'Non-sonnei Shigella (S. flexneri, S. boydii, S. dysenteriae not type 1)', 'S. dysenteriae type 1'][sp];
    var sex = 'Adult men without recent travel: take a sexual history sensitively. Gay, bisexual and other men who have sex with men: refer to sexual health for HIV and STI screening and partner notification; avoid sex until at least 48 hours symptom free.';
    if (!contact) {
      if (sp === 0 || !risk) return res(name + ' case' + (risk ? ' in ' + GRP[g] : ', not in a risk group'), 'amber', 'No clearance samples are needed.', [
        I('Exclusion', H48),
        I('Clearance', 'Not required')
      ], [risk ? groupNote(g) : '', N.hyg, sex, N.hpt]);
      if (sp === 1) return res(name + ' case in ' + GRP[g], 'red', 'Exclude from risk activities until one negative stool culture.', [
        I('Exclusion', exc(g)),
        I('Clearance', '1 negative faecal sample, taken at least 48 hours after symptoms stop or 48 hours after finishing antibiotics, whichever is later')
      ], [groupNote(g), 'Not cleared after 2 samples: consider antibiotics (by susceptibility; resistance is common).', N.redeploy, sex, N.hpt]);
      return res(name + ' case in ' + GRP[g], 'red', 'Exclude from risk activities until two negative stool cultures.', [
        I('Exclusion', exc(g)),
        I('Clearance', '2 consecutive negative faecal samples at least 24 hours apart, starting at least 48 hours after symptoms stop or after finishing antibiotics, whichever is later')
      ], [groupNote(g), 'S. dysenteriae type 1 produces Shiga toxin and can cause HUS.', N.redeploy, N.hpt]);
    }
    if (sp === 2 && risk) return res('Contact of S. dysenteriae type 1 in ' + GRP[g], 'red', 'Exclude well contacts in risk groups until cleared.', [
      I('Exclusion', exc(g)),
      I('Clearance', '2 consecutive negative faecal samples at least 24 hours apart')
    ], [groupNote(g), N.sym, N.hpt]);
    return res('Contact of ' + (sp === 1 ? 'non-sonnei Shigella' : name), 'green', 'Well contacts are not excluded or screened.', [
      I('Exclusion', 'Not needed unless symptomatic'),
      I('Clearance', 'Not required')
    ], [sp === 1 && g === 2 ? 'Some local policies ask food handler contacts of non-sonnei Shigella for medical clearance before returning: check with your HPT.' : '', 'Give information on hygiene and symptoms.', N.sym, N.hpt]);
  }

  function hepA(contact, g) {
    if (!contact) return res('Hepatitis A case', 'amber', 'Exclude until 7 days after the onset of jaundice (or of symptoms if no jaundice). No clearance samples.', [
      I('Exclusion', 'Until 7 days after jaundice onset (or symptom onset if not jaundiced)'),
      I('Clearance', 'Not required')
    ], [g === 2 ? 'Food handler case: the HPT and environmental health assess the food business, and customers or colleagues may need vaccine.' : '', 'Household and close contacts need vaccine (and HNIG if at higher risk): see the contact prophylaxis guide.', N.hpt]);
    if (g === 2) return res('Food handler contact of hepatitis A', 'amber', 'Vaccinate. Exclude only if all of the criteria below apply.', [
      I('Exclude if all apply', 'Not immunised within 14 days of exposure; cannot avoid handling unwrapped ready-to-eat food until 30 days after exposure; and cannot maintain scrupulous hand hygiene'),
      I('Otherwise', 'Continue working, with hygiene advice and symptom watch')
    ], ['Vaccine, and HNIG for some: see the contact prophylaxis guide.', N.sym, N.hpt]);
    return res('Contact of hepatitis A', 'green', 'No exclusion. Offer post-exposure vaccine.', [
      I('Exclusion', 'Not needed unless symptomatic'),
      I('Prophylaxis', 'Hepatitis A vaccine within 14 days of exposure; HNIG as well for some (see the contact prophylaxis guide)')
    ], [g === 1 ? 'Childcare settings: the HPT may offer vaccine more widely if there are linked cases.' : '', N.sym, N.hpt]);
  }

  function simple(org, contact, g, risk) {
    var NAMES = { 4: 'Norovirus or other viral gastroenteritis', 5: 'Bacterial gastroenteritis or food poisoning', 6: 'Cryptosporidium or Giardia', 7: 'Cholera', 8: 'Amoebiasis', 9: 'Diarrhoea and vomiting' };
    var nm = NAMES[org];
    if (!contact) {
      var rows = [I('Exclusion', org === 7 ? 'Until 48 hours after the first normal stool' : H48), I('Clearance', org === 7 && g === 0 ? 'Usually not needed; one clearance sample may be needed if hygiene facilities are inadequate' : 'Not required')];
      var notes = [risk ? groupNote(g) : ''];
      if (org === 6) { rows.push(I('Swimming', 'No swimming pools for 2 weeks after symptoms stop')); notes.push('Cryptosporidium is resistant to chlorine: pool exclusion matters even after the diarrhoea stops.'); }
      if (org === 8) { rows[0] = I('Exclusion', H48 + '; asymptomatic cyst passers are not excluded'); notes.push('Treat with metronidazole followed by a luminal agent; repeat stool 1 week after treatment to confirm cure (not for exclusion).'); }
      if (org === 4 && (g === 3 || g === 4)) notes.push('Healthcare staff: stay off for 48 hours after the last symptom. Use soap and water, not alcohol gel.');
      if (org === 7) notes.push('Notifiable. Usually imported: check co-travellers.');
      if (g === 2) notes.push(N.food);
      notes.push(N.hyg, N.inpt, N.hpt);
      return res(nm + ': case' + (risk ? ' in ' + GRP[g] : ''), 'amber', org === 7 ? 'Exclude until 48 hours after the first normal stool.' : 'Exclude until 48 hours after symptoms stop. No clearance samples.', rows, notes);
    }
    var cn = ['Watch for symptoms.'];
    if (org === 4 && g === 2) cn.push('Food handlers living with a case should tell their manager and be excluded at the first sign of illness.');
    if (org === 6) cn.push('Test contacts who develop symptoms.');
    if (org === 7) cn.push('Test symptomatic household contacts and co-travellers.');
    if (org === 8) cn.push('Test household contacts, co-travellers and sexual contacts, even if well (cysts can be passed without symptoms).');
    return res(nm + ': contact', 'green', 'Well contacts are not excluded.', [I('Exclusion', 'Not needed unless symptomatic'), I('Clearance', 'Not required')], cn.concat([N.sym, N.hyg]));
  }

  function out(a) {
    var org = a.start ? a.start.i : 9, contact = a.role && a.role.i === 1, g = a.grp ? a.grp.i : 4, risk = g < 4;
    if (org === 0) return typhoid(contact, g, risk);
    if (org === 1) return stec(contact, g, risk);
    if (org === 2) return shigella(contact, g, risk, a.shig ? a.shig.i : 1);
    if (org === 3) return hepA(contact, g);
    return simple(org, contact, g, risk);
  }

  window.GUIDES.exclusion = {
    Q: Q, R: { R_out: out }, eyebrow: 'Exclusion and clearance',
    ref: 'From UKHSA operational guidelines for enteric fever (2023), STEC (v3.1, 2023) and shigellosis (2017), and the UKHSA recommendations for the public health management of gastrointestinal infections (2019). England only. The health protection team has the final say.'
  };
})();
