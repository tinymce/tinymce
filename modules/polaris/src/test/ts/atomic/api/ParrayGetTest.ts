import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.get', function () {
  const check = function (expected: Option<string>, input: string[], offset: number) {
    const parray = Parrays.make(input);
    const actual = PositionArray.get(parray, offset);
    KAssert.eqOption('eq', expected, actual.map((x) => x.item()));
  };

  check(Option.none(), [], 0);
  check(Option.some('a'), [ 'a' ], 0);
  check(Option.some('a'), [ 'a' ], 1);
  check(Option.none(), [ 'a' ], 2);
  check(Option.some('cat'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasaca'.length);
  check(Option.some('tomorrow'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandto'.length);
  check(Option.none(), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandtomorrow-'.length);
});
