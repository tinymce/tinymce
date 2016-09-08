test(
  'MenuPathingTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.menu.state.MenuPathing',
    'ephox.wrap.Jsc'
  ],

  function (RawAssertions, MenuPathing, Jsc) {
    var actual = MenuPathing.generate({ }, { });    
    assert.eq({ }, actual);

    var check = function (label, expected, menus, expansions) {
      var actual = MenuPathing.generate(menus, expansions);
      RawAssertions.assertEq(label, expected, actual);
    };

    check('Base case', { }, { }, { });
    check('Simple case: one flat menu', {
      'item-1': [ 'm1' ],
      'item-2': [ 'm1' ],
      'item-3': [ 'm1' ]
    }, {
      'm1': [ 'item-1', 'item-2', 'item-3' ]
    }, { });

    check('Simple case: two flat menus', {
      'item-1': [ 'm1' ],
      'item-2': [ 'm1' ],
      'item-3': [ 'm1' ],
      'item-4': [ 'm2' ],
      'item-5': [ 'm2' ],
      'item-6': [ 'm2' ]
    }, {
      'm1': [ 'item-1', 'item-2', 'item-3' ],
      'm2': [ 'item-4', 'item-5', 'item-6' ]
    }, { });

    check('Advanced case: one submenu', {
      'item-1': [ 'm1' ],
      'item-2': [ 'm1' ],
      'subitem-1': [ 'm2', 'm1' ]
    }, {
      m1: [ 'item-1', 'item-2' ],
      m2: [ 'subitem-1' ]
    }, {
      'item-1': 'm2'
    });


    Jsc.property(
      '*** No property checking anything for MenuPathing yet',
      function () {
        return true;
      }
    );
  }
);