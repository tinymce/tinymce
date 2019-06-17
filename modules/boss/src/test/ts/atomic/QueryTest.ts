import { assert, UnitTest } from '@ephox/bedrock';
import { Gene } from 'ephox/boss/api/Gene';
import { TestUniverse } from 'ephox/boss/api/TestUniverse';
import Query from 'ephox/boss/mutant/Query';

UnitTest.test('QueryTest', function () {
  const universe = TestUniverse(Gene('1', 'root', [
    Gene('1.1', 'duck', [
      Gene('1.1.1', 'goose', []),
      Gene('1.1.2', 'goose', [
        Gene('1.1.2.1', 'duck', []),
        Gene('1.1.2.2', 'duck', [
          Gene('1.1.2.2.1', 'goose', [])
        ])
      ]),
      Gene('1.1.3', 'duck', []),
      Gene('1.1.4', 'duck', [
        Gene('1.1.4.1', 'duck', [])
      ])
    ])
  ]));

  const checkPrev = function (expected: string, id: string) {
    const first = universe.find(universe.get(), id).getOrDie();
    const actual = Query.prevSibling(first).map((e) => e.id).getOr('_nope_');
    assert.eq(expected, actual);
  };

  const checkNext = function (expected: string, id: string) {
    const first = universe.find(universe.get(), id).getOrDie();
    const actual = Query.nextSibling(first).map((e) => e.id).getOr('_nope_');
    assert.eq(expected, actual);
  };

  const checkPosition = function (expected: number, one: string, other: string) {
    const first = universe.find(universe.get(), one).getOrDie();
    const last = universe.find(universe.get(), other).getOrDie();

    const actual = Query.comparePosition(first, last);
    assert.eq(expected, actual);
  };

  checkPosition(4, '1.1.1', '1.1.2');
  checkPosition(2, '1.1.2', '1.1.1');
  checkPosition(4, '1.1.1', '1.1.4.1');

  checkPrev('_nope_', '1.1.2.2.1');
  checkPrev('1.1.3', '1.1.4');

  checkNext('1.1.2', '1.1.1');
  checkNext('_nope_', '1.1.4');
});

