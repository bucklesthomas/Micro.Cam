/* Exclusion periods in children and young people's settings (schools, nurseries, childminders).
   From UKHSA "Public health exclusion periods in children and young people's settings" (updated September 2026). */
(function () {
  var host = document.getElementById('excl-tbl');
  if (!host) return;
  // [infection, exclusion, when to contact the HPT]
  var D = [
    ['Athlete’s foot', 'None', ''],
    ['Chickenpox', 'Until 5 days after the rash appears', 'If chickenpox and scarlet fever circulate in the same group'],
    ['Cold sores', 'None', ''],
    ['Conjunctivitis', 'None', ''],
    ['COVID-19 and other respiratory infections, RSV', 'Stay away while symptoms are more than mild (and while feverish)', 'Unusually high absence, or a hospitalised case'],
    ['Cryptosporidiosis', 'Until 48 hours after diarrhoea and vomiting stop (no swimming for 2 weeks)', '2 or more linked cases'],
    ['Diarrhoea and vomiting', 'Until 48 hours after symptoms stop', 'For specialist advice'],
    ['Diphtheria', 'Until a healthcare professional confirms it is safe', 'Always'],
    ['E. coli (STEC)', '48 hours after symptoms stop; children under 6 until cleared by the HPT', 'Always'],
    ['Flu', 'Until well and fever free', 'Rising absence or serious illness'],
    ['Food poisoning', 'Until 48 hours after symptoms stop', '2 or more linked cases'],
    ['Giardiasis', 'Until 48 hours after diarrhoea stops', '2 or more linked cases'],
    ['Glandular fever', 'None', ''],
    ['Group A strep (including scarlet fever and iGAS)', 'Until 24 hours after starting antibiotics', 'Invasive group A strep; scarlet fever with chickenpox or flu in the same group'],
    ['Hand, foot and mouth disease', 'None', ''],
    ['Head lice', 'None', ''],
    ['Hepatitis A', 'Until 7 days after symptoms start (or jaundice onset)', '2 or more linked cases'],
    ['Hepatitis B and C, HIV', 'None', ''],
    ['Impetigo', 'Until lesions have crusted, or 48 hours after starting antibiotics', ''],
    ['Measles', 'Until 4 days after the rash started', 'Always'],
    ['Meningitis and meningococcal disease', 'Until recovered', 'Always'],
    ['MRSA', 'None', ''],
    ['Mpox', 'Until a healthcare professional confirms it is safe', 'Always'],
    ['Mumps', 'Until 5 days after the swelling started', 'Outbreaks'],
    ['Norovirus and rotavirus', 'Until 48 hours after symptoms stop', 'For specialist advice'],
    ['PVL Staphylococcus aureus', 'Only while wounds cannot be covered', '2 or more cases'],
    ['Ringworm', 'Until treatment has started', ''],
    ['Rubella', 'Until 5 days after the rash started', ''],
    ['Scabies', 'Under 6 (or unable to follow hygiene advice): until 24 hours after the first treatment', '2 or more linked cases'],
    ['Shingles', 'Only while the rash cannot be covered or has not crusted', ''],
    ['Slapped cheek (parvovirus B19)', 'None (not infectious once the rash appears)', ''],
    ['Threadworms', 'None', ''],
    ['Tuberculosis (active)', 'Until 2 weeks after starting treatment', 'Always'],
    ['Typhoid and paratyphoid', '48 hours after symptoms stop; children under 6 until cleared (risk group B)', 'Always'],
    ['Whooping cough (pertussis)', 'Until 48 hours of antibiotics, or 21 days from symptom onset if untreated', 'More than 2 linked cases']
  ];
  var st = { q: '' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function draw(keep) {
    var q = st.q.toLowerCase().trim();
    var h = '<div class="ab-bar"><input id="ex-q" type="search" placeholder="Filter infections…" value="' + esc(st.q) + '" aria-label="Filter infections" autocomplete="off"></div>';
    var rows = D.filter(function (d) { return !q || d.join(' ').toLowerCase().indexOf(q) !== -1; });
    h += '<div class="sp-scroll"><table class="cov-tbl pg-tbl ex-tbl"><thead><tr><th>Infection</th><th>Exclusion</th><th>Tell the HPT</th></tr></thead><tbody>';
    rows.forEach(function (d) {
      h += '<tr><th scope="row">' + esc(d[0]) + '</th><td>' + (d[1] === 'None' ? '<span class="pg-tag ok">None</span>' : esc(d[1])) + '</td><td>' + (d[2] ? esc(d[2]) : '<span class="pg-note">Not needed</span>') + '</td></tr>';
    });
    if (!rows.length) h += '<tr><td colspan="3" class="ir-empty">No match.</td></tr>';
    host.innerHTML = h + '</tbody></table></div>';
    if (keep) { var i = host.querySelector('#ex-q'); i.focus(); i.setSelectionRange(keep, keep); }
  }
  host.addEventListener('input', function (e) { if (e.target.id === 'ex-q') { st.q = e.target.value; draw(e.target.selectionStart || st.q.length); } });
  draw();
})();
