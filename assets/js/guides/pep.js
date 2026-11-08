/*
 * Needlestick and other blood-borne virus exposures.
 * HIV: BHIVA/BASHH UK guideline for the use of HIV post-exposure prophylaxis 2021 (2023 amendment), Table 4.
 * Hepatitis B: Green Book chapter 18 (February 2026), Table 18.8.
 */
(function () {
  window.GUIDES = window.GUIDES || {};

  var EXP = ['Sharps or needlestick injury', 'Mucous membrane splash', 'Non-intact skin', 'Intact skin only', 'Human bite', 'Discarded needle in the community'];

  var Q = {
    start: {
      q: 'What was the exposure?',
      options: [
        { label: EXP[0], sub: 'From a known source patient', next: 'src_hiv' },
        { label: EXP[1], sub: 'Blood or body fluid into eyes, mouth or nose', next: 'src_hiv' },
        { label: EXP[2], sub: 'Onto cuts, abrasions or eczema', next: 'src_hiv' },
        { label: EXP[3], sub: 'Blood on unbroken skin', next: 'R_intact' },
        { label: EXP[4], sub: 'Bite that broke the skin', next: 'src_hiv' },
        { label: EXP[5], sub: 'Source unknown', next: 'rec_hbv' }
      ]
    },
    src_hiv: {
      q: 'Source HIV status?',
      help: 'Ask someone other than the exposed person to seek the source’s consent for HIV, hepatitis B and hepatitis C testing. Do not delay PEP waiting for results.',
      options: [
        { label: 'HIV positive, viral load detectable or unknown', next: 'src_hbv' },
        { label: 'HIV positive, viral load undetectable', sub: 'On treatment, < 200 copies/ml', next: 'src_hbv' },
        { label: 'Unknown, from a high-prevalence group', sub: 'e.g. men who have sex with men, people from high-prevalence countries, people who inject drugs', next: 'src_hbv' },
        { label: 'Unknown, not from a high-prevalence group', sub: 'Or cannot be tested', next: 'src_hbv' },
        { label: 'Tested HIV negative', next: 'src_hbv' }
      ]
    },
    src_hbv: {
      q: 'Source hepatitis B status?',
      options: [
        { label: 'HBsAg positive', next: 'rec_hbv' },
        { label: 'Unknown', next: 'rec_hbv' },
        { label: 'HBsAg negative', next: 'rec_hbv' }
      ]
    },
    rec_hbv: {
      q: 'Exposed person’s hepatitis B vaccination?',
      options: [
        { label: 'Unvaccinated', next: 'R_pep' },
        { label: 'Partially vaccinated', sub: 'Primary course not completed', next: 'R_pep' },
        { label: 'Fully vaccinated', sub: 'Completed primary course', next: 'R_pep' },
        { label: 'Known non-responder', sub: 'Anti-HBs < 10 mIU/ml after vaccination', next: 'R_pep' }
      ]
    }
  };

  function I(drug, dose, dur) { return { drug: drug, dose: dose, dur: dur }; }
  function lc(t) { return /^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t; }

  var FIRST_AID = 'First aid: encourage the wound to bleed and wash with soap and running water (do not scrub or suck). Irrigate splashes to the eyes or mouth with plenty of water. Report the injury to occupational health or the emergency department.';
  var HIV_TEST = 'HIV testing: baseline HIV antigen/antibody test, then a follow-up test at least 45 days after the exposure, or 45 days after finishing PEP if given (about 10.5 weeks after exposure).';
  var HCV = 'Hepatitis C: there is no PEP. Test the source for hepatitis C. After a high-risk exposure, follow up the exposed person with HCV PCR or antigen testing (shorter window period than antibody), as per local occupational health policy. Early treatment is highly effective.';

  function hiv(e, s) {
    // e: exposure index, s: source index (0 detectable/unknown VL, 1 undetectable, 2 unknown high-prev, 3 unknown low-prev, 4 negative)
    if (e === 5) return { rec: 'no', why: 'PEP is not recommended after a community discarded needlestick: the risk of HIV is extremely low.' };
    if (e === 2) return { rec: 'no', why: 'HIV PEP is not recommended: the risk through non-intact skin is negligible.' };
    if (e === 4) return s === 0
      ? { rec: 'no', why: 'HIV PEP is generally not recommended after a human bite, even from an HIV-positive source with a detectable viral load. Discuss with an HIV specialist if there was blood in the biter’s mouth.' }
      : { rec: 'no', why: 'HIV PEP is not recommended after a human bite.' };
    if (s === 0) return { rec: 'yes', why: 'HIV PEP is recommended.' };
    if (s === 1) return { rec: 'no', why: 'HIV PEP is not recommended: there is no transmission risk when the source has an undetectable viral load.' };
    if (s === 2) return { rec: 'no', why: 'HIV PEP is generally not recommended. Test the source urgently: start PEP if they are found to be HIV positive with a detectable or unknown viral load (within 72 hours of the exposure).' };
    if (s === 3) return { rec: 'no', why: 'HIV PEP is not recommended.' };
    return { rec: 'no', why: 'HIV PEP is not recommended. Consider the window period only if the source has had a very recent high-risk exposure.' };
  }

  function hbv(srcI, recI) {
    // srcI: 0 positive, 1 unknown, 2 negative; recI: 0 unvaccinated, 1 partial, 2 full, 3 non-responder
    var T = [
      ['Accelerated vaccine course, plus HBIG with the first dose', 'Accelerated vaccine course', 'Consider starting a vaccine course'],
      ['One vaccine dose, then complete the course', 'One vaccine dose, then complete the course', 'Complete the vaccine course'],
      ['Booster dose if the last dose was 1 year ago or more', 'Consider a booster dose if the last dose was 1 year ago or more', 'No prophylaxis needed: reassure'],
      ['HBIG, plus a booster dose, then a second HBIG dose 1 month later', 'HBIG, consider a booster dose, then a second HBIG dose 1 month later', 'No HBIG; consider a booster dose']
    ];
    var action = T[recI][srcI];
    return { action: action, hbig: /plus HBIG|^HBIG/.test(action), none: /No prophylaxis/.test(action) };
  }

  var R = {
    R_intact: {
      title: 'Blood on intact skin only',
      tone: 'green',
      summary: 'Not a significant exposure: no HIV PEP or hepatitis B prophylaxis is needed.',
      regimens: [],
      notes: ['Wash the area with soap and water.', 'Use the opportunity to check the person’s hepatitis B vaccination status and offer vaccination if they are at ongoing risk.']
    },
    R_pep: function (a) {
      var e = a.start.i;
      var s = a.src_hiv ? a.src_hiv.i : 3;
      var b = e === 5 ? 1 : (a.src_hbv ? a.src_hbv.i : 1);
      var r = a.rec_hbv.i;
      var H = hiv(e, s), B = hbv(b, r);
      var regs = [];
      if (H.rec === 'yes') {
        regs.push({ name: 'HIV post-exposure prophylaxis', tag: 'Start now', items: [
          I('Tenofovir disoproxil/emtricitabine', '245 mg/200 mg, one tablet once daily', '28 days'),
          I('plus Raltegravir', '1200 mg (2 × 600 mg tablets) once daily', '28 days')
        ] });
      }
      var hbItems = [I('Hepatitis B', B.action, '')];
      if (B.hbig) hbItems.push(I('HBIG', '500 IU IM (adult dose), ideally at the same time as or within 24 hours of the first vaccine dose; not after 7 days', ''));
      regs.push({ name: 'Hepatitis B', noOr: true, items: hbItems });

      var notes = [FIRST_AID, H.why];
      if (H.rec === 'yes') {
        notes.push('Start PEP as soon as possible, preferably within 24 hours. Do not start more than 72 hours after the exposure.',
                   'Pregnancy: use raltegravir 400 mg twice daily instead. Check drug interactions (e.g. antacids and supplements containing polyvalent cations with raltegravir).');
      }
      notes.push(HIV_TEST);
      if (!B.none) notes.push('Hepatitis B: take baseline serology (HBsAg, anti-HBc, anti-HBs) unless known to be immune.');
      if (/Accelerated/.test(B.action)) notes.push('Accelerated course: doses at 0, 1 and 2 months (a very rapid 0, 7 and 21-day schedule is licensed for adults at immediate risk), with a further dose at 12 months if there is ongoing risk.');
      if (b !== 2 && !B.none) notes.push('If the source is HBsAg positive or unknown, test the exposed person for HBsAg 6 months after the exposure.');
      notes.push(HCV);

      var tone = H.rec === 'yes' ? 'red' : (B.none ? 'green' : 'amber');
      return {
        title: EXP[e] + (e === 5 ? '' : ', source ' + lc(a.src_hiv.label)),
        tone: tone,
        summary: (H.rec === 'yes' ? 'HIV PEP recommended. ' : 'HIV PEP not recommended. ') + 'Hepatitis B: ' + lc(B.action) + '.',
        regimens: regs,
        notes: notes
      };
    }
  };

  window.GUIDES.pep = {
    Q: Q, R: R, eyebrow: 'Suggested management',
    ref: 'From the BHIVA/BASHH UK guideline for the use of HIV post-exposure prophylaxis (2021, amended 2023) and the Green Book, chapter 18 (February 2026). Follow local occupational health policy.'
  };
})();
