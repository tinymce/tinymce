test(
  'WalkerTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.phoenix.gather.Walker',
    'ephox.phoenix.gather.Walking',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, Walker, Walking, Finder) {
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

    checkNone('a', Walker.backtrack, Walking.left());
    check('a', 'b', Walker.backtrack, Walking.left());
    check('a', 'c', Walker.backtrack, Walking.left());
    check('c', 'd', Walker.backtrack, Walking.left());
    check('c', 'e', Walker.backtrack, Walking.left());

    checkNone('a', Walker.sidestep, Walking.left());
    checkNone('b', Walker.sidestep, Walking.left());
    check('b', 'c', Walker.sidestep, Walking.left());
    checkNone('d', Walker.sidestep, Walking.left());
    check('d', 'e', Walker.sidestep, Walking.left());

    check('c', 'a', Walker.advance, Walking.left());
    checkNone('b', Walker.advance, Walking.left());
    check('e', 'c', Walker.advance, Walking.left());
    checkNone('d', Walker.advance, Walking.left());
    checkNone('e', Walker.advance, Walking.left());

    checkNone('a', Walker.backtrack, Walking.right());
    check('a', 'b', Walker.backtrack, Walking.right());
    check('a', 'c', Walker.backtrack, Walking.right());
    check('c', 'd', Walker.backtrack, Walking.right());
    check('c', 'e', Walker.backtrack, Walking.right());

    checkNone('a', Walker.sidestep, Walking.right());
    check('c', 'b', Walker.sidestep, Walking.right());
    checkNone('c', Walker.sidestep, Walking.right());
    check('e', 'd', Walker.sidestep, Walking.right());
    checkNone('e', Walker.sidestep, Walking.right());

    check('b', 'a', Walker.advance, Walking.right());
    checkNone('b', Walker.advance, Walking.right());
    check('d', 'c', Walker.advance, Walking.right());
    checkNone('d', Walker.advance, Walking.right());
    checkNone('e', Walker.advance, Walking.right());
  }
);