/*! Fruit Basket Count: gentle counting for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Count fruit in the basket. Long timers, small numbers first, friendly hints.
 * App topics: counting, addition_basic.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-fruitbasket.js');

  var FRUITS = ['🍎', '🍌', '🍓', '🍊', '🍇', '🍐'];
  var LV = [null,
    { label: 'Count to 5', max: 5, lo: 1, kind: 'one', ms: 25000, nch: 3 },
    { label: 'Count to 10', max: 10, lo: 3, kind: 'one', ms: 25000, nch: 3 },
    { label: 'Count to 15', max: 15, lo: 8, kind: 'one', ms: 25000, nch: 4 },
    { label: 'Count to 20', max: 20, lo: 11, kind: 'one', ms: 25000, nch: 4 },
    { label: 'Count just the apples', max: 10, lo: 2, kind: 'mixed', ms: 25000, nch: 4 },
    { label: 'How many in all?', max: 10, lo: 4, kind: 'two', ms: 25000, nch: 4 }
  ];

  function pile(list) {
    var h = '';
    list.forEach(function (f) { h += '<span style="font-size:2rem;line-height:1.15">' + f + '</span>'; });
    return '<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:300px">' + h + '</div>';
  }

  K.choiceGame({
    id: 'fruitbasket',
    name: 'Fruit Basket Count',
    emoji: '🧺',
    blurb: 'Count the fruit in the basket',
    grades: 'Preschool to Grade 1',
    prompt: 'Tap the number. Take your time!',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var fr = rng.shuffle(FRUITS), n, ans, i, list = [], q, expl;
      if (cfg.kind === 'one') {
        n = rng.int(cfg.lo, cfg.max); ans = n;
        for (i = 0; i < n; i++) list.push(fr[0]);
        q = 'How many ' + fr[0] + ' are in the basket?'; expl = 'Count them one by one: ' + n;
      } else if (cfg.kind === 'mixed') {
        ans = rng.int(cfg.lo, cfg.max - 3); var other = rng.int(2, cfg.max - ans);
        for (i = 0; i < ans; i++) list.push('🍎');
        for (i = 0; i < other; i++) list.push(rng.pick(['🍌', '🍊', '🍇']));
        list = rng.shuffle(list);
        q = 'How many 🍎 can you see?'; expl = 'There are ' + ans + ' apples (and ' + other + ' other fruits)';
      } else {
        var a = rng.int(1, 5), b = rng.int(1, cfg.max - a > 5 ? 5 : cfg.max - a);
        ans = a + b;
        for (i = 0; i < a; i++) list.push(fr[0]);
        for (i = 0; i < b; i++) list.push(fr[1]);
        q = 'How many fruits in all?'; expl = a + ' ' + fr[0] + ' and ' + b + ' ' + fr[1] + ' make ' + ans;
      }
      var ch = MAG.numberChoices(rng, ans, cfg.nch, Math.max(1, ans - 3), ans + 3);
      return { question: q, visual: pile(list), choices: ch, answer: ans, explain: expl, big: true };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
