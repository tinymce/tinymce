test(
  'Atomic Test: styles.StyleConversionsTest.js',

  [
    'ephox.agar.api.RawAssertions',
    'tinymce.themes.mobile.util.StyleConversions'
  ],

  function (RawAssertions, StyleConversions) {
    var input = [

    ];

    var output = StyleConversions.getAlpha(input);
    RawAssertions.assertEq('Checking input', {
      menus: { },
      expansions: { },
      items: [ ]
    }, output);
  }
);
