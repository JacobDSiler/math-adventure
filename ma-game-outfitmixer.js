/*! Outfit Mixer: counting combinations for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * How many different outfits can you make? The first step into combinatorics (multiplication principle).
 * App topics: multiplication, logic_combo.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-outfitmixer.js');

  var SETS = {
    tops: { name: 'tops', one: 'top', items: ['👕', '👚', '🧥', '👔', '🎽'] },
    bottoms: { name: 'bottoms', one: 'bottom', items: ['👖', '🩳', '👗', '🩱', '🧦'] },
    hats: { name: 'hats', one: 'hat', items: ['🧢', '👒', '🎩', '⛑️', '👑'] },
    cones: { name: 'cones', one: 'cone', items: ['🍦', '🧇', '🥐', '🍩', '🥯'] },
    flavours: { name: 'flavours', one: 'flavour', items: ['🍓', '🍫', '🍋', '🍇', '🥭'] },
    toppings: { name: 'toppings', one: 'topping', items: ['🍒', '🌈', '🥜', '🍬', '🍪'] }
  };
  var LV = [null,
    { label: '2 sets: small (up to 3 each)', groups: [['tops', 'bottoms']], lo: 1, hi: 3, ms: 25000 },
    { label: '2 sets: up to 5 each', groups: [['tops', 'bottoms'], ['cones', 'flavours']], lo: 2, hi: 5, ms: 22000 },
    { label: '3 sets: tiny', groups: [['hats', 'tops', 'bottoms'], ['cones', 'flavours', 'toppings']], lo: 1, hi: 2, three: true, ms: 24000 },
    { label: '3 sets: a little bigger', groups: [['hats', 'tops', 'bottoms'], ['cones', 'flavours', 'toppings']], lo: 2, hi: 3, three: true, ms: 24000 },
    { label: 'Missing set: how many tops?', groups: [['tops', 'bottoms'], ['cones', 'flavours']], lo: 2, hi: 6, missing: true, ms: 22000 }
  ];

  function row(set, n) { return '<div style="display:flex;gap:4px;align-items:center;justify-content:center"><b style="min-width:70px;text-align:right">' + n + ' ' + (n === 1 ? set.one : set.name) + '</b><span style="font-size:1.7rem">' + set.items.slice(0, n).join('') + '</span></div>'; }

  K.choiceGame({
    id: 'outfitmixer',
    name: 'Outfit Mixer',
    emoji: '👗',
    blurb: 'How many different outfits can you make?',
    grades: 'Grade 1 to 6',
    prompt: 'How many ways?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var g = rng.pick(cfg.groups).map(function (k) { return SETS[k]; }), nums = g.map(function () { return rng.int(cfg.lo, cfg.hi); }), prod = 1, i, vis = '';
      nums.forEach(function (n) { prod *= n; });
      if (cfg.missing) {
        var given = nums[1], hidden = nums[0], total = hidden * given;
        vis = '<div style="display:flex;flex-direction:column;gap:6px">' + '<div style="font-weight:900;text-align:center">❓ ' + g[0].name + '</div>' + row(g[1], given) + '</div>';
        return {
          question: 'There are ' + total + ' different outfits and ' + given + ' ' + (given === 1 ? g[1].one : g[1].name) + '. How many ' + g[0].name + '?',
          visual: vis, choices: MAG.numberChoices(rng, hidden, 4, 1, 8), answer: hidden, big: true,
          explain: hidden + ' × ' + given + ' = ' + total + ', so ' + total + ' ÷ ' + given + ' = ' + hidden
        };
      }
      g.forEach(function (s, j) { vis += row(s, nums[j]); });
      var hi = prod + 4, ch = MAG.numberChoices(rng, prod, 4, Math.max(1, prod - 4), hi);
      var sum = nums.reduce(function (a, b) { return a + b; }, 0);
      if (sum !== prod && ch.indexOf(sum) < 0) { var idx = []; ch.forEach(function (v, j) { if (v !== prod) idx.push(j); }); ch[rng.pick(idx)] = sum; ch.sort(function (a, b) { return a - b; }); }
      return {
        question: 'Pick one of each. How many different outfits?',
        visual: '<div style="display:flex;flex-direction:column;gap:6px">' + vis + '</div>', choices: ch, answer: prod, big: true,
        explain: nums.join(' × ') + ' = ' + prod + ' (each choice pairs with every other choice)'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
