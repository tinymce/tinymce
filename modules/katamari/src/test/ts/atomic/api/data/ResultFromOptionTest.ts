import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from 'ephox/katamari/api/Optional';
import { Result } from 'ephox/katamari/api/Result';

UnitTest.test('Result.fromOption tests', function () {
  const extractError = <T, E>(result: Result<T, E>): Optional<E> => result.fold(
    (e) => Optional.some(e),
    () => Optional.none()
  );

  const testSanity = function () {
    const err = Result.fromOption(Optional.none(), 'err');
    Assert.eq('eq', 'err', extractError(err).getOrDie('Could not get error value'));

    const val = Result.fromOption(Optional.some('val'), 'err');
    Assert.eq('eq', 'val', val.getOrDie());
  };

  testSanity();
});
