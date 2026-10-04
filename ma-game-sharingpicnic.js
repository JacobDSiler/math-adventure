/*! Sharing Picnic: fair sharing and division for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Share snacks fairly between friends, group them onto plates, and spot what is left over.
 * App topics: division, multiplication.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-sharingpicnic.js');

  var FOODS = [['🍓', 'strawberries'], ['🍪', 'cookies'], ['🍎', 'apples'], ['🧁', 'cupcakes'], ['🍇', 'grapes']];
  var LV = [null,
    { label: 'Share between 2 (up to 10)', kind: 'share', fr: [2], each: [1, 5], ms: 25000 },
    { label: 'Share between 2, 3 or 4', kind: 'share', fr: [2, 3, 4], each: [1, 5], ms: 24000 },
    { label: 'Share between up to 5', kind: 'share', fr: [2, 3, 4, 5], each: [2, 6], ms: 22000 },
    { label: 'How many plates?', kind: 'groups', fr: [2, 3, 4, 5], each: [2, 6], ms: 22000 },
    { label: 'Leftovers: how many left over?', kind: 'remainder', fr: [2, 3, 4, 5], each: [1, 5], ms: 24000 },
    { label: 'Bigger sharing (to 10 each)', kind: 'share', fr: [3, 4, 5, 6, 7, 8, 9], each: [3, 10], ms: 22000 }
  ];

  function pile(emoji, n) { var s = '', i; for (i = 0; i < n; i++) s += '<span style="font-size:1.5rem">' + emoji + '</span>'; return '<div style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center;max-width:300px">' + s + '</div>'; }

  K.choiceGame({
    id: 'sharingpicnic',
    name: 'Sharing Picnic',
    emoji: '🧺',
    blurb: 'Share the snacks fairly with your friends',
    grades: 'Grade 1 to 4',
    prompt: 'Tap the answer',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var f = rng.pick(FOODS), friends = rng.pick(cfg.fr), each = rng.int(cfg.each[0], cfg.each[1]), total = friends * each, ch, ans, q, expl, vis;
      if (cfg.kind === 'share') {
        ans = each; q = total + ' ' + f[1] + ' shared fairly between ' + friends + ' friends. How many does each friend get?';
        vis = pile(f[0], total) + '<div class="mk-big">→ ' + friends + ' 🧒</div>'; expl = total + ' ÷ ' + friends + ' = ' + each + ', because ' + each + ' × ' + friends + ' = ' + total;
        ch = MAG.numberChoices(rng, ans, 4, 1, Math.max(8, ans + 3));
      } else if (cfg.kind === 'groups') {
        ans = friends; q = total + ' ' + f[1] + ', ' + each + ' on each plate. How many plates?';
        vis = pile(f[0], total); expl = total + ' ÷ ' + each + ' = ' + friends + ' plates';
        ch = MAG.numberChoices(rng, ans, 4, 1, Math.max(8, ans + 3));
      } else {
        var left = rng.int(1, friends - 1), t2 = total + left;
        ans = left; q = t2 + ' ' + f[1] + ' shared between ' + friends + ' friends. How many are left over?';
        vis = pile(f[0], t2) + '<div class="mk-big">→ ' + friends + ' 🧒</div>'; expl = friends + ' × ' + each + ' = ' + total + ', and ' + t2 + ' − ' + total + ' = ' + left + ' left over';
        ch = MAG.numberChoices(rng, ans, Math.min(4, friends + 1), 0, Math.max(friends, 4));
      }
      return { question: q, visual: vis, choices: ch, answer: ans, big: true, explain: expl };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
