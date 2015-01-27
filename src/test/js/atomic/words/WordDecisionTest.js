test(
  'WordDecisionTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.words.WordDecision',
    'ephox.robin.words.WordWalking',
    'ephox.scullion.Struct'
  ],

  function (Gene, TestUniverse, TextGene, Arr, WordDecision, WordWalking, Struct) {
    var universe = TestUniverse(
      Gene('root', 'root', [
        Gene('p1', 'p', [
          TextGene('this_is_', 'This is '),
          Gene('br1', 'br'),
          TextGene('going_', 'going '),
          Gene('s1', 'span', [
            TextGene('to', 'to'),
            Gene('b1', 'b', [
              TextGene('_b', ' b' )
            ]),
            TextGene('e', 'e'),
            TextGene('_more', ' more')
          ])
        ])
      ])
    );

    var decision = Struct.immutable('items', 'abort');
    
    var check = function (items, abort, id, slicer) {
      var actual = WordDecision.decide(universe, universe.find(universe.get(), id).getOrDie(), slicer);
      assert.eq(items, Arr.map(actual.items(), function (item) { return item.item().id; }));
      assert.eq(abort, actual.abort());
    }

    check([], true, 'p1', WordWalking.left.slicer);
    check([], true, 'p1', WordWalking.right.slicer);
    check([], true, 'going_', WordWalking.left.slicer);
    check([ 'going_' ], true, 'going_', WordWalking.right.slicer);
    check([ 'to' ], false, 'to', WordWalking.left.slicer);
    check([ 'to' ], false, 'to', WordWalking.right.slicer);
    check([ '_b' ], true, '_b', WordWalking.left.slicer);
    check([ ], true, '_b', WordWalking.right.slicer);
    check([ ], true, 'br1', WordWalking.left.slicer);
    check([ ], true, 'br1', WordWalking.right.slicer);
  }
);