test(
  'QueryTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.mutant.Query',
    'ephox.perhaps.Option'
  ],

  function (Gene, TestUniverse, Query, Option) {
    var universe = TestUniverse(Gene('1', 'root', [
      Gene('1.1', 'duck', [
        Gene('1.1.1', 'goose', []),
        Gene('1.1.2', 'goose', [
          Gene('1.1.2.1', 'duck', []),
          Gene('1.1.2.2', 'duck', [
            Gene('1.1.2.2.1', 'goose', [])
          ])
        ]),
        Gene('1.1.3', 'duck', []),
        Gene('1.1.4', 'duck', [
          Gene('1.1.4.1', 'duck', [])
        ])
      ])
    ]), Option.none());

    var check = function (expected, one, other) {
      var first = universe.find(universe.get(), one).getOrDie();
      var last = universe.find(universe.get(), other).getOrDie();

      var actual = Query.comparePosition(first, last);
      assert.eq(expected, actual);
    };

    check(2, '1.1.1', '1.1.2');
    check(4, '1.1.2', '1.1.1');
    check(2, '1.1.1', '1.1.4.1');
  }
);
