/*! Block Drop Count: subitizing game for Math Adventure (plugin for ma-games.js)
 * A shape of blocks falls one step at a time. Tap the right number before it lands.
 * Levels grow from dice patterns to ten-frames, scattered groups, two colours, and arrays (multiplication).
 * Every player gets a shape at their own level, so a 5-year-old and a 12-year-old can share one game.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames;
  if (!MAG) throw new Error('Load ma-games.js before ma-game-blockcount.js');

  var COLS = 8;
  var PAL = ['#ff6b6b', '#3a86ff', '#ffb703', '#3ddc97'];
  var NAVY = '#1b2a49';
  var COLOR_NAME = ['red', 'blue'];
  var COLOR_EMOJI = ['🟥', '🟦'];

  var DICE = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
  };

  // one row per level; "rows" is board height, stepMs is how long each one-block drop takes
  var LV = [null,
    { kind: 'dice', lo: 1, hi: 3, rows: 7, stepMs: 1300, label: 'Dice patterns 1–3' },
    { kind: 'dice', lo: 1, hi: 6, rows: 7, stepMs: 1200, label: 'Dice patterns 1–6' },
    { kind: 'frame', lo: 1, hi: 10, rows: 7, stepMs: 1100, label: 'Ten-frames' },
    { kind: 'scatter', lo: 3, hi: 9, rows: 8, stepMs: 1000, label: 'Quick groups' },
    { kind: 'scatter', lo: 5, hi: 12, rows: 8, stepMs: 950, label: 'Bigger groups' },
    { kind: 'two', lo: 5, hi: 12, rows: 8, stepMs: 950, ask: 'total', label: 'Two colors: how many in all?' },
    { kind: 'two', lo: 6, hi: 14, rows: 9, stepMs: 900, ask: 'one', label: 'Two colors: count one color' },
    { kind: 'array', lo: 2, hi: 5, rows: 10, stepMs: 900, label: 'Rows and columns' },
    { kind: 'array', lo: 3, hi: 6, rows: 12, stepMs: 800, label: 'Multiplication arrays' }
  ];

  function normalize(cells) {
    var mr = Infinity, mc = Infinity, w = 0, h = 0;
    cells.forEach(function (c) { mr = Math.min(mr, c.r); mc = Math.min(mc, c.c); });
    cells.forEach(function (c) { c.r -= mr; c.c -= mc; w = Math.max(w, c.c + 1); h = Math.max(h, c.r + 1); });
    return { cells: cells, w: w, h: h };
  }

  function scatterCells(rng, n, kFn) {
    var side = Math.ceil(Math.sqrt(n * 1.6)), all = [], r, c;
    for (r = 0; r < side; r++) for (c = 0; c < side; c++) all.push([r, c]);
    return rng.shuffle(all).slice(0, n).map(function (p, i) { return { r: p[0], c: p[1], k: kFn(i) }; });
  }

  function makeRound(rng, level) {
    var cfg = LV[MAG._clampLevel(level)], shape, answer, question = 'How many blocks?', askColor = null, arr = null, lure = null, hiMax = cfg.hi + 3;
    var n, k;
    if (cfg.kind === 'dice') {
      n = rng.int(cfg.lo, cfg.hi); k = rng.int(0, 3);
      shape = normalize(DICE[n].map(function (p) { return { r: p[0], c: p[1], k: k }; })); answer = n;
    } else if (cfg.kind === 'frame') {
      n = rng.int(cfg.lo, cfg.hi); k = rng.int(0, 3); var cells = [], i;
      for (i = 0; i < n; i++) cells.push({ r: Math.floor(i / 5), c: i % 5, k: k });
      shape = normalize(cells); answer = n;
    } else if (cfg.kind === 'scatter') {
      n = rng.int(cfg.lo, cfg.hi); k = rng.int(0, 3);
      shape = normalize(scatterCells(rng, n, function () { return k; })); answer = n;
    } else if (cfg.kind === 'two') {
      n = rng.int(cfg.lo, cfg.hi); var a = rng.int(1, n - 1), colors = [];
      for (i = 0; i < n; i++) colors.push(i < a ? 0 : 1);
      colors = rng.shuffle(colors);
      shape = normalize(scatterCells(rng, n, function (j) { return colors[j]; }));
      if (cfg.ask === 'total') { answer = n; question = 'How many blocks in all?'; }
      else { askColor = rng.int(0, 1); answer = askColor === 0 ? a : n - a; question = 'How many ' + COLOR_EMOJI[askColor] + ' ' + COLOR_NAME[askColor] + ' blocks?'; }
    } else { // array
      var rr = rng.int(cfg.lo, cfg.hi), cc = rng.int(cfg.lo, cfg.hi), cells2 = [], x, y;
      k = rng.int(0, 3);
      for (y = 0; y < rr; y++) for (x = 0; x < cc; x++) cells2.push({ r: y, c: x, k: k });
      shape = normalize(cells2); answer = rr * cc; arr = [rr, cc]; question = 'How many blocks in all?';
      if (rr + cc !== answer) lure = rr + cc; // the classic "I added instead of multiplied" mistake
      hiMax = 40;
    }
    var choices;
    if (cfg.kind === 'dice' || cfg.kind === 'frame') {
      choices = []; for (n = 1; n <= cfg.hi; n++) choices.push(n);
    } else {
      choices = MAG.numberChoices(rng, answer, 4, 1, hiMax);
      if (lure && choices.indexOf(lure) < 0) {
        var idx = []; choices.forEach(function (v, j) { if (v !== answer) idx.push(j); });
        choices[rng.pick(idx)] = lure; choices.sort(function (p, q) { return p - q; });
      }
    }
    var rows = Math.max(cfg.rows, shape.h + 4), steps = rows - shape.h;
    return {
      cells: shape.cells, w: shape.w, h: shape.h, rows: rows, cols: COLS, steps: steps, stepMs: cfg.stepMs,
      durationMs: steps * cfg.stepMs, answer: answer, question: question, choices: choices, askColor: askColor, arr: arr
    };
  }

  MAG._clampLevel = function (l) { return Math.max(1, Math.min(LV.length - 1, l | 0 || 1)); };

  /* ---------------- view ---------------- */
  var CSS = [
    '.bc-q{font-weight:900;font-size:1.35rem;text-align:center;min-height:1.6em}',
    '.bc-board{position:relative;background:#fff;border:3px solid ' + NAVY + ';border-bottom-width:10px;border-radius:14px;overflow:hidden;max-width:100%}',
    '.bc-shape{position:absolute;top:0;transition:transform .28s cubic-bezier(.3,1.4,.5,1)}',
    '.bc-shape.land{animation:bc-squish .35s ease-out}',
    '.bc-block{position:absolute;border:3px solid ' + NAVY + ';border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:.9rem;text-shadow:0 1px 0 ' + NAVY + ';box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.35)}',
    '.bc-pad{display:grid;gap:10px;width:100%;max-width:420px}',
    '.bc-btn{font:inherit;font-weight:900;font-size:1.6rem;padding:12px 0;border-radius:16px;border:3px solid ' + NAVY + ';background:#fff;color:' + NAVY + ';box-shadow:0 5px 0 ' + NAVY + ';cursor:pointer;touch-action:manipulation}',
    '.bc-btn:active:not(:disabled){transform:translateY(4px);box-shadow:0 1px 0 ' + NAVY + '}',
    '.bc-btn:disabled{opacity:.55;cursor:default}',
    '.bc-btn.pick{background:#ffd23f;opacity:1}.bc-btn.good{background:#3ddc97;opacity:1}.bc-btn.bad{background:#ff6b6b;opacity:1}',
    '.bc-cap{font-weight:800;text-align:center;min-height:1.4em}',
    '@keyframes bc-squish{0%{transform:translateY(var(--y)) scale(1,1)}40%{transform:translateY(var(--y)) scale(1.08,.88)}100%{transform:translateY(var(--y)) scale(1,1)}}'
  ].join('\n');

  function div(cls) { var d = document.createElement('div'); d.className = cls; return d; }

  function create(el, host) {
    if (!document.getElementById('bc-css')) {
      var s = document.createElement('style'); s.id = 'bc-css'; s.textContent = CSS; document.head.appendChild(s);
    }
    var st = { spec: null, live: false, startAt: 0, step: 0, timer: null, btns: [], blocks: [], shape: null, cs: 30, cap: null, picked: null };

    function lock() { st.btns.forEach(function (b) { b.disabled = true; }); }

    function ready(spec) {
      clearInterval(st.timer); el.innerHTML = '';
      st.spec = spec; st.live = false; st.step = 0; st.btns = []; st.blocks = []; st.picked = null;
      var cs = Math.floor(Math.min(el.clientWidth || 320, 380) / spec.cols);
      cs = Math.max(18, Math.min(cs, 44, Math.floor(root.innerHeight * 0.38 / spec.rows)));
      st.cs = cs;
      var q = div('bc-q'); q.textContent = spec.question;
      var board = div('bc-board'); board.style.width = cs * spec.cols + 6 + 'px'; board.style.height = cs * spec.rows + 'px';
      var shape = div('bc-shape'); shape.style.width = spec.w * cs + 'px'; shape.style.height = spec.h * cs + 'px';
      shape.style.left = Math.floor((spec.cols - spec.w) / 2) * cs + 'px'; shape.style.setProperty('--y', '0px');
      spec.cells.forEach(function (c) {
        var b = div('bc-block');
        b.style.cssText = 'left:' + c.c * cs + 'px;top:' + c.r * cs + 'px;width:' + (cs - 2) + 'px;height:' + (cs - 2) + 'px;background:' + PAL[c.k];
        shape.appendChild(b); st.blocks.push(b);
      });
      board.appendChild(shape); st.shape = shape;
      var pad = div('bc-pad'); pad.style.gridTemplateColumns = 'repeat(' + Math.min(spec.choices.length, 5) + ',1fr)';
      spec.choices.forEach(function (v) {
        var b = document.createElement('button'); b.className = 'bc-btn'; b.textContent = v; b.disabled = true;
        b.addEventListener('click', function () {
          if (!st.live) return;
          st.picked = v; b.classList.add('pick'); lock(); host.answer(v === spec.answer);
        });
        pad.appendChild(b); st.btns.push(b);
      });
      st.cap = div('bc-cap'); st.cap.textContent = 'Get ready…';
      el.appendChild(q); el.appendChild(board); el.appendChild(pad); el.appendChild(st.cap);
    }

    function tick() {
      var sp = st.spec; if (!sp || !st.live) return;
      var s = Math.max(0, Math.min(sp.steps, Math.floor((host.now() - st.startAt) / sp.stepMs)));
      if (s === st.step) return;
      st.step = s;
      var y = s * st.cs + 'px';
      st.shape.style.setProperty('--y', y); st.shape.style.transform = 'translateY(' + y + ')';
      if (s < sp.steps) host.sfx.step();
      else { st.shape.classList.add('land'); lock(); st.live = false; }
    }

    function go(startAt) {
      st.live = true; st.startAt = startAt;
      st.btns.forEach(function (b) { b.disabled = false; });
      st.cap.textContent = 'Tap the number before it lands!';
      clearInterval(st.timer); st.timer = setInterval(tick, 80); tick();
    }

    function reveal(info) {
      clearInterval(st.timer); st.live = false; lock();
      var sp = st.spec; if (!sp) return;
      st.btns.forEach(function (b) {
        var v = parseInt(b.textContent, 10);
        if (v === sp.answer) b.classList.add('good');
        else if (st.picked === v) b.classList.add('bad');
      });
      var counted = [];
      sp.cells.forEach(function (c, i) { if (sp.askColor == null || c.k === sp.askColor) counted.push(i); });
      counted.forEach(function (bi, n) {
        setTimeout(function () { if (st.blocks[bi] && el.contains(st.blocks[bi])) st.blocks[bi].textContent = n + 1; }, n * 60);
      });
      st.cap.textContent = sp.arr ? sp.arr[0] + ' × ' + sp.arr[1] + ' = ' + sp.answer : 'There were ' + sp.answer + '!';
    }

    function destroy() { clearInterval(st.timer); el.innerHTML = ''; }

    return { ready: ready, go: go, reveal: reveal, destroy: destroy };
  }

  MAG.register({
    id: 'blockcount',
    name: 'Block Drop Count',
    emoji: '🧱',
    blurb: 'Count the falling blocks before they land',
    grades: 'Pre-K to Grade 3',
    modes: ['solo', 'coop', 'versus', 'race'],
    rounds: 10,
    maxLevel: LV.length - 1,
    maxDurationMs: 12000,
    levelLabel: function (l) { return LV[MAG._clampLevel(l)].label; },
    makeRound: makeRound,
    create: create
  });
})(typeof window !== 'undefined' ? window : globalThis);
