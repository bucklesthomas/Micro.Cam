/* β-lactam cross-reactivity checker based on R1 side-chain similarity (BSACI 2015; 2022 US drug allergy practice parameter). */
(function () {
  var host = document.getElementById('xr');
  if (!host) return;
  // [name, class, side-chain group]. Groups: A aminobenzyl; C methoxyimino-aminothiazole (and cefuroxime); D ceftazidime/aztreonam type; others unique.
  var B = [
    ['Benzylpenicillin', 'pen', 'B'], ['Phenoxymethylpenicillin', 'pen', 'B'], ['Amoxicillin', 'pen', 'A'], ['Co-amoxiclav', 'pen', 'A'],
    ['Flucloxacillin', 'pen', 'u1'], ['Piperacillin–tazobactam', 'pen', 'u2'], ['Temocillin', 'pen', 'u3'], ['Pivmecillinam', 'pen', 'u4'],
    ['Cefalexin', 'ceph', 'A'], ['Cefadroxil', 'ceph', 'A'], ['Cefaclor', 'ceph', 'A'], ['Cefazolin', 'ceph', 'u5'],
    ['Cefuroxime', 'ceph', 'C'], ['Ceftriaxone', 'ceph', 'C'], ['Cefotaxime', 'ceph', 'C'], ['Cefepime', 'ceph', 'C'], ['Cefpodoxime', 'ceph', 'C'], ['Ceftaroline', 'ceph', 'C'],
    ['Cefixime', 'ceph', 'u6'],
    ['Ceftazidime', 'ceph', 'D'], ['Ceftazidime–avibactam', 'ceph', 'D'], ['Ceftolozane–tazobactam', 'ceph', 'D'], ['Cefiderocol', 'ceph', 'D'],
    ['Aztreonam', 'mono', 'D'],
    ['Meropenem', 'carb', 'u7'], ['Ertapenem', 'carb', 'u8'], ['Imipenem', 'carb', 'u9']
  ];
  var CLS = { pen: 'Penicillins', ceph: 'Cephalosporins', mono: 'Monobactam', carb: 'Carbapenems' };
  var st = { culprit: null };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function risk(c, t) {
    if (c[0] === t[0]) return ['avoid', 'The culprit drug'];
    var shared = c[2] === t[2] && c[2].charAt(0) !== 'u';
    if (c[1] === 'pen' && t[1] === 'pen') return ['avoid', 'Same class: penicillins share the core structure'];
    if (c[1] === 'carb' && t[1] === 'carb') return ['care', 'Same class: avoid unless allergy advice'];
    if (shared) return ['avoid', 'Shares the R1 side chain'];
    if (c[1] === 'ceph' && t[1] === 'ceph') return ['ok', 'Different side chain: low risk'];
    if (t[1] === 'carb') return ['ok', 'Carbapenem: cross-reactivity under 1%'];
    if (t[1] === 'mono' || c[1] === 'mono') return ['ok', 'No cross-reactivity except shared side chains'];
    if (c[1] === 'pen' && t[1] === 'ceph') return ['ok', 'Different side chain: about 1–2% or less'];
    if (c[1] === 'ceph' && t[1] === 'pen') return ['ok', 'Different side chain: low risk'];
    if (c[1] === 'carb') return ['ok', 'Low risk'];
    return ['ok', 'Low risk'];
  }
  var LBL = { avoid: 'Avoid', care: 'Caution', ok: 'Low risk' };
  function draw() {
    var h = '<p class="ir-grp">Culprit drug</p>';
    ['pen', 'ceph', 'mono', 'carb'].forEach(function (k) {
      h += '<div class="cov-chips xr-row">' + B.filter(function (b) { return b[1] === k; }).map(function (b) { return '<button type="button" class="sp-chip' + (st.culprit === b[0] ? ' on' : '') + '" data-d="' + esc(b[0]) + '" aria-pressed="' + (st.culprit === b[0]) + '">' + esc(b[0]) + '</button>'; }).join('') + '</div>';
    });
    if (!st.culprit) { host.innerHTML = h + '<p class="ir-empty">Pick the drug the patient reacted to.</p>'; return; }
    var c = B.filter(function (b) { return b[0] === st.culprit; })[0];
    h += '<div class="sp-scroll"><table class="cov-tbl xr-tbl"><thead><tr><th>β-lactam</th><th>Risk</th><th>Why</th></tr></thead><tbody>';
    ['pen', 'ceph', 'mono', 'carb'].forEach(function (k) {
      h += '<tr class="dur-h"><th colspan="3">' + CLS[k] + '</th></tr>';
      B.filter(function (b) { return b[1] === k; }).forEach(function (t) {
        var r = risk(c, t);
        h += '<tr><th scope="row">' + esc(t[0]) + '</th><td><span class="pg-tag ' + r[0] + '">' + LBL[r[0]] + '</span></td><td class="cov-why">' + esc(r[1]) + '</td></tr>';
      });
    });
    h += '</tbody></table></div><p class="ab-note">Applies to immediate and mild delayed reactions. After a severe delayed reaction (SJS/TEN, DRESS, AGEP, organ involvement), avoid all β-lactams unless an allergy specialist advises otherwise. “Low risk” is not no risk: give the first dose where a reaction can be treated, especially after anaphylaxis.</p>';
    host.innerHTML = h;
  }
  host.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b) return; st.culprit = b.getAttribute('data-d'); var y = window.scrollY; draw(); window.scrollTo(0, y); });
  draw();
})();
