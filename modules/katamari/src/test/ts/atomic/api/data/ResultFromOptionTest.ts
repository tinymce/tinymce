import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from 'ephox/katamari/api/Option';
import { Result } from 'ephox/katamari/api/Result';

UnitTest.test('Result.fromOption tests', function () {
  const extractError = <T, E>(result: Result<T, E>): Option<E> => {
    return result.fold(
      (e) => Option.some(e),
      () => Option.none()
    );
  };

  const testSanity = function () {
    const err = Result.fromOption(Option.none(), 'err');
    assert.eq('err', extractError(err).getOrDie('Could not get error value'));

    const val = Result.fromOption(Option.some('val'), 'err');
    assert.eq('val', val.getOrDie());
  };

  testSanity();
});
