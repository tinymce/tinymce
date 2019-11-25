import SmoothAnimation from 'tinymce/themes/mobile/ios/smooth/SmoothAnimation';
import { UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('Smooth Animation AdjustTest', function () {
  const checkNone = function (label, value, destination, amount) {
    const actual = SmoothAnimation.adjust(value, destination, amount);
    KAssert.eqNone(label, actual);
  };

  const check = function (label, expected, value, destination, amount) {
    const actual = SmoothAnimation.adjust(value, destination, amount);
    KAssert.eqSome(label, expected, actual);
  };

  checkNone(
    'Already at target',
    10, 10, 5
  );

  checkNone(
    'Within target from below',
    9, 10, 5
  );

  checkNone(
    'Within target from above',
    11, 10, 5
  );

  checkNone(
    '-Amount away from target',
    8, 10, 2
  );

  checkNone(
    '+Amount away from target',
    12, 10, 2
  );

  check(
    'Far above target',
    100,
    200, 50, 100
  );

  check(
    'Far below target',
    100,
    0, 250, 100
  );
});
