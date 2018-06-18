import { Assertions, Chain, FocusTools, Logger, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Focus } from '@ephox/sugar';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { GuiSystem } from 'ephox/alloy/api/system/Gui';
import { SugarDocument } from 'ephox/alloy/alien/TypeDefinitions';

export default (doc: SugarDocument, gui: GuiSystem, typeahead: AlloyComponent) => {
  const sWaitForMenu = (label: string) => {
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

  const sWaitForNoMenu = (label: string) => {
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

  const sAssertFocusOnTypeahead = (label: string) => {
    return Logger.t(
      label,
      FocusTools.sTryOnSelector(
        'Focus should be on typeahead',
        doc,
        'input'
      )
    );
  };

  const sAssertValue = (label: string, expected: string) => {
    return Logger.t(
      label,
      Chain.asStep(typeahead.element(), [
        Chain.op((t) => {
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