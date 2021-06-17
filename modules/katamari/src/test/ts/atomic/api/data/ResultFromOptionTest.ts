import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import { Result } from 'ephox/katamari/api/Result';

describe('atomic.katamari.api.data.ResultFromOptionTest', () => {
  it('unit tests', () => {
    const extractError = <T, E>(result: Result<T, E>): Optional<E> => result.fold(
      (e) => Optional.some(e),
      () => Optional.none()
    );

    const err = Result.fromOption(Optional.none(), 'err');
    assert.equal(extractError(err).getOrDie('Could not get error value'), 'err');

    const val = Result.fromOption(Optional.some('val'), 'err');
    assert.equal(val.getOrDie(), 'val');
  });
});
