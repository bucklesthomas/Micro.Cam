/*
 * Positive blood culture triage: is it real, and what next?
 * Based on UK SMI B37 (Investigation of blood cultures), IDSA catheter-related bloodstream infection guideline (Mermel LA et al. 2009),
 * ESC 2023 endocarditis guideline (typical organisms, echocardiography), and the 2023 Duke-ISCVID criteria.
 */
(function () {
  window.GUIDES = window.GUIDES || {};
  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur || '' }; }
  var REPEAT = 'If unsure, take 2 further sets from separate venepunctures before giving antibiotics (if the patient is stable).';
  var TTP = 'Time to positivity helps: true bacteraemia usually flags within 24 hours; a skin organism flagging after 48 hours in one set is more likely contamination.';
  var DTP = 'Line infection: if the line set flags at least 2 hours before the peripheral set (same organism), the line is the likely source.';

  var Q = {
    start: {
      q: 'What does the Gram stain show?',
      options: [
        { label: 'Gram-positive cocci in clusters', sub: 'Staphylococci', next: 'clus' },
        { label: 'Gram-positive cocci in chains or pairs', sub: 'Streptococci, enterococci', next: 'chain' },
        { label: 'Gram-positive rods', next: 'gpr' },
        { label: 'Gram-negative rods', next: 'R_gnr' },
        { label: 'Gram-negative cocci', next: 'R_gnc' },
        { label: 'Yeast', next: 'R_yeast' },
        { label: 'Mixed organisms', next: 'R_mixed' }
      ]
    },
    clus: {
      q: 'What has it been identified as?',
      options: [
        { label: 'Staphylococcus aureus', sub: 'Or S. lugdunensis', next: 'R_sab' },
        { label: 'Coagulase-negative staphylococcus', sub: 'Or not yet identified, coagulase negative', next: 'cons' },
        { label: 'Not identified yet', next: 'R_clusPend' }
      ]
    },
    cons: {
      q: 'How many sets, and any prosthetic material?',
      help: 'Prosthetic material includes intravascular lines, prosthetic valves, pacemakers and other devices, vascular grafts and joint replacements.',
      options: [
        { label: 'Only 1 of 2 or more sets positive, no prosthetic material', next: 'R_consCont' },
        { label: 'Only 1 set was taken', next: 'R_consOne' },
        { label: '2 or more sets with the same organism', next: 'R_consReal' },
        { label: 'Line, prosthetic valve, device or neutropenia', next: 'R_consProst' }
      ]
    },
    chain: {
      q: 'What has it been identified as?',
      options: [
        { label: 'Streptococcus pneumoniae', next: 'R_pnc' },
        { label: 'β-haemolytic streptococcus (group A, B, C or G)', next: 'R_bhs' },
        { label: 'Viridans group streptococcus', sub: 'e.g. S. mitis, oralis, sanguinis', next: 'R_vgs' },
        { label: 'Streptococcus anginosus group', next: 'R_ang' },
        { label: 'Streptococcus gallolyticus (bovis)', next: 'R_bov' },
        { label: 'Enterococcus', next: 'R_ent' },
        { label: 'Not identified yet', next: 'R_chainPend' }
      ]
    },
    gpr: {
      q: 'What has it been identified as?',
      options: [
        { label: 'Corynebacterium', sub: 'Diphtheroids', next: 'R_coryne' },
        { label: 'Bacillus (not anthracis)', next: 'R_bacil' },
        { label: 'Cutibacterium (Propionibacterium)', next: 'R_cuti' },
        { label: 'Listeria monocytogenes', next: 'R_lis' },
        { label: 'Clostridium', next: 'R_clos' },
        { label: 'Not identified yet', next: 'R_gprPend' }
      ]
    }
  };

  var R = {
    R_sab: {
      title: 'Staphylococcus aureus bacteraemia', tone: 'red',
      summary: 'Never a contaminant. Treat, find the source, and follow the S. aureus bacteraemia bundle.',
      regimens: [{ name: 'MSSA', items: [I('Flucloxacillin', '2 g IV every 6 hours (every 4 hours for endocarditis)'), I('or Cefazolin', '2 g IV every 8 hours')] }, { name: 'MRSA or severe penicillin allergy', items: [I('Vancomycin', 'Loading dose 25–30 mg/kg, then by levels'), I('or Daptomycin', '8–10 mg/kg IV once daily (specialist)')] }],
      notes: ['Repeat blood cultures every 24–48 hours until negative.', 'Echocardiography for all (TTE; TOE if high risk: device or prosthetic valve, persistent bacteraemia, community onset without a clear source, embolic signs).', 'Remove infected lines; look for deep foci (spine, joints, abscess) and image if symptoms or persistent bacteraemia.', 'Infection specialist review (reduces mortality).', 'Duration: at least 14 days IV from the first negative culture if uncomplicated; 4–6 weeks if complicated (endocarditis, deep focus, persistent bacteraemia > 72 hours, prosthetic material). Selected patients can complete treatment orally after a period of IV therapy with specialist input.', 'S. lugdunensis behaves like S. aureus: treat the same way.']
    },
    R_clusPend: {
      title: 'Gram-positive cocci in clusters, identification pending', tone: 'amber',
      summary: 'Assume S. aureus until shown otherwise if the patient is unwell, has a line or device, or several sets are positive.',
      regimens: [{ name: 'If treating', items: [I('Vancomycin', 'Loading dose 25–30 mg/kg, then by levels', 'Narrow to flucloxacillin or cefazolin if MSSA')] }],
      notes: ['Rapid identification (MALDI-TOF) and PCR for mecA are often available the same day: call the laboratory.', TTP, REPEAT]
    },
    R_consCont: {
      title: 'Likely contaminant: CoNS in 1 of 2 or more sets', tone: 'green',
      summary: 'No antibiotics needed if there is no prosthetic material and the patient is well.',
      regimens: [],
      notes: ['Stop any antibiotics started only for this result.', 'Contamination rates above 3% suggest a problem with collection technique: feed back to the team.', TTP]
    },
    R_consOne: {
      title: 'CoNS in a single set (only 1 set taken)', tone: 'amber',
      summary: 'Cannot be interpreted from one set.',
      regimens: [],
      notes: [REPEAT, 'Always take at least 2 sets (from separate sites or times) before starting antibiotics, to avoid this situation.', TTP]
    },
    R_consReal: {
      title: 'CoNS in 2 or more sets', tone: 'amber',
      summary: 'Likely true bacteraemia, especially with a line or device.',
      regimens: [{ items: [I('Vancomycin or teicoplanin', 'By susceptibility; many are methicillin resistant')] }],
      notes: ['Look for the source: line, device, prosthetic valve, graft.', 'Line-related CoNS: remove the line and treat for 5–7 days; if the line is kept, 10–14 days with an antibiotic lock (IDSA).', DTP, 'Echo if prosthetic valve or device, or persistent bacteraemia.']
    },
    R_consProst: {
      title: 'CoNS with a line, prosthetic valve, device or neutropenia', tone: 'amber',
      summary: 'May be significant even in one set: correlate with symptoms and take repeat cultures.',
      regimens: [{ name: 'If treating', items: [I('Vancomycin or teicoplanin', 'By susceptibility')] }],
      notes: ['Prosthetic valve or cardiac device: CoNS is a typical endocarditis organism (Duke-ISCVID); take 3 sets and arrange echo.', DTP, REPEAT]
    },
    R_pnc: {
      title: 'Streptococcus pneumoniae bacteraemia', tone: 'amber',
      summary: 'Always significant.',
      regimens: [{ items: [I('Benzylpenicillin', '1.2–2.4 g IV every 4 hours, if susceptible'), I('or Ceftriaxone', '2 g IV once daily')] }],
      notes: ['Look for pneumonia, meningitis (LP if any neurological features), endocarditis or septic arthritis.', 'Test for HIV; consider hyposplenism, myeloma or immunoglobulin deficiency.', 'Usually 7–10 days if pneumonia with good response.']
    },
    R_bhs: {
      title: 'β-haemolytic streptococcal bacteraemia', tone: 'red',
      summary: 'Always significant. Group A (S. pyogenes) is invasive group A strep: notify.',
      regimens: [{ items: [I('Benzylpenicillin', '2.4 g IV every 4 hours')] }, { name: 'Necrotising infection or toxic shock: add', noOr: true, items: [I('Clindamycin', '1.2 g IV every 6 hours (toxin suppression)'), I('and consider IVIG', 'Specialist advice')] }],
      notes: ['Look for skin and soft tissue infection, necrotising fasciitis (LRINEC on the Scores page), septic arthritis.', 'Group A: notify the health protection team; high-risk household contacts need prophylaxis (see contact prophylaxis guide).', 'Group B in adults: look for endocarditis, diabetes, malignancy; group B in pregnancy or postpartum needs obstetric input.']
    },
    R_vgs: {
      title: 'Viridans group streptococcus', tone: 'amber',
      summary: 'Can be a contaminant in a single set, but is a typical endocarditis organism.',
      regimens: [{ name: 'If significant', items: [I('Benzylpenicillin or ceftriaxone', 'By susceptibility')] }],
      notes: ['Single set, no endocarditis risk, well: possibly contaminant; repeat cultures.', '2 or more sets, or any predisposing heart condition: echo and work up for endocarditis (see the endocarditis guide).', 'Neutropenia with mucositis: viridans streptococci cause severe sepsis.']
    },
    R_ang: {
      title: 'Streptococcus anginosus group', tone: 'amber',
      summary: 'Always significant: look for an abscess.',
      regimens: [{ items: [I('Benzylpenicillin or ceftriaxone', 'By susceptibility, plus source control')] }],
      notes: ['Image for liver, brain, lung, dental or intra-abdominal abscess.']
    },
    R_bov: {
      title: 'Streptococcus gallolyticus (bovis) bacteraemia', tone: 'amber',
      summary: 'Strongly associated with endocarditis and colorectal neoplasia.',
      regimens: [{ items: [I('Benzylpenicillin or ceftriaxone', 'By susceptibility')] }],
      notes: ['Echocardiography for all.', 'Colonoscopy.']
    },
    R_ent: {
      title: 'Enterococcal bacteraemia', tone: 'amber',
      regimens: [{ name: 'E. faecalis, amoxicillin susceptible', items: [I('Amoxicillin', '2 g IV every 4–6 hours')] }, { name: 'E. faecium or amoxicillin resistant', items: [I('Vancomycin or teicoplanin', 'If susceptible')] }, { name: 'VRE', items: [I('Linezolid or daptomycin', 'Specialist advice')] }],
      notes: ['Look for the source: urinary tract, biliary, line, abdomen.', 'E. faecalis is a typical endocarditis organism: echo if no clear source, several positive sets, or valve disease (the DENOVA score helps).', 'Cephalosporins are not active against enterococci.']
    },
    R_chainPend: {
      title: 'Gram-positive cocci in chains, identification pending', tone: 'amber',
      regimens: [{ name: 'If septic', items: [I('Amoxicillin plus ceftriaxone, or as per source', 'Covers streptococci and E. faecalis; add vancomycin if E. faecium or MRSA risk')] }],
      notes: ['Most streptococci in blood are significant; a single viridans streptococcus may be a contaminant.', TTP]
    },
    R_coryne: {
      title: 'Corynebacterium (diphtheroids)', tone: 'green',
      summary: 'Usually a skin contaminant in a single set.',
      regimens: [{ name: 'If significant', items: [I('Vancomycin', 'Most C. striatum and C. jeikeium are multi-resistant')] }],
      notes: ['Significant if in 2 or more sets, or with a line, prosthetic valve, device or neutropenia. C. striatum and C. jeikeium are typical endocarditis organisms with prosthetic material.', 'C. diphtheriae or C. ulcerans: discuss urgently (toxin testing, public health).', REPEAT]
    },
    R_bacil: {
      title: 'Bacillus species (not B. anthracis)', tone: 'green',
      summary: 'Usually a contaminant in a single set.',
      regimens: [{ name: 'If significant', items: [I('Vancomycin', 'B. cereus produces β-lactamases')] }],
      notes: ['Significant if repeated, or with a line, injecting drug use or neutropenia.', 'Bacillus anthracis (non-motile, non-haemolytic, from someone who injects drugs or with animal exposure): inform the laboratory and health protection urgently.']
    },
    R_cuti: {
      title: 'Cutibacterium (Propionibacterium) acnes', tone: 'green',
      summary: 'Almost always a contaminant (slow-growing, often flags after 3–5 days).',
      regimens: [],
      notes: ['Significant with a prosthetic valve, device, shunt or spinal hardware, or repeated isolation: discuss with microbiology.']
    },
    R_lis: {
      title: 'Listeria monocytogenes bacteraemia', tone: 'red',
      summary: 'Always significant. Look for CNS infection.',
      regimens: [{ noOr: true, items: [I('Amoxicillin', '2 g IV every 4 hours'), I('plus Gentamicin', '5 mg/kg once daily (first 7 days, if CNS involved)')] }, { name: 'Penicillin allergy', items: [I('Co-trimoxazole', 'High dose, IV')] }],
      notes: ['Cephalosporins are inactive.', 'LP or MRI if any neurological features; pregnancy needs obstetric input.', 'Duration: at least 14 days for bacteraemia, 21 days for meningitis.']
    },
    R_clos: {
      title: 'Clostridium bacteraemia', tone: 'amber',
      summary: 'Usually significant: look for a gut, biliary or soft tissue source.',
      regimens: [{ items: [I('Benzylpenicillin plus metronidazole, or co-amoxiclav', 'Plus surgical source control')] }],
      notes: ['C. septicum is strongly associated with colorectal and haematological malignancy: colonoscopy.', 'C. perfringens can cause gas gangrene and massive haemolysis: urgent surgical review.']
    },
    R_gprPend: {
      title: 'Gram-positive rods, identification pending', tone: 'amber',
      regimens: [],
      notes: ['Consider Listeria if pregnant, elderly or immunocompromised: give amoxicillin until identified.', 'Diphtheroids or Bacillus in one set are often contaminants.', TTP]
    },
    R_gnr: {
      title: 'Gram-negative rods in blood', tone: 'red',
      summary: 'Always treat as significant. See the Gram-negative bacteraemia guide for empirical and targeted treatment.',
      regimens: [],
      notes: ['Check previous microbiology for ESBL, AmpC or carbapenemase producers.', 'Source: urinary, biliary, intra-abdominal, line, respiratory.', 'Pseudomonas, Acinetobacter or Stenotrophomonas with a line: remove it.']
    },
    R_gnc: {
      title: 'Gram-negative cocci in blood', tone: 'red',
      summary: 'Probable Neisseria meningitidis: treat as meningococcal disease and notify.',
      regimens: [{ items: [I('Ceftriaxone', '2 g IV every 12 hours')] }],
      notes: ['Moraxella and other Neisseria species are rare causes.', 'See the meningitis guide, and the contact prophylaxis guide for contacts.']
    },
    R_yeast: {
      title: 'Yeast in blood culture', tone: 'red',
      summary: 'Never a contaminant. Treat as candidaemia (see the candidaemia guide).',
      regimens: [{ items: [I('An echinocandin', 'e.g. anidulafungin 200 mg IV, then 100 mg daily')] }],
      notes: ['Remove the central line, repeat blood cultures daily, arrange fundoscopy and echocardiography as indicated.', 'Cryptococcus in blood: do an LP and check serum CrAg (see the cryptococcal guide).']
    },
    R_mixed: {
      title: 'Mixed growth', tone: 'amber',
      summary: 'Several skin organisms suggest contamination; several gut organisms suggest an intra-abdominal source.',
      regimens: [],
      notes: ['Gut organisms (Gram-negatives, enterococci, anaerobes): look for perforation, abscess, ischaemic bowel or biliary sepsis.', 'Polymicrobial line infection is common in long-term lines.', REPEAT]
    }
  };

  window.GUIDES.bc = {
    Q: Q, R: R, eyebrow: 'Interpretation and next steps',
    ref: 'Based on UK SMI B37, the IDSA catheter-related bloodstream infection guideline and the ESC 2023 and Duke-ISCVID 2023 endocarditis criteria. Always discuss the result with the reporting microbiologist.'
  };
})();
