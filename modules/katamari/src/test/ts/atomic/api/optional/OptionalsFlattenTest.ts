import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

UnitTest.test('Optionals.flatten: unit tests', function () {
  Assert.eq('none', Optional.none(), Optionals.flatten(Optional.none<Optional<string>>()), tOptional());
  Assert.eq('some(none)', Optional.none(), Optionals.flatten(Optional.some(Optional.none<string>())), tOptional());
  Assert.eq('some(some)', Optional.some('meow'), Optionals.flatten(Optional.some(Optional.some<string>('meow'))), tOptional());
});

UnitTest.test('Optionals.flatten: some(some(x))', () => {
  fc.assert(fc.property(fc.integer(), function (n) {
    Assert.eq('eq', Optional.some(n), Optionals.flatten(Optional.some(Optional.some<number>(n))), tOptional());
  }));
});
