import { assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Fun, Option } from '@ephox/katamari';
import { WordDecision } from 'ephox/robin/words/WordDecision';
import { WordWalking } from 'ephox/robin/words/WordWalking';

UnitTest.test('WordDecisionTest', function () {
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

  const check = function (items: string[], abort: boolean, id: string, slicer: (text: string) => Option<[number, number]>, _currLanguage: Option<string>) {
    const isCustomBoundary = Fun.constant(false);
    const actual = WordDecision.decide(universe, universe.find(universe.get(), id).getOrDie(), slicer, isCustomBoundary);
    assert.eq(items, Arr.map(actual.items, function (item) { return item.item.id; }));
    assert.eq(abort, actual.abort);
  };

  check([], true, 'p1', WordWalking.left.slicer, Option.none());
  check([], true, 'p1', WordWalking.right.slicer, Option.none());
  check([], true, 'going_', WordWalking.left.slicer, Option.none());
  check([ 'going_' ], true, 'going_', WordWalking.right.slicer, Option.none());
  check([ 'to' ], false, 'to', WordWalking.left.slicer, Option.none());
  check([ 'to' ], false, 'to', WordWalking.right.slicer, Option.none());
  check([ '_b' ], true, '_b', WordWalking.left.slicer, Option.none());
  check([], true, '_b', WordWalking.right.slicer, Option.none());
  check([], true, 'br1', WordWalking.left.slicer, Option.none());
  check([], true, 'br1', WordWalking.right.slicer, Option.none());

  // TODO: Add tests around language
});
