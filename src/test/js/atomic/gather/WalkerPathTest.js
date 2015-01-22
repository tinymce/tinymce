test(
  'WalkerPathTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Walker',
    'ephox.phoenix.gather.Walking',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, Fun, Option, Walker, Walking, Finder) {
    var universe = TestUniverse(
      Gene('root', 'root', [
        Gene('1', 'node', [
          Gene('1.1', 'node', [
            Gene('1.1.1', 'node', [])
          ]),
          Gene('1.2', 'node', [
            Gene('1.2.1', 'node', [
              Gene('1.2.1.1', 'node', []),
              Gene('1.2.1.2', 'node', [])
            ])
          ]),
          Gene('1.3', 'node', [])
        ]),
        Gene('2', 'node', [
          Gene('2.1', 'node', []),
          Gene('2.2', 'node', [
            Gene('2.2.1', 'node', []),
            Gene('2.2.2', 'node', [])
          ])
        ]),
        Gene('3', 'node', [
          Gene('3.1', 'node', []),
          Gene('3.2', 'node', [
            Gene('3.2.1', 'node', [
              Gene('3.2.1.1', 'node', []),
              Gene('3.2.1.2', 'node', [])
            ]),
            Gene('3.2.2', 'node', []),
          ]),
          Gene('3.3', 'node', [])
        ])
      ])
    );

    var checkPath = function (expected, id, direction) {
      var start = Finder.get(universe, id);
      var path = [];
      var current = Option.some({ item: Fun.constant(start), mode: Fun.constant(Walker.advance) });
      while (current.isSome()) {
        var c = current.getOrDie();
        path = path.concat(c.item().id);
        current = Walker.go(universe, c.item(), c.mode(), direction);
      }

      assert.eq(expected, path);
    };

    checkPath([
      '3.1', '3', '2', '2.2', '2.2.2', '2.2.1', '2.2', '2.1', '2', '1', '1.3', '1.2', '1.2.1', '1.2.1.2', '1.2.1.1',
      '1.2.1', '1.2', '1.1', '1.1.1', '1.1', '1', 'root'
    ], '3.1', Walking.left());

    checkPath([
      '1.2', '1.2.1', '1.2.1.1', '1.2.1.2', '1.2.1', '1.2', '1.3', '1', '2', '2.1', '2.2', '2.2.1', '2.2.2', '2.2', '2', '3',
      '3.1', '3.2', '3.2.1', '3.2.1.1', '3.2.1.2', '3.2.1', '3.2.2', '3.2', '3.3', '3', 'root'
    ], '1.2', Walking.right());
  }
);