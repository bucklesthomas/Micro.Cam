/*
 * Shared click-through guide engine.
 * A page includes one or more guide data files (assets/js/guides/*.js), each setting
 * window.GUIDES[name] = { Q, R, ref }, then this file, and a host element:
 *   <div class="ie" data-guide="name"></div>
 *
 * Q[id] = { q, help?, options: [{ label, sub?, next }] }
 *   next: a question id, a result id, or function (answers) → id
 * R[id] = result object, or function (answers) → result object
 *   { title, tone?: 'green'|'amber'|'red', verify?, summary?, regimens: [{ name?, cls?, items: [{ drug, dose, dur }] }], notes: [] }
 * answers: { questionId: { i: optionIndex, label: optionLabel } }
 */
(function () {
  var GUIDES = window.GUIDES || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Copy plain text to the clipboard (Epic notes); falls back to a selectable box if the browser blocks it.
  function copyText(text, btn) {
    function done(ok) {
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? 'Copied' : 'Select and copy below';
      setTimeout(function () { btn.textContent = old; }, 1800);
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.className = 'mc-copy-box';
      btn.parentNode.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) ta.parentNode.removeChild(ta);
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  // Plain-text version of a result for pasting into a clinical note.
  function asText(st, G, page) {
    var r = st.result, L = [r.title];
    if (r.summary) L.push(r.summary);
    L.push('');
    st.steps.forEach(function (s) { L.push(s.q.q + ' ' + s.o.label); });
    (r.regimens || []).forEach(function (g, gi) {
      L.push('');
      if (gi > 0 && !g.noOr) L.push('or');
      if (g.name) L.push(g.name + ':');
      g.items.forEach(function (it) {
        var name = it.drug.replace(/^(or|and|plus|with or without) /i, ''), dose = String(it.dose || '');
        var line = dose.toLowerCase().indexOf(name.toLowerCase()) === 0 ? (it.drug.slice(0, it.drug.length - name.length) + dose) : (it.drug + ': ' + dose);
        L.push('- ' + line + (it.dur ? ' (' + it.dur + ')' : ''));
      });
    });
    var notes = (r.notes || []).filter(function (n) { return !/this guide|the .* (guide|page)\b|^choose |choose "/i.test(n); });
    if (notes.length) { L.push(''); notes.forEach(function (n) { L.push('- ' + n); }); }
    L.push('', 'Guide: ' + page + ' (Micro.Cam). ' + (G.ref || ''));
    return L.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  // Follow a list of option indexes from the start; returns the steps taken and where we ended up.
  function resolve(G, picks) {
    var id = 'start', answers = {}, steps = [];
    for (var k = 0; k < picks.length; k++) {
      var q = G.Q[id];
      if (!q) break;
      var o = q.options[picks[k]];
      answers[id] = { i: picks[k], label: o.label };
      steps.push({ id: id, q: q, o: o });
      id = typeof o.next === 'function' ? o.next(answers) : o.next;
    }
    var result = null;
    if (!G.Q[id] && G.R[id]) result = typeof G.R[id] === 'function' ? G.R[id](answers) : G.R[id];
    return { id: id, steps: steps, answers: answers, question: G.Q[id] || null, result: result };
  }

  function renderResult(r, G) {
    var ref = G.ref;
    var h = '<section class="ie-result" aria-live="polite"' + (r.tone ? ' data-tone="' + r.tone + '"' : '') + '>' +
            '<p class="ie-eyebrow">' + esc(r.eyebrow || G.eyebrow || 'Suggested management') + '</p><h2>' + esc(r.title) + '</h2>';
    if (r.summary) h += '<p class="ie-summary">' + esc(r.summary) + '</p>';
    if (r.verify) h += '<p class="ie-verify">' + esc(r.verify) + '</p>';
    (r.regimens || []).forEach(function (g, gi) {
      if (gi > 0 && !g.noOr) h += '<p class="ie-or">or</p>';
      var head = '<span>' + esc(g.name || 'Regimen') + '</span>' +
                 (g.cls ? '<span class="ie-cls" title="Class of recommendation and level of evidence">ESC class ' + esc(g.cls.split(' ')[0]) + ', level ' + esc(g.cls.split(' ')[1]) + '</span>' : '') +
                 (g.tag ? '<span class="ie-cls">' + esc(g.tag) + '</span>' : '');
      h += '<div class="ie-regimen"><p class="ie-rname">' + head + '</p><ul>';
      g.items.forEach(function (it) {
        h += '<li><span class="ie-drug">' + esc(it.drug) + '</span><span class="ie-dose">' + esc(it.dose) + '</span>' +
             (it.dur ? '<span class="ie-dur">' + esc(it.dur) + '</span>' : '') + '</li>';
      });
      h += '</ul></div>';
    });
    if (r.notes && r.notes.length) {
      h += '<ul class="ie-notes">' + r.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>';
    }
    if (ref) h += '<p class="ie-ref">' + esc(ref) + '</p>';
    return h + '</section>';
  }

  function mount(host) {
    var name = host.getAttribute('data-guide');
    var G = GUIDES[name];
    if (!G) return;
    var picks = [], lastState = null;
    function pageName() {
      var box = host.parentNode, h;
      while (box && box !== document.body) { h = box.querySelector && box.querySelector('h1'); if (h) return h.textContent.trim(); box = box.parentNode; }
      return name;
    }

    function render(focus) {
      var st = resolve(G, picks);
      var html = '';
      st.steps.forEach(function (s, i) {
        html += '<div class="ie-done"><span class="ie-q">' + esc(s.q.q) + '</span>' +
                '<button type="button" class="ie-ans" data-back="' + i + '" aria-label="Change answer: ' + esc(s.o.label) + '">' +
                esc(s.o.label) + '<span class="ie-change">Change</span></button></div>';
      });
      if (st.question) {
        var q = st.question;
        html += '<fieldset class="ie-step"><legend>' + esc(q.q) + '</legend>' +
                (q.help ? '<p class="ie-help">' + esc(q.help) + '</p>' : '') + '<div class="ie-opts">';
        q.options.forEach(function (o, j) {
          html += '<button type="button" class="opt ie-opt" data-pick="' + j + '"><span class="opt-text">' + esc(o.label) + '</span>' +
                  (o.sub ? '<span class="ie-sub">' + esc(o.sub) + '</span>' : '') + '</button>';
        });
        html += '</div></fieldset>';
      } else if (st.result) {
        html += renderResult(st.result, G);
      }
      if (picks.length) html += '<div class="ie-actions"><button type="button" class="reset" data-restart>Start again</button>' +
        (st.result ? '<button type="button" class="reset ie-copy" data-copy title="Copy this result as plain text for a clinical note">Copy for Epic</button>' : '') + '</div>';
      lastState = st;
      host.innerHTML = html;
      host.setAttribute('data-node', st.id);

      if (focus) {
        var target = host.querySelector('.ie-result, .ie-step');
        if (target) {
          var first = target.querySelector('.ie-opt') || target;
          if (first === target) target.setAttribute('tabindex', '-1');
          first.focus({ preventScroll: true });
          var r = target.getBoundingClientRect();
          if (r.top < 80 || r.bottom > window.innerHeight) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }

    host.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-pick]');
      var back = e.target.closest('[data-back]');
      if (pick) { picks.push(Number(pick.getAttribute('data-pick'))); render(true); }
      else if (back) { picks = picks.slice(0, Number(back.getAttribute('data-back'))); render(true); }
      else if (e.target.closest('[data-restart]')) { picks = []; render(true); }
      else if (e.target.closest('[data-copy]') && lastState && lastState.result) copyText(asText(lastState, G, pageName()), e.target.closest('[data-copy]'));
    });
    render(false);
  }

  // Every route through a guide (used for testing): returns [{ picks, id, title }]
  function walk(name, limit) {
    var G = GUIDES[name], out = [], max = limit || 5000;
    (function dfs(picks) {
      if (out.length >= max) return;
      var st = resolve(G, picks);
      if (st.question) st.question.options.forEach(function (_, j) { dfs(picks.concat([j])); });
      else out.push({ picks: picks, id: st.id, title: st.result ? st.result.title : null });
    })([]);
    return out;
  }

  window.GUIDE_API = { resolve: function (n, p) { return resolve(GUIDES[n], p); }, walk: walk };
  Array.prototype.forEach.call(document.querySelectorAll('[data-guide]'), mount);
})();
