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

    check(
      'Input with three flat items, and an empty menu in between',
      {
        menus: {
          'beta': [ ]
        },
        expansions: {
          'beta': 'beta'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta' },
          { title: 'gamma' }
        ]
      },
      [
        { title: 'alpha' },
        {
          title: 'beta',
          items: [ ]
        },
        { title: 'gamma' }
      ]
    );

    check(
      'Input with three flat items, and a menu with a single item in between',
      {
        menus: {
          'beta': [
            { title: 'beta-1' }
          ]
        },
        expansions: {
          'beta': 'beta'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta' },
          { title: 'gamma' }
        ]
      },
      [
        { title: 'alpha' },
        {
          title: 'beta',
          items: [
            { title: 'beta-1' }
          ]
        },
        { title: 'gamma' }
      ]
    );

    check(
      'Input with three flat items, and a menu with three items in between',
      {
        menus: {
          'beta': [
            { title: 'beta-1' },
            { title: 'beta-2' },
            { title: 'beta-3' }
          ]
        },
        expansions: {
          'beta': 'beta'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta' },
          { title: 'gamma' }
        ]
      },
      [
        { title: 'alpha' },
        {
          title: 'beta',
          items: [
            { title: 'beta-1' },
            { title: 'beta-2' },
            { title: 'beta-3' }
          ]
        },
        { title: 'gamma' }
      ]
    );

  }
);
