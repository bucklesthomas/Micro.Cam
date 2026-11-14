/*
 * Post-exposure prophylaxis for contacts of infectious diseases (UK).
 * Meningococcal: UKHSA guidance for public health management of meningococcal disease (December 2025).
 * iGAS: UKHSA UK guidelines for the management of contacts of invasive group A streptococcus (v2.0, March 2023).
 * Varicella: UKHSA guidelines on post-exposure prophylaxis for varicella or shingles (v9.0, March 2026).
 * Measles: UKHSA national measles guidelines (version 8, July 2026).
 * Pertussis: UKHSA national pertussis guidance (issue 1.0, May 2026).
 * Hepatitis A: UKHSA public health control and management of hepatitis A (February 2024).
 * Hib: UKHSA revised recommendations for the prevention of secondary Hib disease (2013).
 * Always involve the local health protection team, who lead contact tracing.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }
  var HPT = 'The local health protection team leads contact tracing and supplies vaccine or immunoglobulin where needed: call them.';

  var Q = {
    start: {
      q: 'Which infection is the index case?',
      options: [
        { label: 'Meningococcal disease', next: 'R_men' },
        { label: 'Invasive group A streptococcus (iGAS)', next: 'igas' },
        { label: 'Chickenpox or shingles', next: 'vzv' },
        { label: 'Measles', next: 'mea' },
        { label: 'Pertussis (whooping cough)', next: 'pert' },
        { label: 'Hepatitis A', next: 'hav' },
        { label: 'Haemophilus influenzae type b (Hib)', next: 'R_hib' }
      ]
    },
    igas: {
      q: 'Is the close contact in a high-risk group?',
      help: 'Close contact: prolonged household-type contact in the 7 days before diagnosis (e.g. staying overnight, sexual partner, shared dormitory or kitchen). High risk: age 75 or over, pregnant from 37 weeks, within 28 days of giving birth, neonate under 28 days, or chickenpox with active lesions.',
      options: [
        { label: 'Yes, high-risk contact', next: 'R_igasPx' },
        { label: 'Two or more iGAS cases in the household', sub: 'Confirmed or probable', next: 'R_igasHH' },
        { label: 'No, other close contact', next: 'R_igasWatch' }
      ]
    },
    vzv: {
      q: 'Who is the contact?',
      help: 'Significant exposure: chickenpox, disseminated or exposed shingles (or localised shingles in an immunosuppressed case), with continuous contact (e.g. household) or face-to-face contact or 15 minutes in a small room during the infectious period.',
      options: [
        { label: 'Immunosuppressed', next: 'R_vzvImm' },
        { label: 'Pregnant', next: 'R_vzvPreg' },
        { label: 'Neonate whose mother developed chickenpox', sub: 'From 7 days before to 7 days after delivery', next: 'R_vzvNeo' },
        { label: 'Other infant at risk', sub: 'Premature (< 28 weeks or < 1 kg) in hospital since birth, or exposed in the first 7 days of life', next: 'R_vzvInf' },
        { label: 'Healthy, not pregnant', next: 'R_vzvWell' }
      ]
    },
    mea: {
      q: 'Who is the contact?',
      help: 'Close contact during the infectious period (4 days before to 4 days after rash onset): household, face-to-face contact of any length, or more than 15 minutes in a small room. Any contact counts for immunosuppressed people.',
      options: [
        { label: 'Infant under 6 months', next: 'R_meaInf' },
        { label: 'Infant 6–8 months', next: 'R_meaInf2' },
        { label: 'Aged 9 months or over, healthy, not immune', next: 'R_meaMMR' },
        { label: 'Pregnant', next: 'R_meaPreg' },
        { label: 'Immunosuppressed', next: 'R_meaImm' },
        { label: 'Healthcare worker', next: 'R_meaHCW' }
      ]
    },
    pert: {
      q: 'Is any close contact in a priority group?',
      help: 'Close contact: household, or overnight in the same room, while the case was infectious (cough onset to 48 hours of antibiotics, or 21 days if untreated). Priority group 1: infants under 1 year who are not fully protected (see the UKHSA definitions). Group 2: pregnant from 32 weeks, healthcare or childcare workers caring for group 1 infants or pregnant women, or a household member of a group 1 infant, who have not had a pertussis vaccine in the past 5 years.',
      options: [
        { label: 'Yes', next: 'R_pertPx' },
        { label: 'No', next: 'R_pertNo' }
      ]
    },
    hav: {
      q: 'Which contact, and how long since exposure?',
      help: 'Close contact: household, sexual, nappy-changing or toileting, or shared injecting equipment, during the infectious period (2 weeks before symptoms to 1 week after jaundice). Not immune means no full vaccine course in 10 years, no dose in the last 12 months and no past infection.',
      options: [
        { label: 'Within 14 days: healthy, aged 1–59', next: 'R_havVac' },
        { label: 'Within 14 days: aged 60 or over', next: 'R_havHnig' },
        { label: 'Within 14 days: chronic liver disease, hepatitis B or C, immunosuppressed, or HIV with CD4 < 200', next: 'R_havHnig' },
        { label: 'Infant under 12 months', next: 'R_havInf' },
        { label: 'More than 14 days since exposure', next: 'R_havLate' }
      ]
    }
  };

  var R = {
    R_men: {
      title: 'Contacts of meningococcal disease', tone: 'amber',
      summary: 'Give a single dose of ciprofloxacin to close contacts, ideally within 24 hours of diagnosis (up to 28 days after onset).',
      regimens: [
        { name: 'First choice: single dose', noOr: true, items: [I('Ciprofloxacin', 'Age 12 or over: 500 mg; 5–11 years: 250 mg; 1–4 years: 125 mg; under 1 year: 30 mg/kg (max 125 mg)')] },
        { name: 'Alternatives', items: [I('Rifampicin', 'Twice daily for 2 days: 600 mg (12 or over); 10 mg/kg, max 600 mg (1–11 years); 5 mg/kg (under 1)'), I('or Ceftriaxone IM', 'Single dose: 250 mg (12 or over); 125 mg (under 12)'), I('or Azithromycin', '500 mg once daily for 3 days (adults or > 45 kg); 10 mg/kg (children)')] }
      ],
      notes: [
        'Close contacts: prolonged close contact in the 7 days before onset (household, shared dormitory, sexual partners, students sharing a kitchen).',
        'Not close contacts: classmates, colleagues, friends, social kissing, sharing drinks, or travel companions without intense exposure.',
        'Healthcare workers only if their mouth or nose was directly exposed to the patient’s respiratory droplets or secretions (e.g. airway management without a mask) before 24 hours of antibiotics.',
        'Pregnancy: ciprofloxacin, ceftriaxone or azithromycin can be used. Use rifampicin if ciprofloxacin resistance is likely (e.g. recent travel to the Middle East or Asia).',
        'Vaccine: offer MenACWY to close contacts for serogroups A, C, W or Y (unless vaccinated against it in the last 12 months). MenB vaccine is not given after a single B case.',
        'Index case: ceftriaxone or cefotaxime clears carriage; otherwise give ciprofloxacin before discharge.',
        HPT
      ]
    },
    R_igasPx: {
      title: 'High-risk contact of iGAS: give prophylaxis', tone: 'amber',
      summary: 'Offer antibiotics within 24 hours (same day if possible), and no later than 10 days after the index case’s diagnosis.',
      regimens: [
        { name: 'First line', items: [I('Phenoxymethylpenicillin', 'BNF dose', '10 days')] },
        { name: 'Penicillin allergy', items: [I('Azithromycin', 'Non-pregnant adults and children 6 months or older (BNF dose)', '5 days'), I('or Clarithromycin', 'Including infants under 6 months', '10 days'), I('or Erythromycin', 'Pregnant or within 28 days of birth', '10 days')] }
      ],
      notes: ['No screening swabs needed before prophylaxis. Consider ear, nose and umbilical swabs in babies of mothers with iGAS.', 'Warn-and-inform letter, and 30-day surveillance for symptoms.', 'Neonates are offered prophylaxis up to 28 days after birth if the mother or another close contact has iGAS.', HPT]
    },
    R_igasHH: {
      title: 'Household cluster of iGAS', tone: 'red',
      summary: 'Offer antibiotic prophylaxis to the whole household, within 10 days of the index diagnosis.',
      regimens: [{ items: [I('Phenoxymethylpenicillin', 'BNF dose', '10 days')] }, { name: 'Penicillin allergy', items: [I('Azithromycin', 'BNF dose', '5 days'), I('or Clarithromycin', 'BNF dose', '10 days')] }],
      notes: [HPT]
    },
    R_igasWatch: {
      title: 'Other close contact of iGAS', tone: 'green',
      summary: 'No prophylaxis. Give warn-and-inform advice and watch for symptoms for 30 days.',
      regimens: [],
      notes: ['Symptoms of invasive disease (high fever, severe muscle pain, localised tenderness): urgent medical review.', 'Sore throat or minor skin infection: see the GP for assessment and treatment.', 'Classmates and colleagues are not normally close contacts.', HPT]
    },
    R_vzvImm: {
      title: 'Immunosuppressed contact of chickenpox or shingles', tone: 'amber',
      summary: 'Test VZV IgG urgently (history is unreliable). Give antiviral PEP if IgG < 150 mIU/ml (or negative or equivocal).',
      regimens: [{ name: 'Start on day 7 after exposure (up to day 14)', items: [I('Aciclovir', '800 mg orally 4 times daily', '7 days'), I('or Valaciclovir', '1 g orally 3 times daily', '7 days')] }],
      notes: ['Day 0 is the rash onset date for household contacts, or the first contact date for other exposures.', 'If antivirals cannot be taken: IVIG 0.2 g/kg, ideally within 7 days and no later than 10 days.', 'Reduce the dose if eGFR < 10. Repeat exposure in the first 7 days of treatment: extend to 14 days after the first exposure.', HPT]
    },
    R_vzvPreg: {
      title: 'Pregnant contact of chickenpox or shingles', tone: 'amber',
      summary: 'No PEP if there is a history of chickenpox, shingles or two vaccine doses. Otherwise test VZV IgG and give antivirals if < 100 mIU/ml.',
      regimens: [{ name: 'Start on day 7 after exposure (up to day 14), any stage of pregnancy', items: [I('Aciclovir', '800 mg orally 4 times daily', '7 days'), I('or Valaciclovir', '1 g orally 3 times daily', '7 days')] }],
      notes: ['Immunoglobulin only if antivirals cannot be taken (e.g. malabsorption).', 'Advise to seek help urgently if a rash appears: chickenpox in pregnancy needs prompt treatment.', HPT]
    },
    R_vzvNeo: {
      title: 'Neonate whose mother developed chickenpox around delivery', tone: 'red',
      summary: 'IV aciclovir plus varicella immunoglobulin.',
      regimens: [{ noOr: true, items: [I('Aciclovir', '20 mg/kg IV every 8 hours for at least 48 hours, then oral option', 'Until day 21 after delivery'), I('plus Varitect CP (IV varicella immunoglobulin)', '25–50 IU/kg (max 5 ml) slow IV, preferably within 96 hours (no later than 10 days)')] }],
      notes: ['Varitect CP comes from the UKHSA Rabies and Immunoglobulin Service; if not available within 96 hours, give IVIG.', 'Intramuscular VZIG has been withdrawn (2024).', HPT]
    },
    R_vzvInf: {
      title: 'Other infant at risk after varicella exposure', tone: 'amber',
      regimens: [{ name: 'From day 7 after exposure', items: [I('Aciclovir', '10 mg/kg orally 4 times daily (neonates 20 mg/kg)', '14 days')] }],
      notes: ['Test VZV IgG (cut-off 150 mIU/ml) where the mother’s immunity is uncertain.', HPT]
    },
    R_vzvWell: {
      title: 'Healthy, non-pregnant contact', tone: 'green',
      summary: 'PEP is not needed.',
      regimens: [],
      notes: ['Non-immune healthcare workers: varicella vaccine can be offered post-exposure; exclude from contact with high-risk patients from day 8 to day 21 after exposure (occupational health).', 'Contacts of non-exposed shingles in an immunocompetent case do not need PEP.']
    },
    R_meaInf: {
      title: 'Infant under 6 months exposed to measles', tone: 'amber',
      regimens: [{ items: [I('Human normal immunoglobulin (HNIG)', '100 mg/kg IM (max 1000 mg)', 'Ideally within 72 hours, up to 6 days')] }],
      notes: ['Given regardless of the mother’s antibody status.', 'Household contacts: the window counts from the index rash onset; other contacts from the last exposure.', HPT]
    },
    R_meaInf2: {
      title: 'Infant 6–8 months exposed to measles', tone: 'amber',
      regimens: [{ name: 'Household exposure', items: [I('HNIG', '100 mg/kg IM (max 1000 mg)', 'Within 6 days')] }, { name: 'Exposure outside the household', items: [I('MMR vaccine', 'Ideally within 72 hours', 'Does not count towards the routine schedule')] }],
      notes: [HPT]
    },
    R_meaMMR: {
      title: 'Healthy contact aged 9 months or over, not immune', tone: 'green',
      regimens: [{ items: [I('MMR (or MMRV) vaccine', 'Ideally within 72 hours of exposure', '')] }],
      notes: ['Vaccine 3–6 days after exposure adds little protection but should still be given for future protection.', HPT]
    },
    R_meaPreg: {
      title: 'Pregnant contact of measles', tone: 'amber',
      summary: 'Test measles IgG urgently unless born before 1990 with a reliable history of measles. Give HNIG if negative (or if testing is not possible within 6 days and unvaccinated).',
      regimens: [{ items: [I('HNIG', 'About 3000 mg IM', 'Within 6 days')] }],
      notes: ['MMR is contraindicated in pregnancy.', 'Neonates of mothers with a measles rash from 6 days before to 6 days after delivery: consider HNIG.', HPT]
    },
    R_meaImm: {
      title: 'Immunosuppressed contact of measles', tone: 'red',
      summary: 'Assess urgently: IVIG is given according to the immunosuppression group and antibody result.',
      regimens: [{ items: [I('IVIG', '0.4 g/kg IV (from hospital pharmacy)', 'Ideally within 72 hours, up to 6 days')] }],
      notes: ['Severely immunosuppressed (group B(ii)) receive IVIG without testing; others are tested first (UKHSA tables 3a and 3b).', HPT]
    },
    R_meaHCW: {
      title: 'Healthcare worker exposed to measles', tone: 'amber',
      summary: 'Without evidence of protection, exclude from day 5 after first exposure to day 21 after the last exposure.',
      regimens: [{ items: [I('MMR vaccine', 'Preferred post-exposure; can return once symptom-free for 14 days', '')] }],
      notes: ['A positive rapid IgG within 7 days of exposure allows return to work.', 'Protected staff keep working but report fever or prodromal symptoms between day 7 and day 21.', 'Contact occupational health.']
    },
    R_pertPx: {
      title: 'Pertussis: chemoprophylaxis for all close contacts', tone: 'amber',
      summary: 'Offer a macrolide to all close contacts within 21 days of last exposure, because at least one is in a priority group.',
      regimens: [
        { name: 'Children over 1 month and adults', items: [I('Azithromycin', 'Adults 500 mg once daily (children 10 mg/kg)', '3 days'), I('or Clarithromycin', 'Adults 500 mg twice daily (children by weight)', '7 days')] },
        { name: 'Infants under 1 month', items: [I('Clarithromycin', '7.5 mg/kg twice daily', '7 days')] },
        { name: 'Pregnancy', items: [I('Erythromycin', '500 mg 4 times daily', '7 days')] }
      ],
      notes: ['Macrolide intolerance: co-trimoxazole (not under 6 weeks; avoid in pregnancy).', 'Vaccinate: pregnant contacts from 16 weeks if not vaccinated this pregnancy; boosters for eligible contacts and healthcare workers (no pertussis vaccine in 5 years).', 'Exclude cases for 48 hours after starting antibiotics (21 days from cough onset if untreated). Asymptomatic contacts are not excluded.', 'Doses are the same for treatment and prophylaxis. Children: weight-banded doses in the BNF for Children.', HPT]
    },
    R_pertNo: {
      title: 'Pertussis: no priority contacts', tone: 'green',
      summary: 'Chemoprophylaxis is not needed.',
      regimens: [],
      notes: ['Make sure contacts are up to date with vaccines.', 'Exclude the case for 48 hours after starting antibiotics.', HPT]
    },
    R_havVac: {
      title: 'Hepatitis A contact: vaccine', tone: 'green',
      regimens: [{ items: [I('Hepatitis A vaccine', 'Single dose now, second dose 6–12 months later', '')] }],
      notes: ['Primed contacts (any previous vaccine dose) need vaccine only.', 'Food handlers: offer vaccine and reinforce hygiene.', 'Exclude the case for 7 days after jaundice onset.', HPT]
    },
    R_havHnig: {
      title: 'Hepatitis A contact at higher risk: vaccine plus HNIG', tone: 'amber',
      regimens: [{ noOr: true, items: [I('Hepatitis A vaccine', 'Single dose now', ''), I('plus HNIG', 'If fully susceptible, within 14 days of last exposure', '')] }],
      notes: ['Do not give HNIG more than 7 days after the first vaccine dose, or to primed or immune contacts.', 'Second vaccine dose after 6 months for high-risk contacts.', HPT]
    },
    R_havInf: {
      title: 'Infant under 12 months exposed to hepatitis A', tone: 'green',
      regimens: [],
      notes: ['No PEP needed if all their nappy changers are immunised.', 'Infants from 2 months who attend childcare: offer vaccine (unlicensed at this age). HNIG is not recommended.', HPT]
    },
    R_havLate: {
      title: 'Hepatitis A contact seen after 14 days', tone: 'amber',
      regimens: [],
      notes: ['Household: offer vaccine if seen within 8 weeks of the index case’s jaundice onset and there is more than one close contact.', 'Chronic liver disease or hepatitis B or C, seen within 28 days: consider HNIG plus vaccine.', 'Food handlers: risk assessment with environmental health; restrict handling of unwrapped ready-to-eat food until 30 days after exposure unless immune.', HPT]
    },
    R_hib: {
      title: 'Contacts of invasive Hib disease', tone: 'amber',
      summary: 'Rifampicin for the whole household if it includes a vulnerable person (child under 10 years, or anyone immunosuppressed or asplenic).',
      regimens: [{ items: [I('Rifampicin', '20 mg/kg (max 600 mg) once daily; infants under 3 months 10 mg/kg once daily', '4 days')] }],
      notes: ['Vaccinate unimmunised or partially immunised household children under 10.', 'Index case under 10: rifampicin before discharge (unless treated with ceftriaxone or cefotaxime) and vaccination as appropriate.', 'Give within 4 weeks of illness onset.', HPT]
    }
  };

  window.GUIDES.contacts = {
    Q: Q, R: R, eyebrow: 'Suggested action',
    ref: 'From current UKHSA guidance for meningococcal disease (2025), iGAS (2023), varicella (2026), measles (2026), pertussis (2026), hepatitis A (2024) and Hib (2013). Always discuss with the local health protection team.'
  };
})();
