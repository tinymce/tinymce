import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.find', function () {
  const check = function (expected: Option<string>, input: string[], value: string | null) {
    const pred = function (unit: Parrays.PArrayTestItem) {
      return unit.item() === value;
    };

    const parray = Parrays.make(input);
    const actual = PositionArray.find(parray, pred);
    KAssert.eqOption('eq', expected, actual.map((x) => x.item()));
  };

  check(Option.none(), [], null);
  check(Option.some('a'), [ 'a' ], 'a');
  check(Option.some('a'), [ 'a' ], 'a');
  check(Option.none(), [ 'a' ], 'b');
  check(Option.some('cat'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'cat');
  check(Option.some('tomorrow'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'tomorrow');
  check(Option.none(), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'yesterday');
  check(Option.some('this'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'this');
});
