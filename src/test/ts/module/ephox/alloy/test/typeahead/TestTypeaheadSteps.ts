import { Assertions, Chain, FocusTools, Logger, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Focus } from '@ephox/sugar';

export default <any> function (doc, gui, typeahead) {
  const sWaitForMenu = function (label) {
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

  const sWaitForNoMenu = function (label) {
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

  const sAssertFocusOnTypeahead = function (label) {
    return Logger.t(
      label,
      FocusTools.sTryOnSelector(
        'Focus should be on typeahead',
        doc,
        'input'
      )
    );
  };

  const sAssertValue = function (label, expected) {
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
    sWaitForMenu,
    sWaitForNoMenu,
    sAssertFocusOnTypeahead,
    sAssertValue
  };
};