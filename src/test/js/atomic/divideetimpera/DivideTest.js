test(
  'DivideTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.ModelOperations'
  ],

  function (Fun, ModelOperations) {

    var comparator = Fun.tripleEquals;
    var substitution = Fun.constant('nu');
    var structureA = [
      [ 'a', 'b', 'b', 'c']
    ];
    var targetA = 'b';
    var expectedA = [
      [ 'a', 'b', 'nu', 'c' ]
    ];


    var resultA = ModelOperations.unmerge(structureA, targetA, comparator, substitution);
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
    var resultB = ModelOperations.unmerge(structureB, targetA, comparator, substitution);
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
    var resultC = ModelOperations.unmerge(structureC, 'a', comparator, substitution);
    assert.eq(expectedC, resultC);
  }
);