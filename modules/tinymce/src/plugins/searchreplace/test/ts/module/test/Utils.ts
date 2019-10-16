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

export {
  cFindInDialog,
  sAssertFieldValue,
  sOpenDialog,
  sCloseDialog
};
