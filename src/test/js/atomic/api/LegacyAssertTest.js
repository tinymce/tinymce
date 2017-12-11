import LegacyAssert from 'ephox/agar/api/LegacyAssert';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import { UnitTest } from '@ephox/refute';

UnitTest.test('LegacyAssertTest', function() {
  LegacyAssert.eq({ test: 'blah', someKey: [ 'house', 'car'], hello: true },
            { test: 'blah', someKey: [ 'house', 'car'], hello: true });

  LegacyAssert.throws(function () { throw 'Some exception'; }, 'Some exception', 'Exception did not happen!');

  LegacyAssert.throwsError(function () { throw new Error('Some exception'); }, 'Some exception', 'Exception did not happen!');

  LegacyAssert.succeeds(function () { }, 'Exception happened!');

  try {
    LegacyAssert.fail('fail');
  } catch (e) {
    RawAssertions.assertEq('Should be expected message', 'fail', e.message);
  }

  RawAssertions.assertEq('Should be expected structure', { expected: 'e', actual: 'a', message: 'm' }, LegacyAssert.html('e', 'a', 'm'));
});

