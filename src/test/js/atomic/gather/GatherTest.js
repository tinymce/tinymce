test('Gathering',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.GatherResult',
    'ephox.phoenix.api.general.Gather',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Merger, Option, GatherResult, Gather, Finder, TestRenders) {
    var universe = TestUniverse(
      Gene('root', 'root', [
        Gene('a', 'node', [
          Gene('aa', 'node', [
            TextGene('aaa', 'aaa'),
            TextGene('aab', 'aab'),
            TextGene('aac', 'aac')
          ]),
          Gene('ab', 'node', [
            TextGene('aba', 'aba'),
            TextGene('abb', 'abb')
          ])
        ]),
        Gene('b', 'node', [
          TextGene('ba', 'ba')
        ]),
        Gene('c', 'node', [
          Gene('ca', 'node', [
            Gene('caa', 'node', [
              TextGene('caaa', 'caaa')
            ])
          ]),
          Gene('cb', 'node', []),
          Gene('cc', 'node', [
            TextGene('cca', 'cca')
          ])
        ]),
        TextGene('d', 'd')
      ])
    );

    var pruner = function (elems) {
      var stop = function (x) {
        return Arr.contains(elems, x.id);
      };

      var cutleft = function (x) {
        return Merger.merge(x, {
          id: '<' + x.id
        });
      };

      var cutright = function (x) {
        return Merger.merge(x, {
          id: x.id + '>'
        });
      };

      var left = function (x) {
        return stop(x) ? Option.some([cutleft(x)]) : Option.none();
      };

      var right = function (x) {
        return stop(x) ? Option.some([cutright(x)]) : Option.none();
      };

      return {
        stop: stop,
        left: left,
        right: right
      };
    };

    var f = function (iterator, x, prune) {
      var children = universe.property().children(x);
      return children.length > 0 ? iterator(children, f, prune) : GatherResult([x], false);
    };

    var check = function (left, right, id, prunes) {
      var prune = pruner(prunes);
      var item = Finder.get(universe, id);
      var actual = Gather.gather(universe, item, prune, f);
      assert.eq(left, TestRenders.ids(actual.left()));
      assert.eq(id, TestRenders.id(actual.element()));
      assert.eq(right, TestRenders.ids(actual.right()));
    };

    check(['aaa'], ['aac', 'aba', 'abb'], 'aab', ['a']);
    check(['aaa', 'aab', 'aac', 'aba', 'abb', 'ba'], ['cb', 'cca', 'd'], 'caaa', []);
    check(['aaa', 'aab', 'aac', 'aba', 'abb', 'ba', 'caaa'], ['cca', 'd'], 'cb', []);
    check(['<b', 'caaa'], ['cca', 'd'], 'cb', ['b']);
    check(['aaa', 'aab'], [], 'aac', ['aa']);
    check(['<aa'], ['abb', 'ba', 'c>'], 'aba', ['aa', 'c']);
  }
);
