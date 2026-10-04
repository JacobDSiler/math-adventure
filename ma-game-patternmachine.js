/*! Pattern Machine: patterns, sequences and function machines for Math Adventure
 * (plugin for ma-games.js + ma-game-kit.js)
 * Spot the rule in a colour pattern or number sequence, then find what a machine does to a number.
 * The machine levels are the first step towards algebra and the "Function Machines" applied game.
 * App topics: logic_combo, skip_counting, sequences, algebra_intro.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-patternmachine.js');

  var ICONS = ['🔴', '🔵', '🟢', '🟡', '⭐', '🌙', '🍎', '🍌'];

  var LV = [null,
    { label: 'Colour patterns: AB', kind: 'icons', unit: ['AB'], show: 5, ms: 12000 },
    { label: 'Colour patterns: ABC and AAB', kind: 'icons', unit: ['AAB', 'ABB', 'ABC'], show: 7, ms: 14000 },
    { label: 'Count on: 1s, 2s, 5s, 10s', kind: 'seq', steps: [1, 2, 5, 10], ms: 14000 },
    { label: 'Count on and back', kind: 'seq', steps: [2, 3, 4, 5, 10, -1, -2, -5, -10], ms: 15000 },
    { label: 'Machine: add or take away', kind: 'machine', rules: 'addsub', ms: 18000 },
    { label: 'Machine: times', kind: 'machine', rules: 'times', ms: 18000 },
    { label: 'Machine: two steps', kind: 'machine', rules: 'two', ms: 24000 }
  ];

  function machineHtml(rows, askIn) {
    var h = '<div class="mk-machine"><h4>⚙️ The Machine</h4>';
    rows.forEach(function (r) { h += '<div class="mk-row"><span>IN ' + r[0] + '</span><span>→</span><span>OUT ' + r[1] + '</span></div>'; });
    h += '<div class="mk-row ask"><span>IN ' + askIn + '</span><span>→</span><span>OUT ?</span></div></div>';
    return h;
  }

  K.choiceGame({
    id: 'patternmachine',
    name: 'Pattern Machine',
    emoji: '⚙️',
    blurb: 'Crack the rule and finish the pattern',
    grades: 'K to Grade 6',
    prompt: 'What comes next?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var i, ch, ans, ex;
      if (cfg.kind === 'icons') {
        var unit = rng.pick(cfg.unit), kinds = rng.shuffle(ICONS).slice(0, 4), map = {}, seq = [], letters = [];
        'ABC'.split('').forEach(function (L, j) { map[L] = kinds[j]; });
        for (i = 0; i < cfg.show + 1; i++) seq.push(map[unit.charAt(i % unit.length)]);
        ans = seq[cfg.show];
        ch = rng.shuffle(kinds.slice(0, Math.max(3, Math.min(4, kinds.length))));
        if (ch.indexOf(ans) < 0) ch[0] = ans;
        ch = rng.shuffle(ch);
        return {
          question: 'What comes next?', visual: '<div class="mk-sq">' + seq.slice(0, cfg.show).join('') + ' ❓</div>',
          choices: ch, answer: ans, cols: ch.length, big: true,
          explain: 'The pattern repeats ' + unit.split('').map(function (L) { return map[L]; }).join('')
        };
      }
      if (cfg.kind === 'seq') {
        var step = rng.pick(cfg.steps), s0 = step < 0 ? rng.int(12, 40) + Math.abs(step) * 3 : rng.int(1, 20), terms = [];
        for (i = 0; i < 5; i++) terms.push(s0 + step * i);
        ans = terms[4];
        ch = MAG.numberChoices(rng, ans, 4, Math.max(0, ans - 12), ans + 12);
        return {
          question: 'What number comes next?', visual: '<div class="mk-big">' + terms.slice(0, 4).join(', ') + ', ?</div>',
          choices: ch, answer: ans, big: true,
          explain: (step > 0 ? 'Add ' + step : 'Take away ' + Math.abs(step)) + ' each time: ' + terms[3] + ' ' + (step > 0 ? '+' : '−') + ' ' + Math.abs(step) + ' = ' + ans
        };
      }
      // machines
      var rule, label;
      if (cfg.rules === 'addsub') {
        var d = rng.int(2, 9); if (rng.int(0, 1)) { rule = function (x) { return x + d; }; label = 'add ' + d; } else { rule = function (x) { return x - d; }; label = 'take away ' + d; }
      } else if (cfg.rules === 'times') {
        var m = rng.pick([2, 3, 4, 5, 10]); rule = function (x) { return x * m; }; label = 'times ' + m;
      } else {
        var m2 = rng.pick([2, 3]), c2 = rng.int(1, 4), plus = rng.int(0, 1) === 1;
        rule = function (x) { return m2 * x + (plus ? c2 : -c2); }; label = 'times ' + m2 + (plus ? ', then add ' : ', then take away ') + c2;
      }
      var minIn = cfg.rules === 'addsub' && label.indexOf('take') === 0 ? 10 : 2;
      var ins = rng.shuffle([minIn, minIn + 1, minIn + 2, minIn + 3, minIn + 4]).slice(0, 3).sort(function (a, b) { return a - b; });
      ex = ins.map(function (x) { return [x, rule(x)]; });
      var ask = rng.int(minIn + 5, minIn + 9);
      ans = rule(ask);
      ch = MAG.numberChoices(rng, ans, 4, Math.max(0, ans - 10), ans + 10);
      return {
        question: 'Find the rule, then use it!', visual: machineHtml(ex, ask),
        choices: ch, answer: ans, big: true,
        explain: 'The rule is ' + label + ': ' + ask + ' → ' + ans
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
