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
    var check = function (toplevel, expected, id, start, finish, offset, data) {
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

    check([ 'a' ], [ { id: 'a', start: 3, finish: 9 } ], 'a', 3, 9, 10, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));

    check([ 'a', '?' ], [
      { id: 'a', start: 3, finish: 4 },
      { id: '?', start: 4, finish: 9 }
    ], 'a', 3, 9, 4, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    check([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 2, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    check([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 9, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
    check([ 'a' ], [
      { id: 'a', start: 3, finish: 9 }
    ], 'a', 3, 9, 3, Gene('root', 'root', [
      TextGene('a', 'cattle')
    ]));
  }
);
