/*! Dot Match: link numerals and quantities for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * See the numeral, find the matching dots (and the other way round). Gentle and slow.
 * App topics: counting, place_value_10.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-dotmatch.js');

  var LV = [null,
    { label: 'Match to 5: numeral to dots', max: 5, toDots: true, nch: 3, ms: 25000 },
    { label: 'Match to 5: dots to numeral', max: 5, toDots: false, nch: 3, ms: 25000 },
    { label: 'Match to 10: numeral to dots', max: 10, toDots: true, nch: 3, ms: 25000 },
    { label: 'Match to 10: dots to numeral', max: 10, toDots: false, nch: 4, ms: 25000 },
    { label: 'Match to 20: dots to numeral', max: 20, toDots: false, nch: 4, ms: 25000 }
  ];

  function dots(n) { // groups of five so it is easy to see
    var s = '', i;
    for (i = 0; i < n; i++) { s += '●'; if (i % 5 === 4 && i < n - 1) s += ' '; }
    return s;
  }

  K.choiceGame({
    id: 'dotmatch',
    name: 'Dot Match',
    emoji: '🎯',
    blurb: 'Match numbers to the right dots',
    grades: 'Preschool to Grade 1',
    prompt: 'Which one matches?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var n = rng.int(1, cfg.max), nums = MAG.numberChoices(rng, n, cfg.nch, Math.max(1, n - 3), Math.min(cfg.max + 1, n + 3));
      if (cfg.toDots) {
        return {
          question: 'Find ' + n + ' dots', visual: '<div class="mk-big" style="font-size:4rem">' + n + '</div>',
          choices: nums.map(function (v) { return { v: v, label: dots(v) }; }), answer: n, cols: 1,
          explain: n + ' is shown by ' + dots(n)
        };
      }
      return {
        question: 'How many dots?', visual: '<div class="mk-sq" style="font-size:2.4rem;letter-spacing:.15em">' + dots(n) + '</div>',
        choices: nums, answer: n, big: true, explain: 'Count the dots: ' + n
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
