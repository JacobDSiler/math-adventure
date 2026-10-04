/*! Ten Pairs: number bonds for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * "7 + ? = 10". Starts with pictures and 5, grows to 10, 20 and 100.
 * App topics: addition_basic, subtraction_basic, addition, mental_math.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-tenpairs.js');

  var LV = [null,
    { label: 'Make 5 (with dots)', target: 5, lo: 1, hi: 4, pic: true, ms: 12000 },
    { label: 'Make 10 (with dots)', target: 10, lo: 1, hi: 9, pic: true, ms: 12000 },
    { label: 'Make 10', target: 10, lo: 1, hi: 9, pic: false, ms: 10000 },
    { label: 'Make 20 with a ten', target: 20, lo: 11, hi: 19, pic: false, ms: 11000 },
    { label: 'Make 20', target: 20, lo: 1, hi: 19, pic: false, ms: 11000 },
    { label: 'Make 100 with tens', target: 100, lo: 10, hi: 90, step: 10, pic: false, ms: 12000 },
    { label: 'Make 100', target: 100, lo: 1, hi: 99, pic: false, ms: 14000 }
  ];

  function choicesFor(rng, cfg, a, b) {
    var out;
    if (cfg.step) {
      var pool = [];
      [-30, -20, -10, 10, 20, 30].forEach(function (d) { var v = b + d; if (v >= 10 && v <= 90) pool.push(v); });
      out = [b].concat(rng.shuffle(pool).slice(0, 3));
      return out.sort(function (x, y) { return x - y; });
    }
    out = MAG.numberChoices(rng, b, 4, 1, cfg.target - 1);
    // the classic slip: answering with the number you were given
    if (a !== b && out.indexOf(a) < 0 && cfg.target <= 20) {
      var idx = []; out.forEach(function (v, j) { if (v !== b) idx.push(j); });
      out[rng.pick(idx)] = a; out.sort(function (x, y) { return x - y; });
    }
    return out;
  }

  K.choiceGame({
    id: 'tenpairs',
    name: 'Ten Pairs',
    emoji: '\uD83C\uDF88',
    blurb: 'Find the partner that makes the total',
    grades: 'K to Grade 3',
    prompt: 'Which number finishes the pair?',
    levels: LV,
    makeSpec: function (rng, cfg, level) {
      var a = cfg.step ? rng.int(cfg.lo / 10, cfg.hi / 10) * 10 : rng.int(cfg.lo, cfg.hi);
      var b = cfg.target - a, T = cfg.target, flip = rng.int(0, 1) === 1;
      return {
        question: flip ? '? + ' + a + ' = ' + T : a + ' + ? = ' + T,
        visual: cfg.pic ? K.dotsHtml(a, T) : '',
        choices: choicesFor(rng, cfg, a, b),
        answer: b,
        explain: a + ' + ' + b + ' = ' + T,
        big: true
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
