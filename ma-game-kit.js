/*! Math Adventure game kit v0.1.0 (helper for ma-games.js)
 * Builds a "question + picture + big answer buttons + countdown bar" game from a tiny description,
 * so most games are just a levels table and a makeSpec() function.
 *
 *   MAGames.kit.choiceGame({
 *     id, name, emoji, blurb, grades, modes?, rounds?,
 *     levels: [null, { label:'...', ms:12000, ... }, ...],     // index = level, entry 0 unused
 *     makeSpec: function (rng, cfg, level, roundIndex) {
 *       return { question:'...', visual:'<html string>'?, choices:[numbers|strings|{v,label}], answer: v,
 *                explain:'shown after the round', big:true? }
 *     }
 *   });
 *
 * Because every device builds its round from the same seed + the player's own level, all multiplayer
 * modes (teamwork, face-off, race) work with no extra code in the game.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames;
  if (!MAG) throw new Error('Load ma-games.js before ma-game-kit.js');

  var NAVY = '#1b2a49';
  var CSS = [
    '.mk-q{font-weight:900;font-size:1.35rem;text-align:center;min-height:1.6em}',
    '.mk-vis{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;min-height:90px;max-width:100%}',
    '.mk-bar{width:100%;max-width:420px;height:12px;border:3px solid ' + NAVY + ';border-radius:99px;background:#fff;overflow:hidden}',
    '.mk-bar i{display:block;height:100%;width:100%;background:#3ddc97}',
    '.mk-bar.low i{background:#ff6b6b}',
    '.mk-pad{display:grid;gap:10px;width:100%;max-width:420px}',
    '.mk-btn{font:inherit;font-weight:900;font-size:1.6rem;padding:12px 4px;border-radius:16px;border:3px solid ' + NAVY + ';background:#fff;color:' + NAVY + ';box-shadow:0 5px 0 ' + NAVY + ';cursor:pointer;touch-action:manipulation;min-width:0}',
    '.mk-btn.big{font-size:1.9rem}',
    '.mk-btn:active:not(:disabled){transform:translateY(4px);box-shadow:0 1px 0 ' + NAVY + '}',
    '.mk-btn:disabled{opacity:.55;cursor:default}',
    '.mk-btn.pick{background:#ffd23f;opacity:1}.mk-btn.good{background:#3ddc97;opacity:1}.mk-btn.bad{background:#ff6b6b;opacity:1}',
    '.mk-cap{font-weight:800;text-align:center;min-height:1.4em}',
    '.mk-grid{display:grid;gap:4px;justify-content:center}',
    '.mk-cookie{font-size:1.7rem;line-height:1.1;text-align:center}.mk-cookie.sm{font-size:1.1rem}',
    '.mk-dot{width:28px;height:28px;border-radius:50%;border:3px solid ' + NAVY + ';background:#ffd23f;box-sizing:border-box}.mk-dot.empty{background:#fff}',
    '.mk-big{font-size:2.4rem;font-weight:900;text-align:center}',
    '.mk-sq{font-size:2.2rem;line-height:1.2;letter-spacing:.1em;text-align:center}',
    '.mk-machine{background:#fff;border:3px solid ' + NAVY + ';border-radius:16px;padding:10px 14px;box-shadow:0 5px 0 ' + NAVY + ';min-width:230px}',
    '.mk-machine h4{margin:0 0 6px;text-align:center;font-size:1rem}',
    '.mk-row{display:flex;justify-content:space-between;gap:16px;font-weight:900;font-size:1.3rem;padding:3px 0;border-top:2px dashed #cbd5e1}',
    '.mk-row.ask{background:#fff3b0;border-radius:8px;padding:3px 8px;margin-top:4px}',
    '.mk-stars{font-size:1.5rem;text-align:center;letter-spacing:.2em}'
  ].join('\n');

  function ensureCss() {
    if (document.getElementById('mk-css')) return;
    var s = document.createElement('style'); s.id = 'mk-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function div(cls, txt) { var d = document.createElement('div'); d.className = cls; if (txt != null) d.textContent = txt; return d; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }

  /* ---- shared picture helpers (return HTML strings built only from numbers / emoji) ---- */
  // r rows x c columns of an emoji
  function arrayHtml(r, c, emoji) {
    var cells = '', i, small = c >= 8 || r >= 8;
    for (i = 0; i < r * c; i++) cells += '<div class="mk-cookie' + (small ? ' sm' : '') + '">' + emoji + '</div>';
    return '<div class="mk-grid" style="grid-template-columns:repeat(' + c + ',auto)">' + cells + '</div>';
  }
  // dots in rows of 5: `filled` solid, rest empty, up to `total`
  function dotsHtml(filled, total) {
    var cells = '', i;
    for (i = 0; i < total; i++) cells += '<div class="mk-dot' + (i < filled ? '' : ' empty') + '"></div>';
    return '<div class="mk-grid" style="grid-template-columns:repeat(' + Math.min(5, total) + ',auto)">' + cells + '</div>';
  }
  // pizza / pie with n equal slices, first k coloured
  function pieHtml(n, k, size) {
    size = size || 120;
    var r = size / 2 - 4, cx = size / 2, cy = size / 2, i, out = '', a0, a1, x0, y0, x1, y1, fill;
    out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + k + ' of ' + n + ' slices coloured">';
    if (n === 1) {
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (k >= 1 ? '#ff6b6b' : '#fff3d6') + '" stroke="' + NAVY + '" stroke-width="3"/>';
    } else {
      for (i = 0; i < n; i++) {
        a0 = -Math.PI / 2 + (2 * Math.PI * i) / n; a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n;
        x0 = cx + r * Math.cos(a0); y0 = cy + r * Math.sin(a0); x1 = cx + r * Math.cos(a1); y1 = cy + r * Math.sin(a1);
        fill = i < k ? '#ff6b6b' : '#fff3d6';
        out += '<path d="M' + cx + ' ' + cy + ' L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' Z" fill="' + fill + '" stroke="' + NAVY + '" stroke-width="3" stroke-linejoin="round"/>';
      }
    }
    return out + '</svg>';
  }

  /* ---- the generic multiple-choice game ---- */
  function normChoices(list) {
    return list.map(function (c) { return (c && typeof c === 'object') ? { v: c.v, label: c.label != null ? c.label : String(c.v) } : { v: c, label: String(c) }; });
  }

  function choiceGame(def) {
    var maxLevel = def.levels.length - 1;
    function lv(l) { return clamp(l | 0 || 1, 1, maxLevel); }

    function makeRound(rng, level, i) {
      var L = lv(level), cfg = def.levels[L], s = def.makeSpec(rng, cfg, L, i);
      s.choices = normChoices(s.choices);
      var hit = s.choices.some(function (c) { return String(c.v) === String(s.answer); });
      if (!hit) throw new Error(def.id + ' level ' + L + ': answer ' + s.answer + ' missing from choices');
      s.durationMs = s.durationMs || cfg.ms || 12000;
      s.level = L;
      return s;
    }

    function create(el, host) {
      ensureCss();
      var st = { spec: null, live: false, startAt: 0, timer: null, btns: [], picked: null, bar: null, cap: null };

      function lock() { st.btns.forEach(function (b) { b.disabled = true; }); }

      function ready(spec) {
        clearInterval(st.timer); el.innerHTML = '';
        st.spec = spec; st.live = false; st.btns = []; st.picked = null;
        MAG._lastSpec = spec;
        var q = div('mk-q', spec.question);
        var vis = div('mk-vis'); if (spec.visual) vis.innerHTML = spec.visual;
        var bar = div('mk-bar'), fill = document.createElement('i'); bar.appendChild(fill); st.bar = bar; st.fill = fill;
        var pad = div('mk-pad');
        pad.style.gridTemplateColumns = 'repeat(' + (spec.cols || Math.min(spec.choices.length, 4)) + ',1fr)';
        spec.choices.forEach(function (c) {
          var b = document.createElement('button'); b.className = 'mk-btn' + (spec.big ? ' big' : ''); b.textContent = c.label; b.disabled = true;
          b.setAttribute('data-v', String(c.v));
          b.addEventListener('click', function () {
            if (!st.live) return;
            st.picked = String(c.v); b.classList.add('pick'); lock(); host.answer(String(c.v) === String(spec.answer));
          });
          pad.appendChild(b); st.btns.push(b);
        });
        st.cap = div('mk-cap', 'Get ready…');
        el.appendChild(q); el.appendChild(vis); el.appendChild(bar); el.appendChild(pad); el.appendChild(st.cap);
      }

      function tick() {
        var sp = st.spec; if (!sp || !st.live) return;
        var left = clamp(1 - (host.now() - st.startAt) / sp.durationMs, 0, 1);
        st.fill.style.width = (left * 100) + '%';
        st.bar.className = 'mk-bar' + (left < 0.25 ? ' low' : '');
        if (left <= 0) { lock(); st.live = false; }
      }

      function go(startAt) {
        st.live = true; st.startAt = startAt;
        st.btns.forEach(function (b) { b.disabled = false; });
        st.cap.textContent = def.prompt || 'Tap the answer!';
        clearInterval(st.timer); st.timer = setInterval(tick, 80); tick();
      }

      function reveal() {
        clearInterval(st.timer); st.live = false; lock();
        var sp = st.spec; if (!sp) return;
        st.btns.forEach(function (b) {
          var v = b.getAttribute('data-v');
          if (v === String(sp.answer)) b.classList.add('good');
          else if (st.picked === v) b.classList.add('bad');
        });
        st.cap.textContent = sp.explain || '';
      }

      function destroy() { clearInterval(st.timer); el.innerHTML = ''; }
      return { ready: ready, go: go, reveal: reveal, destroy: destroy };
    }

    return MAG.register({
      id: def.id, name: def.name, emoji: def.emoji, blurb: def.blurb, grades: def.grades,
      modes: def.modes || ['solo', 'coop', 'versus', 'race'],
      rounds: def.rounds || 10, maxLevel: maxLevel,
      maxDurationMs: def.levels.reduce(function (m, c) { return c && c.ms > m ? c.ms : m; }, 12000),
      levelLabel: function (l) { return def.levels[lv(l)].label; },
      makeRound: makeRound, create: create
    });
  }

  MAG.kit = { choiceGame: choiceGame, arrayHtml: arrayHtml, dotsHtml: dotsHtml, pieHtml: pieHtml, gcd: gcd, clamp: clamp };
})(typeof window !== 'undefined' ? window : globalThis);
