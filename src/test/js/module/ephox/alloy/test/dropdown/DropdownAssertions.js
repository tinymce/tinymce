define(
  'ephox.alloy.test.dropdown.DropdownAssertions',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.UiFinder',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Width',
    'global!Math'
  ],

  function (Assertions, Chain, Logger, UiFinder, Css, Width, Math) {
    var sSameWidth = function (label, gui, dropdown, menuSelector) {
      return Logger.t(
        label + '\nChecking that the hotspot width is passed onto the menu width',
        Chain.asStep(gui.element(), [
          UiFinder.cFindIn(menuSelector),
          Chain.op(function (menu) {
            var dropdownWidth = Width.get(dropdown.element());
            var menuWidth = parseInt(
              Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
              10
            );

            Assertions.assertEq(
              'Check that the menu width is approximately the same as the hotspot width',
              true,
              Math.abs(menuWidth - dropdownWidth) < 20
            );
          })
        ])
      );
    };

    return {
      sSameWidth: sSameWidth
    };
  }
);