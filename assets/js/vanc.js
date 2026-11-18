/* Vancomycin AUC calculator (adults).
   Two-level method: first-order (one-compartment) kinetics from a post-distribution peak and a trough in the same dosing interval
   (Sawchuk–Zaske); AUC by linear trapezoid during the infusion plus log-trapezoid elimination (Pai MP et al. Adv Drug Deliv Rev 2014).
   Continuous infusion: AUC24 = steady-state concentration × 24.
   Target: AUC24 400–600 mg·h/L, assuming MIC 1 mg/L (Rybak MJ et al. ASHP/IDSA/PIDS/SIDP consensus, Am J Health Syst Pharm 2020). */
(function () {
  var host = document.getElementById('vanc');
  if (!host) return;
  var st = { mode: 'two' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(id) { var el = host.querySelector('#' + id); if (!el) return NaN; var v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : NaN; }
  function r1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function r0(x) { return String(Math.round(x)); }
  function round250(x) { return Math.max(250, Math.round(x / 250) * 250); }
  function field(id, label, ph, val) { return '<label>' + esc(label) + '<input id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="' + esc(ph) + '"' + (val != null ? ' value="' + esc(val) + '"' : '') + '></label>'; }
  function band(auc, lo, hi) {
    if (auc < lo) return ['amber', 'Below target'];
    if (auc > hi) return ['red', 'Above target'];
    return ['green', 'Within target'];
  }

  function form() {
    var h = '<div class="ab-aw vc-modes">' +
      '<button type="button" class="sp-chip' + (st.mode === 'two' ? ' on' : '') + '" data-mode="two">Intermittent: peak and trough</button>' +
      '<button type="button" class="sp-chip' + (st.mode === 'ci' ? ' on' : '') + '" data-mode="ci">Continuous infusion</button></div>';
    if (st.mode === 'two') {
      h += '<div class="ab-sec"><h4>Current regimen</h4><div class="bp-inputs">' +
        field('vc-dose', 'Dose (mg)', 'e.g. 1000') + field('vc-tau', 'Interval (hours)', 'e.g. 12') + field('vc-tinf', 'Infusion time (hours)', 'e.g. 1') + '</div></div>';
      h += '<div class="ab-sec"><h4>Levels from the same dosing interval</h4><p class="ab-note">Times in hours from the <b>start</b> of the infusion. Take the peak at least 1 hour after the infusion ends. A pre-dose trough can be entered as a negative time (e.g. −0.5): it is then treated as the end of the previous interval, which assumes steady state.</p><div class="bp-inputs">' +
        field('vc-c1', 'Peak level (mg/L)', 'e.g. 30') + field('vc-t1', 'Peak time (hours)', 'e.g. 2') +
        field('vc-c2', 'Trough level (mg/L)', 'e.g. 12') + field('vc-t2', 'Trough time (hours)', 'e.g. 11.5') + '</div></div>';
    } else {
      h += '<div class="ab-sec"><h4>Current infusion</h4><div class="bp-inputs">' +
        field('vc-cid', 'Daily dose (mg per 24 hours)', 'e.g. 2000') + field('vc-css', 'Steady-state level (mg/L)', 'e.g. 18') + '</div>' +
        '<p class="ab-note">Steady state is usually reached about 24 hours after the loading dose with stable renal function; check the infusion has not been interrupted.</p></div>';
    }
    h += '<div class="ab-sec"><h4>Target AUC24 (mg·h/L)</h4><div class="bp-inputs">' + field('vc-lo', 'Lower', '400', '400') + field('vc-hi', 'Upper', '600', '600') + '</div></div>';
    h += '<div id="vc-out" class="bp-result" aria-live="polite"></div>';
    host.innerHTML = h;
    calc();
  }

  function calc() {
    var out = host.querySelector('#vc-out');
    var lo = num('vc-lo'), hi = num('vc-hi');
    if (!(lo > 0)) lo = 400; if (!(hi > lo)) hi = 600;
    var tgt = (lo + hi) / 2, h = '', text = [];
    if (st.mode === 'two') {
      var dose = num('vc-dose'), tau = num('vc-tau'), tinf = num('vc-tinf'), c1 = num('vc-c1'), t1 = num('vc-t1'), c2 = num('vc-c2'), t2 = num('vc-t2');
      if ([dose, tau, tinf, c1, t1, c2, t2].some(isNaN)) { out.innerHTML = '<p class="ab-note">Enter the regimen and both levels to calculate.</p>'; return; }
      var warn = [];
      var pre = false;
      if (t2 < 0) { t2 += tau; pre = true; }
      if (t1 < 0) { t1 += tau; }
      if (t2 < t1) { var tc = c1, tt = t1; c1 = c2; t1 = t2; c2 = tc; t2 = tt; }
      if (!(dose > 0 && tau > 0 && tinf > 0 && tinf < tau)) { out.innerHTML = '<p class="vc-err">Check the dose, interval and infusion time.</p>'; return; }
      if (!(c1 > c2 && c2 > 0)) { out.innerHTML = '<p class="vc-err">The later level must be lower than the earlier one. Check the values and times.</p>'; return; }
      if (t1 < tinf) { out.innerHTML = '<p class="vc-err">The peak was taken before the infusion ended: it must be taken after the end of the infusion (ideally 1–2 hours after).</p>'; return; }
      if (t1 < tinf + 1) warn.push('Peak taken less than 1 hour after the end of the infusion: the distribution phase may overestimate the AUC.');
      if (t2 > tau) warn.push('Trough time is after the end of the interval: check the times.');
      if (pre) warn.push('Pre-dose trough used as the end of the previous interval: valid only at steady state (usually after the 3rd or 4th dose), with doses given on time.');
      var ke = Math.log(c1 / c2) / (t2 - t1);
      var cmax = c1 * Math.exp(ke * (t1 - tinf));
      var cmin = c2 * Math.exp(-ke * (tau - t2));
      var aucTau = tinf * (cmax + cmin) / 2 + (cmax - cmin) / ke;
      var auc = aucTau * 24 / tau;
      var vd = (dose / tinf) * (1 - Math.exp(-ke * tinf)) / (ke * (cmax - cmin * Math.exp(-ke * tinf)));
      var cl = ke * vd, thalf = Math.LN2 / ke;
      var b = band(auc, lo, hi);
      h += '<div class="vc-big ' + b[0] + '"><span>AUC24</span><b>' + r0(auc) + '</b><small>mg·h/L · ' + b[1] + ' (' + r0(lo) + '–' + r0(hi) + ')</small></div>';
      h += '<table class="ab-tbl vc-tbl"><tr><th>Elimination rate (ke)</th><td>' + ke.toFixed(3) + ' per hour</td></tr><tr><th>Half-life</th><td>' + r1(thalf) + ' hours</td></tr>' +
        '<tr><th>Peak at end of infusion</th><td>' + r1(cmax) + ' mg/L</td></tr><tr><th>Trough at end of interval</th><td>' + r1(cmin) + ' mg/L</td></tr>' +
        '<tr><th>Volume of distribution</th><td>' + r1(vd) + ' L</td></tr><tr><th>Clearance</th><td>' + r1(cl) + ' L/hour</td></tr></table>';
      text.push('Vancomycin AUC (two levels): ' + dose + ' mg every ' + tau + ' h, infused over ' + tinf + ' h.', 'Levels: ' + c1 + ' mg/L at ' + r1(t1) + ' h, ' + c2 + ' mg/L at ' + r1(t2) + ' h from start of infusion.',
        'AUC24 ' + r0(auc) + ' mg·h/L (' + b[1].toLowerCase() + ', target ' + r0(lo) + '–' + r0(hi) + '). ke ' + ke.toFixed(3) + '/h, t1/2 ' + r1(thalf) + ' h, Cmax ' + r1(cmax) + ', Cmin ' + r1(cmin) + ' mg/L, Vd ' + r1(vd) + ' L, CL ' + r1(cl) + ' L/h.');
      // Suggested regimens for the target, by interval
      var rows = '';
      text.push('', 'Options for target AUC ' + r0(tgt) + ':');
      [8, 12, 24].forEach(function (T) {
        if (T < thalf * 0.5 || T > thalf * 4) return;
        var d = round250(tgt * cl * T / 24);
        var ti = Math.max(1, d / 600); // max rate 10 mg/min
        var k0 = d / ti;
        var cmx = (k0 / cl) * (1 - Math.exp(-ke * ti)) / (1 - Math.exp(-ke * T));
        var cmn = cmx * Math.exp(-ke * (T - ti));
        var a = d * 24 / T / cl;
        rows += '<tr><td>' + d + ' mg ' + T + '-hourly</td><td>' + r1(ti) + ' h</td><td>' + r0(a) + '</td><td>' + r1(cmx) + '</td><td>' + r1(cmn) + '</td></tr>';
        text.push('- ' + d + ' mg every ' + T + ' h (over ' + r1(ti) + ' h): predicted AUC24 ' + r0(a) + ', peak ' + r1(cmx) + ', trough ' + r1(cmn) + ' mg/L');
      });
      if (rows) h += '<h4 class="vc-h">Regimens predicted to reach AUC24 about ' + r0(tgt) + '</h4><div class="sp-scroll"><table class="cov-tbl vc-opt"><thead><tr><th>Regimen</th><th>Over</th><th>AUC</th><th>Peak</th><th>Trough</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="ab-note">Doses rounded to 250 mg; infusion at no more than 10 mg/min. Predictions assume the same clearance: recheck levels after a change, and sooner if renal function changes.</p>';
      if (!rows) h += '<p class="ab-note">Half-life of ' + r1(thalf) + ' hours: no 8–24-hourly regimen fits well. Consider level-guided dosing (e.g. redose when the level falls below about 15–20 mg/L) and discuss with pharmacy.</p>';
      if (warn.length) h += '<ul class="vc-warn">' + warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>';
    } else {
      var dd = num('vc-cid'), css = num('vc-css');
      if (isNaN(dd) || isNaN(css)) { out.innerHTML = '<p class="ab-note">Enter the daily dose and the steady-state level to calculate.</p>'; return; }
      if (!(dd > 0 && css > 0)) { out.innerHTML = '<p class="vc-err">Check the dose and level.</p>'; return; }
      var aucc = css * 24, clc = dd / aucc, bc = band(aucc, lo, hi);
      var nd = round250(tgt * clc);
      h += '<div class="vc-big ' + bc[0] + '"><span>AUC24</span><b>' + r0(aucc) + '</b><small>mg·h/L · ' + bc[1] + ' (' + r0(lo) + '–' + r0(hi) + ')</small></div>';
      h += '<table class="ab-tbl vc-tbl"><tr><th>Clearance</th><td>' + r1(clc) + ' L/hour</td></tr><tr><th>Level for target AUC ' + r0(tgt) + '</th><td>' + r1(tgt / 24) + ' mg/L (range ' + r1(lo / 24) + '–' + r1(hi / 24) + ')</td></tr>' +
        '<tr><th>Daily dose for target</th><td><b>' + nd + ' mg per 24 hours</b> (predicted level ' + r1(nd / clc / 24) + ' mg/L, AUC24 ' + r0(nd / clc) + ')</td></tr></table>';
      h += '<p class="ab-note">Proportional adjustment: the level changes in line with the dose if clearance is stable. Many UK continuous-infusion policies target a level of 20–25 mg/L (AUC24 480–600): follow your local protocol. After a big dose increase, some protocols give an extra bolus.</p>';
      text.push('Vancomycin AUC (continuous infusion): ' + dd + ' mg/24 h, steady-state level ' + css + ' mg/L.', 'AUC24 ' + r0(aucc) + ' mg·h/L (' + bc[1].toLowerCase() + ', target ' + r0(lo) + '–' + r0(hi) + '). CL ' + r1(clc) + ' L/h.', 'Dose for target AUC ' + r0(tgt) + ': ' + nd + ' mg/24 h (predicted level ' + r1(nd / clc / 24) + ' mg/L).');
    }
    text.push('', 'Calculated with Micro.Links vancomycin AUC calculator; check against the local vancomycin protocol.');
    h += '<div class="ie-actions"><button type="button" class="reset" data-copy>Copy for Epic</button></div>';
    out.innerHTML = h;
    out.setAttribute('data-text', text.join('\n'));
  }

  function copy(btn) {
    var text = host.querySelector('#vc-out').getAttribute('data-text') || '';
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Select and copy below'; setTimeout(function () { btn.textContent = o; }, 1800); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.className = 'mc-copy-box'; btn.parentNode.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (ok) ta.parentNode.removeChild(ta); done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  host.addEventListener('input', function (e) { if (e.target.tagName === 'INPUT') calc(); });
  host.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mode]');
    if (m) { st.mode = m.getAttribute('data-mode'); form(); return; }
    var c = e.target.closest('[data-copy]');
    if (c) copy(c);
  });
  form();
})();
