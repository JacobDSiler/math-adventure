/*! Number Line Hop: adding and taking away on a number line (plugin for ma-games.js + ma-game-kit.js)
 * A frog hops along the line; where does it land? Builds the picture behind + and -.
 * App topics: addition_basic, subtraction_basic, addition, subtraction.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-numberhop.js');

  function line(max, from, to) {
    var W = 330, pad = 12, step = (W - 2 * pad) / max, i, s = '', x;
    s += '<svg width="' + W + '" height="86" viewBox="0 0 ' + W + ' 86" role="img" aria-label="number line">';
    s += '<line x1="' + pad + '" y1="50" x2="' + (W - pad) + '" y2="50" stroke="#1b2a49" stroke-width="3"/>';
    for (i = 0; i <= max; i++) {
      x = pad + i * step;
      s += '<line x1="' + x + '" y1="44" x2="' + x + '" y2="56" stroke="#1b2a49" stroke-width="2"/>';
      s += '<text x="' + x + '" y="72" font-size="' + (max > 12 ? 9 : 13) + '" font-weight="800" text-anchor="middle" fill="#1b2a49">' + i + '</text>';
    }
    x = pad + from * step;
    s += '<text x="' + x + '" y="34" font-size="26" text-anchor="middle">🐸</text>';
    if (to != null) {
      var x2 = pad + to * step;
      s += '<path d="M' + x + ' 40 Q' + ((x + x2) / 2) + ' 8 ' + x2 + ' 40" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="5 4"/>';
    }
    return s + '</svg>';
  }

  var LV = [null,
    { label: 'Hop 1 or 2 forward (to 10)', max: 10, kind: 'add', lo: 1, hi: 2, ms: 25000 },
    { label: 'Hop forward up to 5 (to 10)', max: 10, kind: 'add', lo: 1, hi: 5, ms: 22000 },
    { label: 'Hop back (to 10)', max: 10, kind: 'sub', lo: 1, hi: 5, ms: 22000 },
    { label: 'Forward and back (to 10)', max: 10, kind: 'mix', lo: 1, hi: 6, ms: 20000 },
    { label: 'Forward and back (to 20)', max: 20, kind: 'mix', lo: 1, hi: 9, ms: 22000 },
    { label: 'How far did it hop?', max: 20, kind: 'gap', lo: 1, hi: 9, ms: 22000 }
  ];

  K.choiceGame({
    id: 'numberhop',
    name: 'Number Line Hop',
    emoji: '🐸',
    blurb: 'Hop along the line to add and take away',
    grades: 'Preschool to Grade 2',
    prompt: 'Where does the frog land?',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var h = rng.int(cfg.lo, cfg.hi), start, ans, dir, q, expl, vis, ch;
      if (cfg.kind === 'gap') {
        start = rng.int(0, cfg.max - h); ans = h;
        ch = MAG.numberChoices(rng, ans, 4, 1, 12);
        return { question: 'The frog hopped from ' + start + ' to ' + (start + h) + '. How far?', visual: line(cfg.max, start, start + h),
          choices: ch, answer: ans, big: true, explain: 'Count the hops from ' + start + ' to ' + (start + h) + ': ' + h };
      }
      dir = cfg.kind === 'add' ? 1 : cfg.kind === 'sub' ? -1 : (rng.int(0, 1) ? 1 : -1);
      if (dir > 0) { start = rng.int(0, cfg.max - h); ans = start + h; }
      else { start = rng.int(h, cfg.max); ans = start - h; }
      q = '🐸 starts on ' + start + ' and hops ' + h + (dir > 0 ? ' forward' : ' back') + '. Where does it land?';
      expl = start + (dir > 0 ? ' + ' : ' − ') + h + ' = ' + ans;
      ch = MAG.numberChoices(rng, ans, 4, Math.max(0, ans - 3), Math.min(cfg.max, ans + 3));
      return { question: q, visual: line(cfg.max, start, ans), choices: ch, answer: ans, big: true, explain: expl };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
