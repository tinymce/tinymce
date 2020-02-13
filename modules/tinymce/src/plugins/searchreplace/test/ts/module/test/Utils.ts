import { Assertions, Chain, GeneralSteps, Guard, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { TinyUi } from '@ephox/mcagar';

const cFindInDialog = (ui: TinyUi, selector: string) => {
  return Chain.control(
    Chain.fromChains([
      ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
      UiFinder.cFindIn(selector)
    ]),
    Guard.addLogging(`Find ${selector} in dialog`)
  );
};

const sAssertFieldValue = (ui: TinyUi, selector: string, value: string) => {
  return Waiter.sTryUntil(`Wait for new ${selector} value`,
    Chain.asStep({}, [
      cFindInDialog(ui, selector),
      UiControls.cGetValue,
      Assertions.cAssertEq(`Assert ${value} value`, value)
    ]), 20, 3000
  );
};

const sOpenDialog = (ui: TinyUi) => {
  return GeneralSteps.sequence([
    ui.sClickOnToolbar('click on searchreplace button', 'button[aria-label="Find and replace"]'),
    ui.sWaitForPopup('Wait for dialog', 'div[role="dialog"]')
  ]);
};

const sCloseDialog = (ui: TinyUi) => {
  // Note: Can't use UiChains.cCloseDialog here, as the dialog doesn't have a cancel button in the footer
  return ui.sClickOnUi('Click cancel button', 'div[role="dialog"] button[aria-label=Close]');
};

const sClickFind = (ui) => ui.sClickOnUi('Click find', '[role=dialog] button:contains("Find")');
const sClickNext = (ui) => ui.sClickOnUi('Click next', '[role=dialog] button[title="Next"]');
const sClickPrev = (ui) => ui.sClickOnUi('Click previous', '[role=dialog] button[title="Previous"]');

const sSelectPreference = (ui, name: string) => GeneralSteps.sequence([
  ui.sClickOnUi('Click preferences', 'button[title="Preferences"]'),
  ui.sWaitForPopup('Wait for menu to show', '.tox-selected-menu[role=menu]'),
  ui.sClickOnUi('Click preferences menu item', '.tox-selected-menu[role=menu] div[title="' + name + '"]')
]);

export {
  cFindInDialog,
  sAssertFieldValue,
  sOpenDialog,
  sCloseDialog,
  sClickFind,
  sClickNext,
  sClickPrev,
  sSelectPreference
};
