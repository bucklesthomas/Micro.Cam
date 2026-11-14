/*
 * C. difficile infection in adults — NICE NG199 (July 2021): antimicrobial prescribing.
 * Severity markers from PHE "Updated guidance on the management and treatment of C. difficile infection" (2013).
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var D = {
    vanc:   'Vancomycin 125 mg orally four times a day',
    vanc500:'Vancomycin up to 500 mg orally four times a day',
    vancLT: 'Vancomycin 500 mg orally four times a day',
    fidax:  'Fidaxomicin 200 mg orally twice a day',
    metro:  'Metronidazole 500 mg IV three times a day'
  };

  var N = {
    stop: 'Stop other antibiotics unless essential. If still needed, switch to one with a lower risk of C. difficile.',
    meds: 'Review proton pump inhibitors, laxatives and other medicines with gastrointestinal effects, and medicines that worsen dehydration (e.g. NSAIDs).',
    loper: 'Do not give antimotility medicines such as loperamide.',
    ipc: 'Isolate with enteric precautions and follow local infection prevention and control advice.',
    severe: 'Markers of severe infection: WCC > 15 × 10⁹/L, creatinine > 50% above baseline, temperature > 38.5 °C, or signs of severe colitis. Refer to hospital if severely unwell or worsening rapidly.',
    response: 'Response is judged clinically and is usually not clear until about day 7; diarrhoea can take 1–2 weeks to settle.',
    fmt: 'Consider faecal microbiota transplant (FMT) for a recurrent episode after two or more previous episodes.',
    bezlo: 'Bezlotoxumab is not recommended by NICE and has since been withdrawn from the market.'
  };

  var Q = {
    start: {
      q: 'Any features of life-threatening infection?',
      help: 'Hypotension, partial or complete ileus, toxic megacolon, or CT evidence of severe disease.',
      options: [
        { label: 'No', next: 'episode' },
        { label: 'Yes', sub: 'Life-threatening', next: 'R_life' }
      ]
    },
    episode: {
      q: 'Which episode is this?',
      options: [
        { label: 'First episode', next: 'R_first' },
        { label: 'First episode, not improving on vancomycin', sub: 'Usually judged at about day 7', next: 'R_fail' },
        { label: 'Further episode within 12 weeks', sub: 'Relapse: within 12 weeks of symptoms resolving', next: 'R_relapse' },
        { label: 'Further episode after 12 weeks', sub: 'Recurrence: more than 12 weeks after symptoms resolved', next: 'R_recur' }
      ]
    }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }

  var R = {
    R_first: {
      title: 'First episode of C. difficile infection',
      regimens: [{ name: 'First line', items: [I('Vancomycin', D.vanc, '10 days')] }],
      notes: ['If vancomycin is ineffective, use fidaxomicin 200 mg orally twice a day for 10 days.', N.response, N.severe, N.stop, N.meds, N.loper, N.ipc]
    },
    R_fail: {
      title: 'First episode, vancomycin ineffective',
      regimens: [
        { name: 'Second line', items: [I('Fidaxomicin', D.fidax, '10 days')] },
        { name: 'If first and second line are ineffective: seek specialist advice', items: [I('Vancomycin', D.vanc500, '10 days'), I('with or without Metronidazole', D.metro, '10 days')] }
      ],
      notes: [N.response, N.severe, N.stop, N.meds, N.loper, N.ipc]
    },
    R_relapse: {
      title: 'Further episode within 12 weeks of symptom resolution (relapse)',
      regimens: [{ items: [I('Fidaxomicin', D.fidax, '10 days')] }],
      notes: [N.fmt, N.bezlo, N.severe, N.stop, N.meds, N.loper, N.ipc]
    },
    R_recur: {
      title: 'Further episode more than 12 weeks after symptom resolution (recurrence)',
      regimens: [
        { name: 'Option 1', items: [I('Vancomycin', D.vanc, '10 days')] },
        { name: 'Option 2', items: [I('Fidaxomicin', D.fidax, '10 days')] }
      ],
      notes: [N.fmt, N.bezlo, N.severe, N.stop, N.meds, N.loper, N.ipc]
    },
    R_life: {
      title: 'Life-threatening C. difficile infection',
      tone: 'red',
      summary: 'Seek urgent specialist advice, including surgical review.',
      regimens: [{ name: 'Specialists may initially offer', items: [I('Vancomycin', D.vancLT, '10 days'), I('with Metronidazole', D.metro, '10 days')] }],
      notes: ['Involve critical care and surgeons early: colectomy may be needed.', N.stop, N.meds, N.loper, N.ipc]
    }
  };

  window.GUIDES.cdiff = {
    Q: Q, R: R, eyebrow: 'Suggested treatment',
    ref: 'From NICE NG199 (2021), Clostridioides difficile infection: antimicrobial prescribing. Severity markers from PHE (2013). Check local guidelines.'
  };
})();
