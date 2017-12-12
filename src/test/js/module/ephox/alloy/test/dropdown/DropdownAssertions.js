import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Css } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

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

export default <any> {
  sSameWidth: sSameWidth
};