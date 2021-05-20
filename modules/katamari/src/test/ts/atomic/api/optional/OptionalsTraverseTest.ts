import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';

describe('atomic.katamari.api.optional.OptionalsTraverseTest', () => {
  it('Optionals.traverse - unit tests', () => {
    assert.deepEqual(Optionals.traverse<number, string>(
      [],
      (_x: number): Optional<string> => {
        throw Error('no');
      }
    ), Optional.some([]));

    assert.deepEqual(Optionals.traverse<number, string>(
      [ 3 ],
      (x: number): Optional<string> => Optional.some(x + 'cat')
    ), Optional.some([ '3cat' ]));

    assert.deepEqual(Optionals.traverse<number, string>(
      [ 3 ],
      (_x: number): Optional<string> => Optional.none()
    ), Optional.none());

    assert.deepEqual(Optionals.traverse<number, number>(
      [ 3, 4 ],
      (x: number): Optional<number> => Optionals.someIf(x === 3, x)
    ), Optional.none());
  });
});
