import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { Gene } from 'ephox/boss/api/Gene';
import * as Locator from 'ephox/boss/mutant/Locator';
import * as Logger from 'ephox/boss/mutant/Logger';
import * as Removal from 'ephox/boss/mutant/Removal';
import * as Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('RemovalTest', () => {
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

  const check = (expected: string, input: Gene, itemId: string) => {
    const family = Tracks.track(input, Optional.none());
    const item = Locator.byId(family, itemId).getOrDie();
    Removal.unwrap(item);
    Assert.eq('', expected, Logger.basic(family));
  };

  check('A(B,D(E),F)', data(), 'C');
  check('A(B,C(D,F))', data(), 'E');
});
