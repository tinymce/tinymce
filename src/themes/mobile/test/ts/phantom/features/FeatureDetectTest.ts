import { Assertions } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import Features from 'tinymce/themes/mobile/features/Features';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('features.FeatureDetectTest', function() {
  /*
   * Check that if the feature is not known, it skips over it
   *
   */
  var testFeature = function (name, supported) {
    return {
      isSupported: Fun.constant(supported),
      sketch: Fun.constant(name)
    };
  };

  var features = {
    alpha: testFeature('alpha', true),
    beta: testFeature('beta', false),
    gamma: testFeature('gamma', true),
    delta: testFeature('delta', true)
  };

  var check = function (label, expected, toolbar) {
    var actual = Features.detect({ toolbar: toolbar }, features);
    Assertions.assertEq(label, expected, actual);
  };

  check('Empty toolbar', [ ], '');


  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon' ]);

  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'alpha', 'gamma', 'delta', 'epsilon' ]);
});

