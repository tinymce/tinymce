import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsFlattenTest', () => {
  it('Optionals.flatten: unit tests', () => {
    assertOptional(Optionals.flatten(Optional.none<Optional<string>>()), Optional.none());
    assertOptional(Optionals.flatten(Optional.some(Optional.none<string>())), Optional.none());
    assertOptional(Optionals.flatten(Optional.some(Optional.some<string>('meow'))), Optional.some('meow'));
  });

  it('Optionals.flatten: some(some(x))', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertOptional(Optionals.flatten(Optional.some(Optional.some<number>(n))), Optional.some(n));
    }));
  });
});
