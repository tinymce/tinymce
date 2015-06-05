test(
  'DivideTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.operate.MergingOperations'
  ],

  function (Fun, MergingOperations) {

    var comparator = Fun.tripleEquals;
    var substitution = Fun.constant('nu');
    var structureA = [
      [ 'a', 'b', 'b', 'c']
    ];
    var targetA = 'b';
    var expectedA = [
      [ 'a', 'b', 'nu', 'c' ]
    ];


    var resultA = MergingOperations.unmerge(structureA, targetA, comparator, substitution);
    assert.eq(expectedA, resultA);

    var structureB = [
      [ 'a', 'b', 'b', 'c' ],
      [ 'a', 'b', 'b', 'd' ],
      [ 'f', 'b', 'b', 'e' ]
    ];
    var expectedB = [
      [ 'a', 'b', 'nu', 'c' ],
      [ 'a', 'nu', 'nu', 'd' ],
      [ 'f', 'nu', 'nu', 'e' ]
    ];
    var resultB = MergingOperations.unmerge(structureB, targetA, comparator, substitution);
    assert.eq(expectedB, resultB);

    var structureC = [
      [ 'a', 'b', 'b', 'c' ],
      [ 'a', 'b', 'b', 'd' ],
      [ 'f', 'b', 'b', 'e' ]
    ];

    var expectedC = [
      [ 'a', 'b', 'b', 'c' ],
      [ 'nu', 'b', 'b', 'd' ],
      [ 'f', 'b', 'b', 'e' ]
    ];
    var resultC = MergingOperations.unmerge(structureC, 'a', comparator, substitution);
    assert.eq(expectedC, resultC);
  }
);