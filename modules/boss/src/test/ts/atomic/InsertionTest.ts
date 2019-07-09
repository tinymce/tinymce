import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Option } from '@ephox/katamari';
import Insertion from 'ephox/boss/mutant/Insertion';
import Locator from 'ephox/boss/mutant/Locator';
import Logger from 'ephox/boss/mutant/Logger';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Gene } from 'ephox/boss/api/Gene';

UnitTest.test('InsertionTest', function () {
  const data = function (): Gene {
    return Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]);
  };

  const check = function (expected: string, method: (a: Gene, b: Gene) => void, input: Gene, anchorId: string, itemId: string) {
    const family = Tracks.track(input, Option.none());
    const anchor = Locator.byId(family, anchorId).getOrDie();
    const item = Locator.byId(family, itemId).getOrDie();
    method(anchor, item);
    assert.eq(expected, Logger.basic(family));
  };

  const checkBefore = function (expected: string, input: Gene, anchorId: string, itemId: string) {
    check(expected, Insertion.before, input, anchorId, itemId);
  };

  const checkAfter = function (expected: string, input: Gene, anchorId: string, itemId: string) {
    check(expected, Insertion.after, input, anchorId, itemId);
  };

  const checkWrap = function (expected: string, input: Gene, anchorId: string, wrapper: Gene) {
    const family = Tracks.track(input, Option.none());
    const anchor = Locator.byId(family, anchorId).getOrDie();
    Insertion.wrap(anchor, wrapper);
    assert.eq(expected, Logger.basic(family));
  };

  // initially A(B,C(D(E),F))
  checkBefore('A(B,C(D(F,E)))', data(), 'E', 'F');
  checkBefore('A(F,B,C(D(E)))', data(), 'B', 'F');
  checkBefore('A(B,C(E,D,F))', data(), 'D', 'E');

  checkAfter('A(B,F,C(D(E)))', data(), 'B', 'F');
  checkAfter('A(B,C(D,E,F))', data(), 'D', 'E');

  checkWrap('A(B,C(D(WRAPPER(E)),F))', data(), 'E', Gene('WRAPPER', '.'));
  checkWrap('A(WRAPPER(B),C(D(E),F))', data(), 'B', Gene('WRAPPER', '.'));

  const checkAfterAll = function (expected: string, input: Gene, anchorId: string, itemIds: string[]) {
    const family = Tracks.track(input, Option.none());
    const anchor = Locator.byId(family, anchorId).getOrDie('Did not find anchor: ' + anchorId);
    const items = Arr.map(itemIds, function (itemId) {
      return Locator.byId(family, itemId).getOrDie('Did not find item: ' + itemId);
    });
    Insertion.afterAll(anchor, items);
    assert.eq(expected, Logger.basic(family));
  };

  checkAfterAll('A(B,C(D,E,F))', data(), 'D', ['E', 'F']);
});
