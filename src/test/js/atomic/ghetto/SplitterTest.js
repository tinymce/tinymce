test(
  'SplitterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.search.GhettoSplitter',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Spot, GhettoSplitter, Finder, TestRenders) {
    var checkSplit = function (toplevel, expected, id, start, finish, offset, data) {
      var universe = TestUniverse(data);
      var item = Finder.get(universe, id);
      var actual = GhettoSplitter.split(universe, offset, Spot.range(item, start, finish));
      assert.eq(expected.length, actual.length, 'Incorrect size');
      Arr.each(expected, function (exp, i) {
        assert.eq(exp.id, actual[i].element().id);
        assert.eq(exp.start, actual[i].start());
        assert.eq(exp.finish, actual[i].finish());
      });

      var root = universe.up().top(item);
      assert.eq(toplevel, Arr.map(root.children, TestRenders.id));

    };

    var checkSubdivide = function (toplevel, expected, id, positions, offset, data) {
      var universe = TestUniverse(data);
      var item = Finder.get(universe, id);
      var actual = GhettoSplitter.subdivide(universe, item, positions, offset);
      assert.eq(expected.length, actual.length, 'Incorrect size for subdivide test');
      Arr.each(expected, function (exp, i) {
        var act = actual[i];
        assert.eq(exp.id, act.element().id);
        assert.eq(exp.start, act.start(), 'comparing start for ' + exp.id + ': ' + exp.start + ' vs ' + act.start());
        assert.eq(exp.finish, act.finish(), 'comparing finish for ' + exp.id + ': ' + exp.finish + ' vs ' + act.finish());
      });

      assert.eq(toplevel, Arr.map(universe.get().children, TestRenders.text));
    };

    checkSplit([ 'a' ], [ { id: 'a', start: 3, finish: 9 } ], 'a', 3, 9, 10, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));

    checkSplit([ 'a', '?_attle' ], [
      { id: 'a', start: 3, finish: 4 },
      { id: '?_attle', start: 4, finish: 9 }
    ], 'a', 3, 9, 4, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    checkSplit([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 2, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    checkSplit([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 9, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    checkSplit([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 3, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));


    checkSubdivide([ '_', 'abcdefghijklm', 'n', 'opq', 'rstuvwxyz' ], [
      { id: 'a', start: 0, finish: 1 },
      { id: '?_abcdefghijklm', start: 1, finish: 14 },
      { id: '?_n', start: 14, finish: 15 },
      { id: '?_opq', start: 15, finish: 18 },
      { id: '?_rstuvwxyz', start: 18, finish: 27 }
    ], 'a', [ 1, 14, 15, 18 ], 0, Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));

    checkSubdivide([ '_abcdefghijklmnopqrstuvwxyz' ], [
      { id: 'a', start: 0, finish: 27 }
    ], 'a', [ 100 ], 0, Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));
  }
);
