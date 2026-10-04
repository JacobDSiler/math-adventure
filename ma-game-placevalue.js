/*! Place Value Towers: tens, ones and hundreds for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * Read numbers from blocks, then work with what each digit is worth.
 * App topics: place_value_10, place_value.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-placevalue.js');

  var LV = [null,
    { label: 'Blocks: tens and ones (to 30)', kind: 'blocks', max: 30, min: 11, ms: 25000 },
    { label: 'Blocks: tens and ones (to 99)', kind: 'blocks', max: 99, min: 21, ms: 22000 },
    { label: 'Blocks with hundreds', kind: 'blocks', max: 399, min: 101, ms: 24000 },
    { label: 'What is this digit worth?', kind: 'worth', ms: 20000 },
    { label: '10 more, 10 less', kind: 'shift', by: 10, ms: 20000 },
    { label: '100 more, 100 less', kind: 'shift', by: 100, ms: 20000 },
    { label: 'Expanded form: 300 + 40 + 5', kind: 'expand', ms: 22000 }
  ];

  function blk(w, h, bg) { return '<span style="display:inline-block;width:' + w + 'px;height:' + h + 'px;background:' + bg + ';border:2px solid #1b2a49;border-radius:3px;margin:1px"></span>'; }
  function blocksHtml(n) {
    var h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10, i, s = '', p;
    p = ''; for (i = 0; i < h; i++) p += blk(46, 46, '#6bb5ff'); if (p) s += '<div style="display:flex;flex-wrap:wrap;max-width:300px;justify-content:center">' + p + '</div>';
    p = ''; for (i = 0; i < t; i++) p += blk(14, 52, '#3ddc97'); if (p) s += '<div style="display:flex;flex-wrap:wrap;max-width:300px;justify-content:center">' + p + '</div>';
    p = ''; for (i = 0; i < o; i++) p += blk(14, 14, '#ffd23f'); if (p) s += '<div style="display:flex;flex-wrap:wrap;max-width:300px;justify-content:center">' + p + '</div>';
    return '<div style="display:flex;flex-direction:column;gap:6px;align-items:center">' + s + '</div>';
  }
  function digits(n) { return String(n).split('').map(Number); }

  K.choiceGame({
    id: 'placevalue',
    name: 'Place Value Towers',
    emoji: '🏗️',
    blurb: 'Hundreds, tens and ones: build and read numbers',
    grades: 'Grade 1 to 4',
    prompt: 'Tap the answer',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var n, ans, ch, lure;
      if (cfg.kind === 'blocks') {
        n = rng.int(cfg.min, cfg.max); if (n % 10 === 0 && rng.int(0, 1)) n += 1;
        ans = n;
        var d = digits(n), rev = Number(d.slice().reverse().join('')) ;
        ch = MAG.numberChoices(rng, ans, 4, Math.max(1, ans - 11), ans + 11);
        if (rev !== ans && rev > 0 && ch.indexOf(rev) < 0) { var idx = []; ch.forEach(function (v, j) { if (v !== ans) idx.push(j); }); ch[rng.pick(idx)] = rev; ch.sort(function (a, b) { return a - b; }); }
        return { question: 'What number do the blocks show?', visual: blocksHtml(n), choices: ch, answer: ans, big: true,
          explain: (n >= 100 ? Math.floor(n / 100) + ' hundreds, ' : '') + Math.floor((n % 100) / 10) + ' tens, ' + (n % 10) + ' ones = ' + n };
      }
      if (cfg.kind === 'worth') {
        n = rng.int(100, 999); var pos = rng.int(0, 2), dg = digits(n);
        while (dg[pos] === 0) { n = rng.int(100, 999); dg = digits(n); }
        ans = dg[pos] * Math.pow(10, 2 - pos);
        ch = [ans, dg[pos], dg[pos] * 10, dg[pos] * 100, dg[pos] * 1000].filter(function (v, i, a) { return a.indexOf(v) === i; });
        ch = rng.shuffle(ch.filter(function (v) { return v !== ans; })).slice(0, 3).concat([ans]).sort(function (a, b) { return a - b; });
        var s = String(n), shown = s.slice(0, pos) + '<u style="color:#ff6b6b">' + s[pos] + '</u>' + s.slice(pos + 1);
        return { question: 'What is the digit worth in this number?', visual: '<div class="mk-big" style="font-size:3rem">' + shown + '</div>', choices: ch, answer: ans, big: true,
          explain: 'The ' + dg[pos] + ' is in the ' + ['hundreds', 'tens', 'ones'][pos] + ' place, so it is worth ' + ans };
      }
      if (cfg.kind === 'shift') {
        var up = rng.int(0, 1) === 1; n = rng.int(cfg.by === 10 ? 20 : 300, cfg.by === 10 ? 890 : 890);
        if (cfg.by === 10) n = rng.int(20, 90) * 1 + rng.int(0, 1) * 100 + rng.int(0, 9) * 0;
        ans = up ? n + cfg.by : n - cfg.by;
        ch = [ans, ans + (cfg.by === 10 ? 1 : 10), ans - (cfg.by === 10 ? 1 : 10), up ? n - cfg.by : n + cfg.by, n + 1].filter(function (v, i, a) { return a.indexOf(v) === i && v >= 0; });
        ch = rng.shuffle(ch.filter(function (v) { return v !== ans; })).slice(0, 3).concat([ans]).sort(function (a, b) { return a - b; });
        return { question: cfg.by + ' ' + (up ? 'more' : 'less') + ' than ' + n + '?', visual: '', choices: ch, answer: ans, big: true,
          explain: n + (up ? ' + ' : ' − ') + cfg.by + ' = ' + ans + ' (only the ' + (cfg.by === 10 ? 'tens' : 'hundreds') + ' digit changes)' };
      }
      n = rng.int(101, 999); var dd = digits(n), parts = [dd[0] * 100, dd[1] * 10, dd[2]].filter(function (v) { return v > 0; });
      ans = parts.join(' + ');
      var wrongs = [], shuf = [dd[0] * 10, dd[1] * 100, dd[2]].filter(function (v) { return v > 0; }).join(' + ');
      wrongs.push(shuf); wrongs.push([dd[0], dd[1], dd[2]].filter(function (v) { return v > 0; }).join(' + '));
      wrongs.push([dd[0] * 100, dd[1], dd[2] * 10].filter(function (v) { return v > 0; }).join(' + '));
      wrongs = wrongs.filter(function (w, i, a) { return w !== ans && a.indexOf(w) === i; });
      ch = rng.shuffle([ans].concat(wrongs.slice(0, 3)));
      return { question: 'Which is ' + n + ' in expanded form?', visual: '', choices: ch, answer: ans, cols: 1,
        explain: n + ' = ' + ans };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
