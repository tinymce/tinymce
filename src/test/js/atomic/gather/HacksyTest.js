test(
  'HacksyTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.phoenix.gather.HacksyLeft',
    'ephox.phoenix.gather.HacksyRight',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, TextGene, HacksyLeft, HacksyRight, Finder) {
    var universe = TestUniverse(
      Gene('root', 'root', [
        Gene('a', 'node', [
          Gene('b', 'node', [ ]),
          Gene('c', 'node', [
            Gene('d', 'node', []),
            Gene('e', 'node', [])
          ])
        ])
      ])
    );

    var checkNone = function (id, traverse) {
      var item = Finder.get(universe, id);
      assert.eq(true, traverse(universe, item).isNone());
    };

    var check = function (expected, id, traverse) {
      var item = Finder.get(universe, id);
      var actual = traverse(universe, item).getOrDie();
      console.log('actual: ', actual.item().id);
      assert.eq(expected, actual.item().id);
    };

    checkNone('a', HacksyLeft.backtrack);
    checkNone('b', HacksyLeft.backtrack);
    check('b', 'c', HacksyLeft.backtrack);
    check('b', 'd', HacksyLeft.backtrack);
    check('d', 'e', HacksyLeft.backtrack);

    check('c', 'a', HacksyLeft.advance);
    checkNone('b', HacksyLeft.advance);
    check('e', 'c', HacksyLeft.advance);
    checkNone('d', HacksyLeft.advance);
    checkNone('e', HacksyLeft.advance);

    checkNone('a', HacksyRight.backtrack);
    check('c', 'b', HacksyRight.backtrack);
    checkNone('c', HacksyRight.backtrack);
    check('e', 'd', HacksyRight.backtrack);
    checkNone('e', HacksyRight.backtrack);

    check('b', 'a', HacksyRight.advance);
    checkNone('b', HacksyRight.advance);
    check('d', 'c', HacksyRight.advance);
    checkNone('d', HacksyRight.advance);
    checkNone('e', HacksyRight.advance);

  }
);