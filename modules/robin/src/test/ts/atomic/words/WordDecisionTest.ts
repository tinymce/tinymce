import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import WordDecision from 'ephox/robin/words/WordDecision';
import WordWalking from 'ephox/robin/words/WordWalking';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('WordDecisionTest', function() {
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

  var check = function (items, abort, id, slicer, currLanguage) {
    var isCustomBoundary = Fun.constant(false);
    var actual = WordDecision.decide(universe, universe.find(universe.get(), id).getOrDie(), slicer, isCustomBoundary);
    assert.eq(items, Arr.map(actual.items(), function (item) { return item.item().id; }));
    assert.eq(abort, actual.abort());
  };

  check([], true, 'p1', WordWalking.left.slicer, Option.none());
  check([], true, 'p1', WordWalking.right.slicer, Option.none());
  check([], true, 'going_', WordWalking.left.slicer, Option.none());
  check([ 'going_' ], true, 'going_', WordWalking.right.slicer, Option.none());
  check([ 'to' ], false, 'to', WordWalking.left.slicer, Option.none());
  check([ 'to' ], false, 'to', WordWalking.right.slicer, Option.none());
  check([ '_b' ], true, '_b', WordWalking.left.slicer, Option.none());
  check([ ], true, '_b', WordWalking.right.slicer, Option.none());
  check([ ], true, 'br1', WordWalking.left.slicer, Option.none());
  check([ ], true, 'br1', WordWalking.right.slicer, Option.none());

  // TODO: Add tests around language
});

