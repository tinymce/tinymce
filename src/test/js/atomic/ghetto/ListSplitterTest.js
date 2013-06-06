test(
  'ListSplitterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.search.GhettoListSplitter',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders',
    'ephox.phoenix.util.arr.PositionArray'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Option, Spot, GhettoListSplitter, Finder, TestRenders, PositionArray) {
    var data = function () {
      return Gene('root', 'root', [
        TextGene('1', 'AB'),
        TextGene('2', 'C'),
        TextGene('3', 'DEFGHI'),
        TextGene('4', 'JKL'),
        TextGene('5', 'MNOP')
      ]);
    };

    var check = function (all, expected, ids, points, input) {
      var universe = TestUniverse(input);
      var items = Finder.getAll(universe, ids);
      var list = PositionArray.make(items, function (item, start) {
        var finish = start + universe.property().getText(item).length;
        return Option.some(Spot.range(item, start, finish));
      });

      var actual = GhettoListSplitter.yipes(universe, list, points);
      assert.eq(expected, Arr.map(actual, function (a) {
        return a.element().text + '@ ' + a.start() + '->' + a.finish();
      }));

      assert.eq(all, TestRenders.texts(universe.get().children));

    };

    check([ 'AB', 'C', 'DEFGHI', 'JKL', 'MNOP' ], [
      'AB@ 0->2',
      'C@ 2->3',
      'DEFGHI@ 3->9',
      'JKL@ 9->12',
      'MNOP@ 12->16'
    ], [ '1', '2', '3', '4', '5' ], [], data());

    check([ 'A', 'B', 'C', 'D', 'EFG', 'H', 'I', 'JK', 'L', 'MN', 'OP' ], [
      'A@ 0->1',
      'B@ 1->2',
      'C@ 2->3',
      'D@ 3->4',
      'EFG@ 4->7',
      'H@ 7->8',
      'I@ 8->9',
      'JK@ 9->11',
      'L@ 11->12',
      'MN@ 12->14',
      'OP@ 14->16'
    ], [ '1', '2', '3', '4', '5' ], [ 1, 2, 4, 7, 8, 11, 14 ], data());

  }
);
