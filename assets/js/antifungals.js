/*
 * Antifungal spectrum chart and TDM helper.
 * Spectrum: expected activity for typical isolates (not a substitute for susceptibility testing).
 *   S = usually active, V = variable or limited (check susceptibility / not first choice), R = intrinsically resistant or not useful.
 * TDM: BSMM guideline (Ashbee HR et al. J Antimicrob Chemother 2014) as used by the UKHSA Mycology Reference Laboratory,
 *   and ECIL-6 (Lewis R et al. 2015) for timing and dose adjustment.
 */
(function () {
  var DRUGS = ['Fluconazole', 'Itraconazole', 'Voriconazole', 'Posaconazole', 'Isavuconazole', 'Echinocandins', 'Amphotericin B', 'Flucytosine'];
  var SHORT = ['FLU', 'ITR', 'VOR', 'POS', 'ISA', 'ECH', 'AMB', '5FC'];

  // [organism, group, codes per drug, note]
  var ROWS = [
    ['Candida albicans', 'Yeasts', 'SSSSSSSS', 'Fluconazole susceptible in most UK isolates.'],
    ['C. tropicalis', 'Yeasts', 'SSSSSSSS', 'Some fluconazole resistance: check susceptibility.'],
    ['C. parapsilosis', 'Yeasts', 'SSSSSVSS', 'Naturally higher echinocandin MICs. Azole-resistant strains are increasing.'],
    ['Nakaseomyces glabratus (C. glabrata)', 'Yeasts', 'VVVVVSSS', 'Reduced azole susceptibility (fluconazole dose-dependent). Echinocandin resistance in about 5–10%.'],
    ['Pichia kudriavzevii (C. krusei)', 'Yeasts', 'RVSSSSSR', 'Intrinsically fluconazole resistant. Reduced flucytosine susceptibility.'],
    ['Clavispora lusitaniae (C. lusitaniae)', 'Yeasts', 'SSSSSSVS', 'Can develop amphotericin B resistance on treatment.'],
    ['Candidozyma auris (C. auris)', 'Yeasts', 'RVVVVSVV', 'Most isolates fluconazole resistant; some pan-resistant. Echinocandin first line.'],
    ['Cryptococcus neoformans / gattii', 'Yeasts', 'SSSSSRSS', 'Intrinsically echinocandin resistant. Flucytosine only in combination.'],
    ['Trichosporon spp.', 'Yeasts', 'VVSSSRVR', 'Echinocandin resistant; amphotericin often poorly active. Voriconazole preferred.'],
    ['Aspergillus fumigatus', 'Moulds', 'RSSSSVSR', 'Azole resistance rising (check susceptibility). Echinocandins only for salvage or combination.'],
    ['A. flavus', 'Moulds', 'RSSSSVVR', 'Higher amphotericin B MICs.'],
    ['A. terreus', 'Moulds', 'RSSSSVRR', 'Intrinsically amphotericin B resistant.'],
    ['A. niger', 'Moulds', 'RVSSSVSR', 'Itraconazole MICs often raised.'],
    ['Mucorales (Rhizopus, Mucor, Lichtheimia)', 'Moulds', 'RRRVVRSR', 'Voriconazole inactive. Liposomal amphotericin B first line; posaconazole or isavuconazole as alternatives or step-down.'],
    ['Fusarium spp.', 'Moulds', 'RRVVVRVR', 'Often multi-resistant. Voriconazole or amphotericin B guided by susceptibility.'],
    ['Scedosporium apiospermum', 'Moulds', 'RVSVVRRR', 'Voriconazole is the drug of choice. Amphotericin B usually inactive.'],
    ['Lomentospora prolificans', 'Moulds', 'RRVRRRRR', 'Pan-resistant. Voriconazole with terbinafine is sometimes used: specialist advice.'],
    ['Endemic dimorphic fungi (Histoplasma, Blastomyces, Coccidioides)', 'Dimorphic', 'VSSSSRSR', 'Itraconazole for most mild to moderate disease; amphotericin B for severe disease.']
  ];

  var LABEL = { S: 'Usually active', V: 'Variable or limited', R: 'Resistant or not useful' };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ── Spectrum chart ─────────────────────── */
  var sp = document.getElementById('spectrum');
  if (sp) {
    var state = { group: 'All', drug: -1, row: -1 };
    function drawSpectrum() {
      var groups = ['All', 'Yeasts', 'Moulds', 'Dimorphic'];
      var h = '<div class="sp-filters" role="group" aria-label="Show">' + groups.map(function (g) {
        return '<button type="button" class="sp-chip' + (state.group === g ? ' on' : '') + '" data-group="' + g + '" aria-pressed="' + (state.group === g) + '">' + g + '</button>';
      }).join('') + '</div>';
      h += '<p class="sp-hint">Tap a drug to highlight what it covers, or tap an organism for notes.</p>';
      h += '<div class="sp-scroll"><table class="sp-table"><thead><tr><th scope="col" class="sp-org">Organism</th>';
      DRUGS.forEach(function (d, j) {
        h += '<th scope="col" class="sp-drug' + (state.drug === j ? ' on' : '') + '"><button type="button" data-drug="' + j + '" aria-pressed="' + (state.drug === j) + '" title="' + d + '"><span class="sp-full">' + d + '</span><span class="sp-abbr">' + SHORT[j] + '</span></button></th>';
      });
      h += '</tr></thead><tbody>';
      ROWS.forEach(function (r, i) {
        if (state.group !== 'All' && r[1] !== state.group) return;
        var dim = state.drug >= 0 && r[2][state.drug] === 'R' && state.row !== i;
        h += '<tr class="' + (state.row === i ? 'open ' : '') + (dim ? 'dim' : '') + '"><th scope="row" class="sp-org"><button type="button" data-row="' + i + '" aria-expanded="' + (state.row === i) + '">' + esc(r[0]) + '</button></th>';
        for (var j = 0; j < DRUGS.length; j++) {
          var c = r[2][j];
          h += '<td class="sp-cell ' + c + (state.drug === j ? ' col' : '') + '" title="' + esc(DRUGS[j] + ': ' + LABEL[c]) + '"><span class="sp-dot" role="img" aria-label="' + LABEL[c] + '"></span></td>';
        }
        h += '</tr>';
      });
      h += '</tbody></table></div>';
      if (state.row >= 0 && (state.group === 'All' || ROWS[state.row][1] === state.group)) {
        var rr = ROWS[state.row];
        h += '<div class="sp-notebox"><strong>' + esc(rr[0]) + '</strong><span>' + esc(rr[3]) + '</span><span class="sp-notecells">' +
             DRUGS.map(function (d, j) { return '<span class="sp-cell ' + rr[2][j] + '"><span class="sp-dot"></span>' + d + '</span>'; }).join('') + '</span></div>';
      }
      h += '<div class="sp-legend"><span class="sp-cell S"><span class="sp-dot"></span>Usually active</span><span class="sp-cell V"><span class="sp-dot"></span>Variable or limited</span><span class="sp-cell R"><span class="sp-dot"></span>Resistant or not useful</span></div>';
      sp.innerHTML = h;
    }
    sp.addEventListener('click', function (e) {
      var g = e.target.closest('[data-group]'), d = e.target.closest('[data-drug]'), r = e.target.closest('[data-row]');
      if (g) state.group = g.getAttribute('data-group');
      else if (d) { var j = Number(d.getAttribute('data-drug')); state.drug = state.drug === j ? -1 : j; }
      else if (r) { var i = Number(r.getAttribute('data-row')); state.row = state.row === i ? -1 : i; }
      else return;
      drawSpectrum();
    });
    drawSpectrum();
  }

  /* ── TDM helper ─────────────────────────── */
  var TDM = {
    vori: {
      name: 'Voriconazole',
      when: 'Trough (immediately before a dose) on day 2–5, then again in week 2. Recheck 5 days after an IV-to-oral switch and 2–5 days after any dose change.',
      uses: [['Prophylaxis', 1], ['Treatment', 1], ['Severe, bulky or disseminated', 2]],
      max: 5.5,
      interpret: function (v, lo) {
        if (v < 0.5) return ['low', 'Below target', 'Check adherence, absorption, timing and interactions (e.g. rifampicin, carbamazepine, phenytoin). Increase the daily dose by 50% and recheck in 2–5 days.'];
        if (v < lo) return ['low', 'Below target', 'Check adherence, the sample timing and interactions, and that the mg/kg dose was kept after an IV-to-oral switch. If no cause is found, consider a dose increase and recheck in 2–5 days.'];
        if (v <= 5.5) return ['ok', 'In range', 'Continue the current dose. Repeat in week 2, then at weeks 4, 8 and 12, then every 3 months, and after any change in dose or interacting drugs.'];
        if (v > 10) return ['high', 'Toxic range', 'Withhold one dose, then restart at half the dose. Check for toxicity (liver, visual, neurological) and interactions, and recheck in 2–5 days.'];
        return ['high', 'Above target', 'Confirm it was a true trough and check interactions. If there are side effects, withhold one dose and halve subsequent doses; if well, consider halving the dose. Recheck in 2–5 days.'];
      }
    },
    posa: {
      name: 'Posaconazole',
      when: 'Trough (immediately before a dose) after about 3 days on tablets or IV, or 5–7 days on the suspension. Recheck 7–14 days after any change.',
      uses: [['Prophylaxis', 0.7], ['Treatment', 1]],
      max: 3.75,
      interpret: function (v, lo) {
        if (v < lo) return ['low', 'Below target', 'Check adherence and absorption (diarrhoea, mucositis, acid suppression). Switch the suspension to tablets or IV. If tablets are already used, discuss a dose increase with microbiology. Recheck in 5–7 days.'];
        if (v <= 3.75) return ['ok', 'In range', 'Continue the current dose. Recheck monthly for 3 months, then every 3 months, and after any change in dose, formulation or interacting drugs.'];
        return ['high', 'Above the upper limit', 'Levels above 3.75 mg/L may increase toxicity (liver, QT). Check for interacting drugs and liver function; consider reducing the dose and recheck in 7–14 days.'];
      }
    },
    itra: {
      name: 'Itraconazole',
      when: 'Trough (immediately before a dose) on day 5–7. Recheck about 7 days after any change.',
      uses: [['Prophylaxis', 0.5], ['Treatment', 1]],
      max: 4,
      interpret: function (v, lo) {
        if (v < lo) return ['low', 'Below target', 'Check adherence, interactions and acid suppression (capsules need gastric acid; take with food). Switch capsules to the oral solution, or increase by 100 mg twice daily. Recheck in about 7 days.'];
        if (v <= 4) return ['ok', 'In range', 'Continue the current dose. Recheck monthly for 3 months, then every 3 months.'];
        return ['high', 'Above target', 'Levels above 4 mg/L (HPLC) are associated with toxicity. Check for side effects and interactions; reduce the dose if there are side effects or no alternative. Recheck in about 7 days.'];
      }
    },
    isa: {
      name: 'Isavuconazole',
      when: 'Not routine. Consider a trough at day 5–7 for breakthrough or non-responding infection, a less susceptible organism, or interacting drugs.',
      uses: [['Treatment', 2]],
      max: 4,
      interpret: function (v) {
        if (v < 2) return ['low', 'Below the usual range', 'No validated target. For severe infection or a raised MIC, aim for about 2–3 mg/L or more; check adherence and interactions and discuss with microbiology.'];
        if (v <= 4) return ['ok', 'Usual range', 'Adequate exposure for most infections. Continue the current dose.'];
        return ['high', 'Above the usual range', 'No validated toxicity threshold. If there are side effects (liver, gastrointestinal), discuss a dose reduction with microbiology.'];
      }
    },
    fc: {
      name: 'Flucytosine',
      when: 'Within 72 hours of starting: a pre-dose trough and a post-dose peak (2 hours after an oral dose, or 30–60 minutes after an IV infusion ends). Then twice weekly, and more often if renal function changes.',
      uses: [['Treatment', 20]],
      peak: true,
      interpret: function (t, lo, pk) {
        var out = [];
        if (t < 20) out.push(['low', 'Trough below 20 mg/L', 'Low troughs are linked to treatment failure and resistance. Check the dose against renal function and consider increasing it.']);
        else if (t > 50) out.push(['high', 'Trough above 50 mg/L', 'The drug is accumulating. Check renal function and reduce the dose or lengthen the interval.']);
        else out.push(['ok', 'Trough in range (20–50 mg/L)', '']);
        if (pk != null && !isNaN(pk)) {
          if (pk > 100) out.push(['high', 'Peak above 100 mg/L', 'Peaks above 100 mg/L are linked to bone marrow and liver toxicity. Reduce the dose; check blood count, liver and renal function.']);
          else if (pk < 50) out.push(['low', 'Peak below 50 mg/L', 'Consider increasing the dose if the trough is also low.']);
          else out.push(['ok', 'Peak in range (50–100 mg/L)', '']);
        }
        var worst = out.some(function (o) { return o[0] === 'high'; }) ? 'high' : out.some(function (o) { return o[0] === 'low'; }) ? 'low' : 'ok';
        var title = out.map(function (o) { return o[1]; }).join(' · ');
        var text = out.map(function (o) { return o[2]; }).filter(Boolean).join(' ') || 'Continue the current dose and recheck twice weekly.';
        return [worst, title, text];
      }
    }
  };

  var td = document.getElementById('tdm');
  if (td) {
    var st = { drug: 'vori', use: 0 };
    function drawTdm(keepValues) {
      var t = TDM[st.drug];
      if (st.use >= t.uses.length) st.use = 0;
      var prevT = keepValues && td.querySelector('#tdm-trough') ? td.querySelector('#tdm-trough').value : '';
      var prevP = keepValues && td.querySelector('#tdm-peak') ? td.querySelector('#tdm-peak').value : '';
      var h = '<fieldset class="row choice"><legend>Drug</legend><div class="opts">';
      Object.keys(TDM).forEach(function (k) {
        h += '<label class="opt" for="tdm-d-' + k + '"><input type="radio" name="tdm-drug" id="tdm-d-' + k + '" value="' + k + '"' + (st.drug === k ? ' checked' : '') + '><span class="opt-text">' + TDM[k].name + '</span></label>';
      });
      h += '</div></fieldset>';
      if (t.uses.length > 1) {
        h += '<fieldset class="row choice"><legend>Indication</legend><div class="opts">';
        t.uses.forEach(function (u, i) {
          h += '<label class="opt" for="tdm-u-' + i + '"><input type="radio" name="tdm-use" id="tdm-u-' + i + '" value="' + i + '"' + (st.use === i ? ' checked' : '') + '><span class="opt-text">' + u[0] + '</span><span class="opt-pts">' + (st.drug === 'vori' ? u[1] + '–5.5 mg/L' : '> ' + u[1] + ' mg/L') + '</span></label>';
        });
        h += '</div></fieldset>';
      }
      h += '<div class="tdm-inputs"><label for="tdm-trough">' + (t.peak ? 'Pre-dose (trough) level' : 'Trough level') + '<span class="tdm-field"><input id="tdm-trough" type="number" inputmode="decimal" min="0" step="0.1" value="' + esc(prevT) + '" placeholder="e.g. 2.4"><span>mg/L</span></span></label>';
      if (t.peak) h += '<label for="tdm-peak">Post-dose (peak) level<span class="tdm-field"><input id="tdm-peak" type="number" inputmode="decimal" min="0" step="0.1" value="' + esc(prevP) + '" placeholder="optional"><span>mg/L</span></span></label>';
      h += '</div><p class="tdm-when"><strong>When to sample:</strong> ' + esc(t.when) + '</p><div id="tdm-out"></div>';
      td.innerHTML = h;
      result();
    }
    function result() {
      var t = TDM[st.drug], out = td.querySelector('#tdm-out');
      var v = parseFloat(td.querySelector('#tdm-trough').value);
      var pkEl = td.querySelector('#tdm-peak'), pk = pkEl ? parseFloat(pkEl.value) : null;
      if (isNaN(v)) { out.innerHTML = '<p class="tdm-empty">Enter a level to see the interpretation.</p>'; return; }
      var r = t.interpret(v, t.uses[st.use][1], pk);
      var level = r[0] === 'ok' ? 'low' : r[0] === 'low' ? 'mid' : 'high';
      out.innerHTML = '<div class="result" data-level="' + level + '"><span class="total word">' + esc(r[0] === 'ok' ? 'OK' : r[0] === 'low' ? 'Low' : 'High') + '</span><span class="interp">' + esc(r[1]) + '</span></div><p class="note">' + esc(r[2]) + '</p>';
    }
    td.addEventListener('change', function (e) {
      if (e.target.name === 'tdm-drug') { st.drug = e.target.value; st.use = 0; drawTdm(false); }
      else if (e.target.name === 'tdm-use') { st.use = Number(e.target.value); drawTdm(true); }
    });
    td.addEventListener('input', function (e) { if (e.target.id === 'tdm-trough' || e.target.id === 'tdm-peak') result(); });
    drawTdm(false);
  }
})();
