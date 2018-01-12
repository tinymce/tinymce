import { Assertions } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import Features from 'tinymce/themes/mobile/features/Features';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('features.FeatureDetectTest', function () {
  /*
   * Check that if the feature is not known, it skips over it
   *
   */
  const testFeature = function (name, supported) {
    return {
      isSupported: Fun.constant(supported),
      sketch: Fun.constant(name)
    };
  };

  const features = {
    alpha: testFeature('alpha', true),
    beta: testFeature('beta', false),
    gamma: testFeature('gamma', true),
    delta: testFeature('delta', true)
  };

  const check = function (label, expected, toolbar) {
    const actual = Features.detect({ toolbar }, features);
    Assertions.assertEq(label, expected, actual);
  };

  check('Empty toolbar', [ ], '');

  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon' ]);

  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'alpha', 'gamma', 'delta', 'epsilon' ]);
});
