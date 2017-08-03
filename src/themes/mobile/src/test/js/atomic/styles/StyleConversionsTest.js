test(
  'Atomic Test: styles.StyleConversionsTest',

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

    check(
      'Input with one flat item',
      {
        menus: { },
        expansions: { },
        items: [
          { title: 'alpha' }
        ]
      },
      [
        { title: 'alpha' }
      ]
    );

    check(
      'Input with three flat items',
      {
        menus: { },
        expansions: { },
        items: [
          { title: 'alpha' },
          { title: 'beta' },
          { title: 'gamma' }
        ]
      },
      [
        { title: 'alpha' },
        { title: 'beta' },
        { title: 'gamma' }
      ]
    );

  }
);
