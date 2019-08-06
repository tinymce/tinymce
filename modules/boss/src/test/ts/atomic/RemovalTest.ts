import Locator from 'ephox/boss/mutant/Locator';
import Logger from 'ephox/boss/mutant/Logger';
import Removal from 'ephox/boss/mutant/Removal';
import Tracks from 'ephox/boss/mutant/Tracks';
import { Option } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';
import { Gene } from 'ephox/boss/api/Gene';

UnitTest.test('RemovalTest', function () {
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

  const check = function (expected: string, input: Gene, itemId: string) {
    const family = Tracks.track(input, Option.none());
    const item = Locator.byId(family, itemId).getOrDie();
    Removal.unwrap(item);
    assert.eq(expected, Logger.basic(family));
  };

  check('A(B,D(E),F)', data(), 'C');
  check('A(B,C(D,F))', data(), 'E');
});
