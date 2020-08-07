import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

UnitTest.test('Optionals.someIf: false -> none', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Optional.none(), Optionals.someIf<number>(false, n), tOptional());
  }));
});

UnitTest.test('Optionals.someIf: true -> some', () => {
  fc.assert(fc.property(fc.integer(), (n) => {
    Assert.eq('eq', Optional.some(n), Optionals.someIf<number>(true, n), tOptional());
  }));
});
