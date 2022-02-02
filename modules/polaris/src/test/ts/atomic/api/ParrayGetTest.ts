import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.get', () => {
  const check = (expected: Optional<string>, input: string[], offset: number) => {
    const parray = Parrays.make(input);
    const actual = PositionArray.get(parray, offset);
    KAssert.eqOptional('eq', expected, actual.map((x) => x.item));
  };

  check(Optional.none(), [], 0);
  check(Optional.some('a'), [ 'a' ], 0);
  check(Optional.some('a'), [ 'a' ], 1);
  check(Optional.none(), [ 'a' ], 2);
  check(Optional.some('cat'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasaca'.length);
  check(Optional.some('tomorrow'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandto'.length);
  check(Optional.none(), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandtomorrow-'.length);
});
