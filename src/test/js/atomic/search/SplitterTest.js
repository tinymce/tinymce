test(
  'SplitterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Spot, Splitter, Finder, TestRenders) {
    var checkSubdivide = function (toplevel, expected, id, positions, offset, data) {
      var universe = TestUniverse(data);
      var item = Finder.get(universe, id);
      var actual = Splitter.subdivide(universe, item, positions, offset);
      assert.eq(expected.length, actual.length, 'Incorrect size for subdivide test');
      Arr.each(expected, function (exp, i) {
        var act = actual[i];
        // TODO: Consider removing an expected id from the test case as it isn't really representing anything meaningful
        assert.eq(exp.id, act.element().id);
        assert.eq(exp.start, act.start(), 'comparing start for ' + exp.id + ': ' + exp.start + ' vs ' + act.start());
        assert.eq(exp.finish, act.finish(), 'comparing finish for ' + exp.id + ': ' + exp.finish + ' vs ' + act.finish());
        assert.eq(exp.text, act.element().text);
      });

      assert.eq(toplevel, Arr.map(universe.get().children, TestRenders.text));
    };

    checkSubdivide([ '_', 'abcdefghijklm', 'n', 'opq', 'rstuvwxyz' ], [
      { id: 'a', start: 0, finish: 1, text: '_' },
      { id: '?_abcdefghijklm', start: 1, finish: 14, text: 'abcdefghijklm' },
      { id: '?_n', start: 14, finish: 15, text: 'n' },
      { id: '?_opq', start: 15, finish: 18, text: 'opq' },
      { id: '?_rstuvwxyz', start: 18, finish: 27, text: 'rstuvwxyz' }
    ], 'a', [ 1, 14, 15, 18 ], 0, Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));

    checkSubdivide([ '_abcdefghijklmnopqrstuvwxyz' ], [
      { id: 'a', start: 0, finish: 27, text: '_abcdefghijklmnopqrstuvwxyz' }
    ], 'a', [ 100 ], 0, Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));
  }
);
