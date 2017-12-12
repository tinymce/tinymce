import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { UiControls } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { Focus } from '@ephox/sugar';



export default <any> function (doc, gui, typeahead) {
  var sWaitForMenu = function (label) {
    return Logger.t(
      label,
      Waiter.sTryUntil(
        'Waiting for menu to appear',
        UiFinder.sExists(gui.element(), '.selected-menu'),
        100,
        4000
      )
    );
  };

  var sWaitForNoMenu = function (label) {
    return Logger.t(
      label,
      Waiter.sTryUntil(
        'Waiting for menu to go away',
        UiFinder.sNotExists(gui.element(), '.selected-menu'),
        100,
        1000
      )
    );
  };

  var sAssertFocusOnTypeahead = function (label) {
    return Logger.t(
      label,
      FocusTools.sTryOnSelector(
        'Focus should be on typeahead',
        doc,
        'input'
      )
    );
  };

  var sAssertValue = function (label, expected) {
    return Logger.t(
      label,
      Chain.asStep(typeahead.element(), [
        Chain.op(function (t) {
          Focus.focus(t);
        }),
        UiControls.cGetValue,
        Assertions.cAssertEq('Checking value of typeahead', expected)
      ])
    );
  };

  return {
    sWaitForMenu: sWaitForMenu,
    sWaitForNoMenu: sWaitForNoMenu,
    sAssertFocusOnTypeahead: sAssertFocusOnTypeahead,
    sAssertValue: sAssertValue
  };
};