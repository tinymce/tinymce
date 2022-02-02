import { describe, it } from '@ephox/bedrock-client';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsTraverseTest', () => {
  it('Optionals.traverse - unit tests', () => {
    assertSome(Optionals.traverse<number, string>(
      [],
      (_x: number): Optional<string> => {
        throw Error('no');
      }
    ), []);

    assertSome(Optionals.traverse<number, string>(
      [ 3 ],
      (x: number): Optional<string> => Optional.some(x + 'cat')
    ), [ '3cat' ]);

    assertNone(Optionals.traverse<number, string>(
      [ 3 ],
      (_x: number): Optional<string> => Optional.none()
    ));

    assertNone(Optionals.traverse<number, number>(
      [ 3, 4 ],
      (x: number): Optional<number> => Optionals.someIf(x === 3, x)
    ));
  });
});
