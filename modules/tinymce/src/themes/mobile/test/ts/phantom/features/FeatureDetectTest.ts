import { Assertions } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import * as Features from 'tinymce/themes/mobile/features/Features';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('features.FeatureDetectTest', () => {
  /*
   * Check that if the feature is not known, it skips over it
   *
   */
  const testFeature = (name: string, supported: boolean) => ({
    isSupported: Fun.constant(supported),
    sketch: Fun.constant(name)
  });

  const features = {
    alpha: testFeature('alpha', true),
    beta: testFeature('beta', false),
    gamma: testFeature('gamma', true),
    delta: testFeature('delta', true)
  };

  const check = (label: string, expected: string[], toolbar: string | string[]) => {
    const dummyEditor = {
      getParam: () => toolbar
    };
    const actual = Features.detect(dummyEditor as any, features);
    Assertions.assertEq(label, expected, actual);
  };

  check('Empty toolbar', [ ], '');

  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon' ]);

  check('Toolbar with everything', [ 'alpha', 'gamma', 'delta' ], [ 'alpha', 'beta', 'alpha', 'gamma', 'delta', 'epsilon' ]);
});
