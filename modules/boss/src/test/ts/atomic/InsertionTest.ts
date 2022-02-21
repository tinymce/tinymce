import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';

import { Gene } from 'ephox/boss/api/Gene';
import * as Insertion from 'ephox/boss/mutant/Insertion';
import * as Locator from 'ephox/boss/mutant/Locator';
import * as Logger from 'ephox/boss/mutant/Logger';
import * as Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('InsertionTest', () => {
  const data = (): Gene => {
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

  const check = (expected: string, method: (a: Gene, b: Gene) => void, input: Gene, anchorId: string, itemId: string) => {
    const family = Tracks.track(input, Optional.none());
    const anchor = Locator.byId(family, anchorId).getOrDie();
    const item = Locator.byId(family, itemId).getOrDie();
    method(anchor, item);
    Assert.eq('', expected, Logger.basic(family));
  };

  const checkBefore = (expected: string, input: Gene, anchorId: string, itemId: string) => {
    check(expected, Insertion.before, input, anchorId, itemId);
  };

  const checkAfter = (expected: string, input: Gene, anchorId: string, itemId: string) => {
    check(expected, Insertion.after, input, anchorId, itemId);
  };

  const checkWrap = (expected: string, input: Gene, anchorId: string, wrapper: Gene) => {
    const family = Tracks.track(input, Optional.none());
    const anchor = Locator.byId(family, anchorId).getOrDie();
    Insertion.wrap(anchor, wrapper);
    Assert.eq('', expected, Logger.basic(family));
  };

  // initially A(B,C(D(E),F))
  checkBefore('A(B,C(D(F,E)))', data(), 'E', 'F');
  checkBefore('A(F,B,C(D(E)))', data(), 'B', 'F');
  checkBefore('A(B,C(E,D,F))', data(), 'D', 'E');

  checkAfter('A(B,F,C(D(E)))', data(), 'B', 'F');
  checkAfter('A(B,C(D,E,F))', data(), 'D', 'E');

  checkWrap('A(B,C(D(WRAPPER(E)),F))', data(), 'E', Gene('WRAPPER', '.'));
  checkWrap('A(WRAPPER(B),C(D(E),F))', data(), 'B', Gene('WRAPPER', '.'));

  const checkAfterAll = (expected: string, input: Gene, anchorId: string, itemIds: string[]) => {
    const family = Tracks.track(input, Optional.none());
    const anchor = Locator.byId(family, anchorId).getOrDie('Did not find anchor: ' + anchorId);
    const items = Arr.map(itemIds, (itemId) => {
      return Locator.byId(family, itemId).getOrDie('Did not find item: ' + itemId);
    });
    Insertion.afterAll(anchor, items);
    Assert.eq('', expected, Logger.basic(family));
  };

  checkAfterAll('A(B,C(D,E,F))', data(), 'D', [ 'E', 'F' ]);
});
