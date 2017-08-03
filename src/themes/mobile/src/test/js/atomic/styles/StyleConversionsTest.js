test(
  'Atomic Test: styles.StyleConversionsTest.js',

  [
    'ephox.agar.api.RawAssertions',
    'tinymce.themes.mobile.util.StyleConversions'
  ],

  function (RawAssertions, StyleConversions) {
    var check = function (label, expected, input) {
      var output = StyleConversions.getAlpha(input);
      RawAssertions.assertEq('StyleConversions.getAlpha (' + label + ')', expected, output);
    };

    check(
      'Empty input',
      {
        menus: { },
        expansions: { },
        items: [ ]
      },
      [ ]
    );

  }
);
