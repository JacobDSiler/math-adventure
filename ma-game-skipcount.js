/*! Skip Count Stepping Stones: counting by 2s, 5s, 10s... for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Hop across the stones and fill in the missing one.
 * App topics: skip_counting, multiplication.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-skipcount.js');

  var LV = [null,
    { label: 'Count by 2s', steps: [2], start: 'step', pos: [4], ms: 24000 },
    { label: 'Count by 10s and 5s', steps: [10, 5], start: 'step', pos: [4], ms: 22000 },
    { label: 'Missing stone in the middle', steps: [2, 5, 10], start: 'step', pos: [2, 3], ms: 22000 },
    { label: 'Count by 3s and 4s', steps: [3, 4], start: 'step', pos: [2, 3, 4], ms: 22000 },
    { label: 'Start anywhere (2s, 5s, 10s)', steps: [2, 5, 10], start: 'any', pos: [1, 2, 3, 4], ms: 20000 },
    { label: 'Big steps: 6, 7, 8, 9, 25, 100', steps: [6, 7, 8, 9, 25, 100], start: 'step', pos: [2, 3, 4], ms: 20000 },
    { label: 'Count back', steps: [-2, -3, -5, -10], start: 'back', pos: [2, 3, 4], ms: 20000 }
  ];

  function stones(terms, hide) {
    var h = '';
    terms.forEach(function (t, i) {
      h += '<div style="width:52px;height:52px;border-radius:50%;background:' + (i === hide ? '#ffd23f' : '#cfe9ff') + ';border:3px solid #1b2a49;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:' + (String(t).length > 3 ? '.95rem' : '1.2rem') + '">' + (i === hide ? '?' : t) + '</div>';
    });
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">' + h + '</div>';
  }

  K.choiceGame({
    id: 'skipcount',
    name: 'Skip Count Stepping Stones',
    emoji: '🪨',
    blurb: 'Hop across the stones: what number is missing?',
    grades: 'Grade 1 to 4',
    prompt: 'Which number is on the missing stone?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var step = rng.pick(cfg.steps), abs = Math.abs(step), s0, i, terms = [];
      if (cfg.start === 'step') s0 = abs * rng.int(1, 5);
      else if (cfg.start === 'any') s0 = rng.int(1, 30);
      else s0 = abs * 5 + rng.int(0, 10) * 1;
      for (i = 0; i < 6; i++) terms.push(s0 + step * i);
      var hide = rng.pick(cfg.pos), ans = terms[hide];
      var alt = [ans + abs, ans - abs, ans + 1, ans - 1, ans + 2, ans + abs * 2].filter(function (v, i, a) { return v !== ans && v >= 0 && a.indexOf(v) === i; });
      var ch = [ans].concat(rng.shuffle(alt).slice(0, 3)).sort(function (a, b) { return a - b; });
      return {
        question: 'Count ' + (step > 0 ? 'on' : 'back') + ' by ' + abs + 's', visual: stones(terms, hide), choices: ch, answer: ans, big: true,
        explain: 'Each stone is ' + (step > 0 ? '+' : '−') + abs + ': ' + terms[hide - 1] + (step > 0 ? ' + ' : ' − ') + abs + ' = ' + ans
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
