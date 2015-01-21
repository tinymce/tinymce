test(
  'HacksyTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Hacksy',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, Fun, Option, Hacksy, Finder) {
    var universe = TestUniverse(
      Gene('a', 'node', [
        Gene('b', 'node', [ ]),
        Gene('c', 'node', [
          Gene('d', 'node', []),
          Gene('e', 'node', [])
        ])
      ])
    );

    var checkNone = function (id, traverse, direction) {
      var item = Finder.get(universe, id);
      assert.eq(true, traverse(universe, item, direction).isNone());
    };

    var check = function (expected, id, traverse, direction) {
      var item = Finder.get(universe, id);
      var actual = traverse(universe, item, direction).getOrDie();
      assert.eq(expected, actual.item().id);
    };

    checkNone('a', Hacksy.backtrack, Hacksy.left());
    check('a', 'b', Hacksy.backtrack, Hacksy.left());
    check('a', 'c', Hacksy.backtrack, Hacksy.left());
    check('c', 'd', Hacksy.backtrack, Hacksy.left());
    check('c', 'e', Hacksy.backtrack, Hacksy.left());

    checkNone('a', Hacksy.sidestep, Hacksy.left());
    checkNone('b', Hacksy.sidestep, Hacksy.left());
    check('b', 'c', Hacksy.sidestep, Hacksy.left());
    checkNone('d', Hacksy.sidestep, Hacksy.left());
    check('d', 'e', Hacksy.sidestep, Hacksy.left());

    check('c', 'a', Hacksy.advance, Hacksy.left());
    checkNone('b', Hacksy.advance, Hacksy.left());
    check('e', 'c', Hacksy.advance, Hacksy.left());
    checkNone('d', Hacksy.advance, Hacksy.left());
    checkNone('e', Hacksy.advance, Hacksy.left());

    checkNone('a', Hacksy.backtrack, Hacksy.right());
    check('a', 'b', Hacksy.backtrack, Hacksy.right());
    check('a', 'c', Hacksy.backtrack, Hacksy.right());
    check('c', 'd', Hacksy.backtrack, Hacksy.right());
    check('c', 'e', Hacksy.backtrack, Hacksy.right());

    checkNone('a', Hacksy.sidestep, Hacksy.right());
    check('c', 'b', Hacksy.sidestep, Hacksy.right());
    checkNone('c', Hacksy.sidestep, Hacksy.right());
    check('e', 'd', Hacksy.sidestep, Hacksy.right());
    checkNone('e', Hacksy.sidestep, Hacksy.right());

    check('b', 'a', Hacksy.advance, Hacksy.right());
    checkNone('b', Hacksy.advance, Hacksy.right());
    check('d', 'c', Hacksy.advance, Hacksy.right());
    checkNone('d', Hacksy.advance, Hacksy.right());
    checkNone('e', Hacksy.advance, Hacksy.right());

    var multiverse = TestUniverse(
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
      var start = Finder.get(multiverse, id);
      var path = [];
      var current = Option.some({ item: Fun.constant(start), mode: Fun.constant(Hacksy.advance) });
      while (current.isSome()) {
        var c = current.getOrDie();
        path = path.concat(c.item().id);
        current = Hacksy.go(multiverse, c.item(), c.mode(), direction);
      }

      assert.eq(expected, path);
    };

    checkPath([
      '3.1', '3', '2', '2.2', '2.2.2', '2.2.1', '2.2', '2.1', '2', '1', '1.3', '1.2', '1.2.1', '1.2.1.2', '1.2.1.1',
      '1.2.1', '1.2', '1.1', '1.1.1', '1.1', '1', 'root'
    ], '3.1', Hacksy.left());

    // checkPath([
    //   '1.2', '1.2.1', '1.2.1.1', '1.2.1.2', '1.2.1', '1.2', '1.3', '1', '2', '2.1', '2.2', '2.2.1', '2.2.2', '2.2', '2', '3',
    //   '3.1', '3.2', '3.2.1', '3.2.1.1', '3.2.1.2', '3.2.1', '3.2.2', '3.2', '3.3', '3', 'root'
    // ], '1.2', Hacksy.right());
  }
);