import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse } from '@ephox/boss';
import { KAssert } from '@ephox/katamari-assertions';

import { Direction, Transition } from 'ephox/phoenix/api/data/Types';
import * as Walker from 'ephox/phoenix/gather/Walker';
import { Walkers } from 'ephox/phoenix/gather/Walkers';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('WalkerTest', () => {
  const universe = TestUniverse(
    Gene('a', 'node', [
      Gene('b', 'node', []),
      Gene('c', 'node', [
        Gene('d', 'node', []),
        Gene('e', 'node', [])
      ])
    ])
  );

  const checkNone = (id: string, traverse: Transition, direction: Direction) => {
    const item = Finder.get(universe, id);
    KAssert.eqNone('eq', traverse(universe, item, direction));
  };

  const check = (expected: string, id: string, traverse: Transition, direction: Direction) => {
    const item = Finder.get(universe, id);
    const actual = traverse(universe, item, direction).map((x) => x.item.id);
    KAssert.eqSome('eq', expected, actual);
  };

  checkNone('a', Walker.backtrack, Walkers.left());
  check('a', 'b', Walker.backtrack, Walkers.left());
  check('a', 'c', Walker.backtrack, Walkers.left());
  check('c', 'd', Walker.backtrack, Walkers.left());
  check('c', 'e', Walker.backtrack, Walkers.left());

  checkNone('a', Walker.sidestep, Walkers.left());
  checkNone('b', Walker.sidestep, Walkers.left());
  check('b', 'c', Walker.sidestep, Walkers.left());
  checkNone('d', Walker.sidestep, Walkers.left());
  check('d', 'e', Walker.sidestep, Walkers.left());

  check('c', 'a', Walker.advance, Walkers.left());
  checkNone('b', Walker.advance, Walkers.left());
  check('e', 'c', Walker.advance, Walkers.left());
  checkNone('d', Walker.advance, Walkers.left());
  checkNone('e', Walker.advance, Walkers.left());

  checkNone('a', Walker.backtrack, Walkers.right());
  check('a', 'b', Walker.backtrack, Walkers.right());
  check('a', 'c', Walker.backtrack, Walkers.right());
  check('c', 'd', Walker.backtrack, Walkers.right());
  check('c', 'e', Walker.backtrack, Walkers.right());

  checkNone('a', Walker.sidestep, Walkers.right());
  check('c', 'b', Walker.sidestep, Walkers.right());
  checkNone('c', Walker.sidestep, Walkers.right());
  check('e', 'd', Walker.sidestep, Walkers.right());
  checkNone('e', Walker.sidestep, Walkers.right());

  check('b', 'a', Walker.advance, Walkers.right());
  checkNone('b', Walker.advance, Walkers.right());
  check('d', 'c', Walker.advance, Walkers.right());
  checkNone('d', Walker.advance, Walkers.right());
  checkNone('e', Walker.advance, Walkers.right());
});
