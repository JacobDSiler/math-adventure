/*! Bigger or Smaller: comparing numbers for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * App topics: counting, place_value_10, place_value.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-biggersmaller.js');

  var LV = [null,
    { label: 'Which has more? (to 5)', kind: 'dots', max: 5, ms: 25000 },
    { label: 'Which has more? (to 10)', kind: 'dots', max: 10, ms: 22000 },
    { label: 'Bigger number (to 10)', kind: 'num', max: 10, ms: 20000 },
    { label: 'Bigger or smaller (to 20)', kind: 'num', max: 20, both: true, ms: 20000 },
    { label: 'Bigger or smaller (to 100)', kind: 'num', max: 100, both: true, ms: 18000 },
    { label: 'Bigger or smaller (to 1000)', kind: 'num', max: 1000, both: true, ms: 18000 }
  ];

  K.choiceGame({
    id: 'biggersmaller',
    name: 'Bigger or Smaller',
    emoji: '⚖️',
    blurb: 'Which number is bigger? Which is smaller?',
    grades: 'Preschool to Grade 3',
    prompt: 'Tap your choice',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var a = rng.int(1, cfg.max), b = rng.int(1, cfg.max), i, g = '';
      while (b === a) b = rng.int(1, cfg.max);
      if (cfg.kind === 'dots') {
        var side = function (n) { var s = ''; for (i = 0; i < n; i++) s += '<span style="font-size:1.6rem">🍪</span>'; return '<div style="display:flex;flex-wrap:wrap;gap:2px;width:140px;justify-content:center;padding:8px;border:3px dashed #1b2a49;border-radius:14px">' + s + '</div>'; };
        var ans = a > b ? 'Left' : 'Right';
        return { question: 'Which plate has more?', visual: side(a) + side(b), choices: ['Left', 'Right'], answer: ans, cols: 2,
          explain: Math.max(a, b) + ' is more than ' + Math.min(a, b) };
      }
      var bigger = cfg.both ? rng.int(0, 1) === 0 : true, target = bigger ? Math.max(a, b) : Math.min(a, b);
      return {
        question: bigger ? 'Which number is BIGGER?' : 'Which number is SMALLER?',
        visual: '', choices: [a, b].sort(function (x, y) { return x - y; }), answer: target, cols: 2, big: true,
        explain: Math.max(a, b) + ' is bigger than ' + Math.min(a, b)
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
