/*! Pizza Parlour: fractions for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Read, compare and add fractions using pizzas. Levels grow from halves to adding unlike fractions.
 * App topics: fractions_intro, fractions.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-pizzaparlour.js');

  var LV = [null,
    { label: 'Halves and quarters', kind: 'read', dens: [2, 4], ms: 14000 },
    { label: 'Thirds to eighths', kind: 'read', dens: [2, 3, 4, 5, 6, 8], ms: 14000 },
    { label: 'Which pizza has more?', kind: 'compare', dens: [2, 3, 4, 6, 8], ms: 15000 },
    { label: 'Matching fractions', kind: 'equiv', ms: 16000 },
    { label: 'Fraction of a group', kind: 'group', ms: 16000 },
    { label: 'Add: same bottoms', kind: 'addsame', dens: [4, 5, 6, 8, 10], ms: 18000 },
    { label: 'Add: different bottoms', kind: 'addunlike', ms: 22000 }
  ];

  function f(k, n) { return k + '/' + n; }
  function pickDistinct(rng, correct, pool, n) {
    var seen = {}; seen[correct] = 1;
    var out = [correct];
    rng.shuffle(pool).forEach(function (p) { if (out.length < n && !seen[p]) { seen[p] = 1; out.push(p); } });
    return out;
  }
  function fracChoices(rng, k, n, extra) {
    var pool = [f(n - k, n), f(k + 1 <= n ? k + 1 : k - 1, n), f(k, n + 1), f(k, n + 2), f(k, n > 2 ? n - 1 : n + 3), f(n, k)];
    (extra || []).forEach(function (e) { pool.unshift(e); });
    pool = pool.filter(function (s) { var p = s.split('/'); return +p[0] >= 1 && +p[1] >= 2 && +p[0] <= +p[1]; });
    return rng.shuffle(pickDistinct(rng, f(k, n), pool, 4));
  }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  K.choiceGame({
    id: 'pizzaparlour',
    name: 'Pizza Parlour',
    emoji: '🍕',
    blurb: 'Read, compare and add fractions with pizzas',
    grades: 'Grade 1 to 6',
    prompt: 'Which one is it?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var n, k, a, b, ans, ch, vis, g, q, expl, i;
      if (cfg.kind === 'read') {
        n = rng.pick(cfg.dens); k = rng.int(1, n - 1);
        return {
          question: 'What fraction of the pizza is red?', visual: K.pieHtml(n, k, 150),
          choices: fracChoices(rng, k, n), answer: f(k, n), big: true,
          explain: k + ' of the ' + n + ' slices are red, so it is ' + f(k, n)
        };
      }
      if (cfg.kind === 'compare') {
        var n1 = rng.pick(cfg.dens), n2 = rng.pick(cfg.dens), k1 = rng.int(1, n1 - 1), k2 = rng.int(1, n2 - 1);
        if (rng.int(0, 4) === 0) { n2 = n1 * 2 > 8 ? n1 : n1 * 2; k2 = k1 * (n2 / n1); } // sometimes equal
        var v1 = k1 / n1, v2 = k2 / n2;
        ans = Math.abs(v1 - v2) < 1e-9 ? 'Same' : (v1 > v2 ? 'Left' : 'Right');
        return {
          question: 'Which pizza has more red?',
          visual: K.pieHtml(n1, k1, 120) + K.pieHtml(n2, k2, 120),
          choices: ['Left', 'Same', 'Right'], answer: ans, cols: 3,
          explain: f(k1, n1) + ' and ' + f(k2, n2) + (ans === 'Same' ? ' are equal' : ': ' + ans.toLowerCase() + ' is bigger')
        };
      }
      if (cfg.kind === 'equiv') {
        var base = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5]]), m = rng.int(2, 4);
        k = base[0]; n = base[1]; ans = k * m;
        return {
          question: f(k, n) + ' = ?/' + (n * m),
          visual: K.pieHtml(n, k, 110) + '<div class="mk-big">=</div>' + K.pieHtml(n * m, k * m, 110),
          choices: MAG.numberChoices(rng, ans, 4, 1, n * m), answer: ans, big: true,
          explain: 'Multiply top and bottom by ' + m + ': ' + f(k, n) + ' = ' + f(k * m, n * m)
        };
      }
      if (cfg.kind === 'group') {
        n = rng.pick([2, 3, 4, 5]); k = rng.int(1, n - 1); var each = rng.int(2, 5), total = n * each;
        ans = k * each; vis = '';
        for (i = 0; i < total; i++) vis += '<span style="font-size:1.4rem">' + (i < ans ? '🍕' : '⚪') + '</span>';
        return {
          question: f(k, n) + ' of ' + total + ' = ?', visual: '<div class="mk-sq">' + vis + '</div>',
          choices: MAG.numberChoices(rng, ans, 4, 1, total), answer: ans, big: true,
          explain: total + ' ÷ ' + n + ' = ' + each + ', then × ' + k + ' = ' + ans
        };
      }
      if (cfg.kind === 'addsame') {
        n = rng.pick(cfg.dens); a = rng.int(1, n - 2); b = rng.int(1, n - 1 - a);
        return {
          question: f(a, n) + ' + ' + f(b, n) + ' = ?',
          visual: K.pieHtml(n, a, 100) + '<div class="mk-big">+</div>' + K.pieHtml(n, b, 100),
          choices: fracChoices(rng, a + b, n, [f(a + b, n * 2)]), answer: f(a + b, n), big: true,
          explain: 'Same bottoms: add the tops, ' + a + ' + ' + b + ' = ' + (a + b) + ', so ' + f(a + b, n)
        };
      }
      // addunlike: one denominator is a multiple of the other
      var d1 = rng.pick([2, 3, 4, 5]), mult = rng.int(2, 3), d2 = d1 * mult;
      var n1b = 1, n2b = rng.int(1, d2 - mult - 1);
      var num = n1b * mult + n2b, den = d2, gg = K.gcd(num, den);
      var rn = num / gg, rd = den / gg;
      var wrong = [f(n1b + n2b, d1 + d2), f(n1b + n2b, d2), f(n1b + n2b, d1)].filter(function (s) { return s !== f(rn, rd); });
      var pool2 = wrong.concat([f(rn + 1, rd), f(rn, rd + 1)]).filter(function (s) { var p = s.split('/'); return +p[0] < +p[1]; });
      return {
        question: f(n1b, d1) + ' + ' + f(n2b, d2) + ' = ?',
        visual: K.pieHtml(d1, n1b, 100) + '<div class="mk-big">+</div>' + K.pieHtml(d2, n2b, 100),
        choices: rng.shuffle(pickDistinct(rng, f(rn, rd), pool2, 4)), answer: f(rn, rd), big: true,
        explain: f(n1b, d1) + ' = ' + f(n1b * mult, d2) + ', so ' + f(n1b * mult, d2) + ' + ' + f(n2b, d2) + ' = ' + f(num, den) + (gg > 1 ? ' = ' + f(rn, rd) : '')
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
