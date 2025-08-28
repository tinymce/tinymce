import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.find', () => {
  const check = (expected: Optional<string>, input: string[], value: string | null) => {
    const pred = (unit: Parrays.PArrayTestItem) => {
      return unit.item === value;
    };

    const parray = Parrays.make(input);
    const actual = PositionArray.find(parray, pred);
    KAssert.eqOptional('eq', expected, actual.map((x) => x.item));
  };

  check(Optional.none(), [], null);
  check(Optional.some('a'), [ 'a' ], 'a');
  check(Optional.some('a'), [ 'a' ], 'a');
  check(Optional.none(), [ 'a' ], 'b');
  check(Optional.some('cat'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'cat');
  check(Optional.some('tomorrow'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'tomorrow');
  check(Optional.none(), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'yesterday');
  check(Optional.some('this'), [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'this');
});
