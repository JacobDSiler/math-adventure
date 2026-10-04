/*! Shape Sorter: shapes, sides and corners for Math Adventure (plugin for ma-games.js + ma-game-kit.js)
 * App topics: shapes, geometry_basic.
 */
(function (root) {
  'use strict';
  var MAG = root.MAGames, K = MAG && MAG.kit;
  if (!K) throw new Error('Load ma-games.js and ma-game-kit.js before ma-game-shapesorter.js');

  var COLORS = ['#ff6b6b', '#3ddc97', '#ffd23f', '#6bb5ff', '#c792ea', '#ff9f43'];
  function poly(n, rot) {
    var pts = [], i, a;
    for (i = 0; i < n; i++) { a = rot + 2 * Math.PI * i / n; pts.push((50 + 42 * Math.cos(a)).toFixed(1) + ',' + (50 + 42 * Math.sin(a)).toFixed(1)); }
    return pts.join(' ');
  }
  var SHAPES = {
    circle: { sides: 0, svg: function () { return '<circle cx="50" cy="50" r="42"/>'; } },
    oval: { sides: 0, svg: function () { return '<ellipse cx="50" cy="50" rx="44" ry="28"/>'; } },
    triangle: { sides: 3, svg: function () { return '<polygon points="' + poly(3, -Math.PI / 2) + '"/>'; } },
    square: { sides: 4, svg: function () { return '<rect x="14" y="14" width="72" height="72"/>'; } },
    rectangle: { sides: 4, svg: function () { return '<rect x="6" y="26" width="88" height="48"/>'; } },
    pentagon: { sides: 5, svg: function () { return '<polygon points="' + poly(5, -Math.PI / 2) + '"/>'; } },
    hexagon: { sides: 6, svg: function () { return '<polygon points="' + poly(6, 0) + '"/>'; } },
    octagon: { sides: 8, svg: function () { return '<polygon points="' + poly(8, Math.PI / 8) + '"/>'; } }
  };
  function svg(name, color, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" role="img" aria-label="a shape" style="fill:' + color + ';stroke:#1b2a49;stroke-width:4;stroke-linejoin:round">' + SHAPES[name].svg() + '</svg>';
  }
  var LV = [null,
    { label: 'Name it: circle, square, triangle', names: ['circle', 'square', 'triangle'], kind: 'name', ms: 25000 },
    { label: 'Name it: add rectangle and oval', names: ['circle', 'square', 'triangle', 'rectangle', 'oval'], kind: 'name', ms: 22000 },
    { label: 'Name it: pentagon, hexagon, octagon', names: ['triangle', 'rectangle', 'pentagon', 'hexagon', 'octagon'], kind: 'name', ms: 20000 },
    { label: 'Count the sides', names: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'], kind: 'sides', ms: 22000 },
    { label: 'Which has this many sides?', names: ['triangle', 'square', 'pentagon', 'hexagon', 'octagon'], kind: 'which', ms: 22000 },
    { label: 'Sides: any shape, even round ones', names: ['circle', 'oval', 'triangle', 'rectangle', 'pentagon', 'hexagon', 'octagon'], kind: 'sides', ms: 20000 }
  ];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  K.choiceGame({
    id: 'shapesorter',
    name: 'Shape Sorter',
    emoji: '🔷',
    blurb: 'Name shapes and count their sides',
    grades: 'Preschool to Grade 2',
    prompt: 'Tap the answer',
    levels: LV,
    makeSpec: function (rng, cfg) {
      var color = rng.pick(COLORS), name = rng.pick(cfg.names), ch, i;
      if (cfg.kind === 'name') {
        var pool = rng.shuffle(cfg.names.filter(function (n) { return n !== name; })).slice(0, 2);
        ch = rng.shuffle([name].concat(pool)).map(function (n) { return { v: n, label: cap(n) }; });
        return { question: 'What shape is this?', visual: svg(name, color, 140), choices: ch, answer: name, cols: 1, explain: 'This is a ' + name };
      }
      if (cfg.kind === 'sides') {
        var s = SHAPES[name].sides, vals = {};
        cfg.names.forEach(function (n) { vals[SHAPES[n].sides] = 1; });
        var set = Object.keys(vals).map(Number); set.push(s); set.push(s + 1); if (s > 0) set.push(s - 1);
        var uniq = []; set.forEach(function (v) { if (v >= 0 && uniq.indexOf(v) < 0) uniq.push(v); });
        uniq = rng.shuffle(uniq.filter(function (v) { return v !== s; })).slice(0, 3).concat([s]);
        return { question: 'How many sides does it have?', visual: svg(name, color, 140), choices: rng.shuffle(uniq), answer: s, big: true,
          explain: cap(name) + (s === 0 ? ' has no straight sides' : ' has ' + s + ' sides') };
      }
      var target = rng.pick(cfg.names), n = SHAPES[target].sides;
      var cand = rng.shuffle(cfg.names.filter(function (x) { return SHAPES[x].sides !== n; })).slice(0, 2);
      ch = rng.shuffle([target].concat(cand));
      var vis = '';
      ch.forEach(function (c) { vis += svg(c, rng.pick(COLORS), 90); });
      return {
        question: 'Which shape has ' + n + ' sides?', visual: '<div class="mk-big">' + n + ' sides</div>',
        choices: ch.map(function (c) { return { v: c, label: cap(c) }; }), answer: target, cols: 1,
        explain: cap(target) + ' has ' + n + ' sides'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
