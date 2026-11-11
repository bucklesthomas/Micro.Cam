/* HIV: prophylaxis and screening by CD4 count (BHIVA). */
(function () {
  var host = document.getElementById('cd4');
  if (!host) return;
  var st = { cd4: '', pct: '', toxo: 'unknown', vl: 'no', area: 'none' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function chips(name, opts) {
    return '<div class="cov-chips">' + opts.map(function (o) { return '<button type="button" class="sp-chip' + (st[name] === o[0] ? ' on' : '') + '" data-f="' + name + '" data-v="' + o[0] + '" aria-pressed="' + (st[name] === o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  }
  function advice() {
    var c = parseFloat(st.cd4), p = parseFloat(st.pct);
    if (isNaN(c)) return '<p class="ir-empty">Enter the CD4 count.</p>';
    var out = [];
    var low = c < 200 || (!isNaN(p) && p < 14);
    if (low) out.push(['red', 'PCP prophylaxis', 'Co-trimoxazole 480 mg or 960 mg once daily (or 960 mg three times a week). Alternatives if intolerant: dapsone, atovaquone, or nebulised pentamidine.' + (st.toxo === 'pos' ? ' This also covers toxoplasmosis.' : '')]);
    else if (c < 250) out.push(['amber', 'PCP prophylaxis: consider', 'CD4 200–250: give co-trimoxazole if ART is being delayed or 3-monthly CD4 monitoring is not possible.']);
    if (c < 200 && st.toxo === 'pos') out.push(['red', 'Toxoplasma prophylaxis', 'Toxoplasma IgG positive with CD4 < 200: co-trimoxazole 480–960 mg daily (nebulised pentamidine alone does not protect).']);
    if (c < 200 && st.toxo === 'unknown') out.push(['amber', 'Check Toxoplasma IgG', 'Needed to decide on toxoplasmosis prophylaxis.']);
    if (c < 200) out.push([c < 100 ? 'red' : 'amber', 'Cryptococcal antigen', c < 100 ? 'Screen serum CrAg (WHO). If positive, do an LP; if no CNS disease, pre-emptive fluconazole.' : 'Check serum CrAg if any symptoms (headache, fever, confusion); WHO suggests screening up to CD4 < 200.']);
    if (c < 50) out.push(['red', 'CMV retinitis', 'Dilated fundoscopy by ophthalmology. Ask about floaters and visual loss.']);
    if (c < 50) out.push(['green', 'MAC', 'Primary prophylaxis is not needed if ART is started promptly. Send mycobacterial blood cultures if febrile.']);
    if (c < 100 && st.area !== 'none') out.push(['amber', 'Endemic fungi', st.area === 'asia' ? 'Lived in or travelled to South-East Asia: consider Talaromyces marneffei (blood cultures, antigen where available) if unwell.' : 'Lived in or travelled to the Americas or Africa: consider histoplasmosis (urine and serum antigen) if unwell.']);
    out.push(['green', 'TB', 'Screen everyone for active TB symptoms; test for latent TB according to BHIVA risk criteria (country of origin, CD4, TB contact).']);
    out.push(['green', 'ART', 'Start as soon as possible (same day to within 2 weeks), including after most opportunistic infections. Exceptions: cryptococcal meningitis (4–6 weeks) and TB meningitis (delayed).']);
    if (low && st.vl === 'yes') out.push(['green', 'Stopping prophylaxis', 'Stop PCP prophylaxis when CD4 > 200 for 3 months on ART, or CD4 100–200 with an undetectable viral load for 3–6 months.']);
    return '<div class="cd4-list">' + out.map(function (o) { return '<div class="cd4-item ' + o[0] + '"><b>' + esc(o[1]) + '</b><span>' + esc(o[2]) + '</span></div>'; }).join('') + '</div>';
  }
  function draw(keep) {
    host.innerHTML = '<div class="cov-layout"><section class="card af-card"><h2>Patient</h2>' +
      '<div class="bp-inputs"><label>CD4 count (cells/mm³)<input id="cd4-n" inputmode="numeric" value="' + esc(st.cd4) + '" placeholder="e.g. 85"></label><label>CD4 % (optional)<input id="cd4-p" inputmode="decimal" value="' + esc(st.pct) + '" placeholder="e.g. 9"></label></div>' +
      '<p class="ir-grp">Toxoplasma IgG</p>' + chips('toxo', [['pos', 'Positive'], ['neg', 'Negative'], ['unknown', 'Not known']]) +
      '<p class="ir-grp">On ART with undetectable viral load</p>' + chips('vl', [['yes', 'Yes'], ['no', 'No']]) +
      '<p class="ir-grp">Lived in or travelled to</p>' + chips('area', [['none', 'Neither'], ['asia', 'South-East Asia'], ['amer', 'The Americas or Africa']]) +
      '</section><section class="card af-card" aria-live="polite"><h2>Prophylaxis and screening</h2>' + advice() + '</section></div>';
    if (keep) { var el = host.querySelector('#' + keep.id); el.focus(); try { el.setSelectionRange(keep.pos, keep.pos); } catch (e) {} }
  }
  host.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; st[b.getAttribute('data-f')] = b.getAttribute('data-v'); var y = window.scrollY; draw(); window.scrollTo(0, y); });
  host.addEventListener('input', function (e) { if (e.target.id === 'cd4-n') st.cd4 = e.target.value; else if (e.target.id === 'cd4-p') st.pct = e.target.value; else return; draw({ id: e.target.id, pos: e.target.selectionStart }); });
  draw();
})();
