/*! Cookie Trays: times tables and division for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Rows and columns of cookies build the idea of multiplication; later levels drop the picture and
 * turn it around into "? x 6 = 42" and fair sharing.
 * App topics: multiplication, division, skip_counting, mental_math.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-cookietrays.js');

  var COOKIE = '🍪';
  // kind: array (picture), plain (symbols only), missing (? x n = p), share (sharing words)
  var LV = [null,
    { label: 'Pairs: x2 (picture)', kind: 'array', tables: [2], rMin: 1, rMax: 5, ms: 14000 },
    { label: 'Fives and tens (picture)', kind: 'array', tables: [5, 10], rMin: 2, rMax: 5, ms: 14000 },
    { label: 'Threes and fours (picture)', kind: 'array', tables: [3, 4], rMin: 2, rMax: 5, ms: 14000 },
    { label: 'Up to x5 (picture)', kind: 'array', tables: [2, 3, 4, 5], rMin: 2, rMax: 6, ms: 14000 },
    { label: 'Sixes to nines', kind: 'plain', tables: [6, 7, 8, 9], rMin: 2, rMax: 9, ms: 12000 },
    { label: 'Missing number: ? x 6 = 42', kind: 'missing', tables: [2, 3, 4, 5, 6, 7, 8, 9], rMin: 2, rMax: 9, ms: 14000 },
    { label: 'Fair sharing (division)', kind: 'share', tables: [2, 3, 4, 5, 6, 7, 8, 9], rMin: 2, rMax: 9, ms: 16000 }
  ];

  K.choiceGame({
    id: 'cookietrays',
    name: 'Cookie Trays',
    emoji: '🍪',
    blurb: 'Fill the trays: times tables and sharing',
    grades: 'Grade 1 to 5',
    prompt: 'How many? Tap the answer!',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var c = rng.pick(cfg.tables), r = rng.int(cfg.rMin, cfg.rMax), p = r * c, lure = r + c, q, vis = '', expl, ans, lo = 1, hi = 100;
      if (cfg.kind === 'array') {
        q = 'How many cookies in all?'; vis = K.arrayHtml(r, c, COOKIE); ans = p;
        expl = r + ' rows of ' + c + ' = ' + r + ' × ' + c + ' = ' + p;
      } else if (cfg.kind === 'plain') {
        if (rng.int(0, 1)) { var t = r; r = c; c = t; }
        q = r + ' × ' + c + ' = ?'; ans = p; lure = r + c;
        expl = r + ' × ' + c + ' = ' + p;
      } else if (cfg.kind === 'missing') {
        q = '? × ' + c + ' = ' + p; ans = r; lure = p - c; lo = 1; hi = 12;
        expl = r + ' × ' + c + ' = ' + p + ', so ' + p + ' ÷ ' + c + ' = ' + r;
      } else { // share
        q = p + ' cookies shared fairly onto ' + c + ' trays. How many on each tray?'; ans = r; lure = p - c; lo = 1; hi = 12;
        vis = '<div class="mk-big">' + COOKIE + ' × ' + p + ' → ' + c + ' trays</div>';
        expl = p + ' ÷ ' + c + ' = ' + r + ', because ' + r + ' × ' + c + ' = ' + p;
      }
      var ch = MAG.numberChoices(rng, ans, 4, lo, hi);
      if (lure !== ans && lure >= lo && lure <= hi && ch.indexOf(lure) < 0) {
        var idx = []; ch.forEach(function (v, j) { if (v !== ans) idx.push(j); });
        ch[rng.pick(idx)] = lure; ch.sort(function (x, y) { return x - y; });
      }
      return { question: q, visual: vis, choices: ch, answer: ans, explain: expl, big: true };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
