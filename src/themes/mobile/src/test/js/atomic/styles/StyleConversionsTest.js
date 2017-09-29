test(
  'Atomic Test: styles.StyleConversionsTest',

  [
    'ephox.agar.api.RawAssertions',
    'tinymce.themes.mobile.util.StyleConversions'
  ],

  function (RawAssertions, StyleConversions) {
    var check = function (label, expected, input) {
      var output = StyleConversions.expand(input);
      RawAssertions.assertEq('StyleConversions.expand (' + label + ')', expected, output);
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
      'Input with three items, and an empty menu in the middle',
      {
        menus: {
          'beta': [ ]
        },
        expansions: {
          'beta': 'beta'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta', menu: true },
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
      'Input with three items, and a menu with a single item in the middle',
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
          { title: 'beta', menu: true },
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
      'Input with three items, and a menu with three items in the middle',
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
          { title: 'beta', menu: true },
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

    check(
      'Input with three items, and a menu (beta) with three items (beta1,2,3) in the middle' +
      ', with last subitem having a menu with no items (beta-3)',
      {
        menus: {
          'beta': [
            { title: 'beta-1' },
            { title: 'beta-2' },
            { title: 'beta-3', menu: true }
          ],
          'beta-3': [ ]
        },
        expansions: {
          'beta': 'beta',
          'beta-3': 'beta-3'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta', menu: true },
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
            {
              title: 'beta-3',
              items: [ ]
            }
          ]
        },
        { title: 'gamma' }
      ]
    );

    check(
      'Input with three items, and a menu with three items (beta-1,2,3) in the middle' +
      ', with last subitem having a menu with two items (beta-3-1,2) items, and that first item' +
      ' having one item (beta-3-1-1)',
      {
        menus: {
          'beta': [
            { title: 'beta-1' },
            { title: 'beta-2' },
            { title: 'beta-3', menu: true }
          ],
          'beta-3': [
            { title: 'beta-3-1', menu: true },
            { title: 'beta-3-2' }
          ],
          'beta-3-1': [
            { title: 'beta-3-1-1' }
          ]
        },
        expansions: {
          'beta': 'beta',
          'beta-3': 'beta-3',
          'beta-3-1': 'beta-3-1'
        },
        items: [
          { title: 'alpha' },
          { title: 'beta', menu: true },
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
            {
              title: 'beta-3',
              items: [
                {
                  title: 'beta-3-1',
                  items: [
                    { title: 'beta-3-1-1' }
                  ]
                },
                { title: 'beta-3-2' }
              ]
            }
          ]
        },
        { title: 'gamma' }
      ]
    );

  }
);
