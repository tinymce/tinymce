import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Fun, Optional } from '@ephox/katamari';

import { WordDecision } from 'ephox/robin/words/WordDecision';
import { WordWalking } from 'ephox/robin/words/WordWalking';

UnitTest.test('WordDecisionTest', () => {
  const universe = TestUniverse(
    Gene('root', 'root', [
      Gene('p1', 'p', [
        TextGene('this_is_', 'This is '),
        Gene('br1', 'br'),
        TextGene('going_', 'going '),
        Gene('s1', 'span', [
          TextGene('to', 'to'),
          Gene('b1', 'b', [
            TextGene('_b', ' b')
          ]),
          TextGene('e', 'e'),
          TextGene('_more', ' more')
        ])
      ])
    ])
  );

  const check = (items: string[], abort: boolean, id: string, slicer: (text: string) => Optional<[number, number]>, _currLanguage: Optional<string>) => {
    const isCustomBoundary = Fun.never;
    const actual = WordDecision.decide(universe, universe.find(universe.get(), id).getOrDie(), slicer, isCustomBoundary);
    Assert.eq('', items, Arr.map(actual.items, (item) => {
      return item.item.id;
    }));
    Assert.eq('', abort, actual.abort);
  };

  check([], true, 'p1', WordWalking.left.slicer, Optional.none());
  check([], true, 'p1', WordWalking.right.slicer, Optional.none());
  check([], true, 'going_', WordWalking.left.slicer, Optional.none());
  check([ 'going_' ], true, 'going_', WordWalking.right.slicer, Optional.none());
  check([ 'to' ], false, 'to', WordWalking.left.slicer, Optional.none());
  check([ 'to' ], false, 'to', WordWalking.right.slicer, Optional.none());
  check([ '_b' ], true, '_b', WordWalking.left.slicer, Optional.none());
  check([], true, '_b', WordWalking.right.slicer, Optional.none());
  check([], true, 'br1', WordWalking.left.slicer, Optional.none());
  check([], true, 'br1', WordWalking.right.slicer, Optional.none());

  // TODO: Add tests around language
});
