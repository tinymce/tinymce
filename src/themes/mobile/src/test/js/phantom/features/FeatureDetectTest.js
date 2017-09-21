test(
  'features.FeatureDetectTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.features.Features'
  ],

  function (Assertions, Fun, Features) {
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
  }
);
