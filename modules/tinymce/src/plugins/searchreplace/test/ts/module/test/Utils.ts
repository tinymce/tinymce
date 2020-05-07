import { Assertions, Chain, GeneralSteps, Guard, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

const cFakeEvent = (name: string) => Chain.label('Fake event',
  Chain.op((elm: Element) => {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent(name, true, true);
    elm.dom().dispatchEvent(evt);
  })
);

const cFindInDialog = (ui: TinyUi, selector: string) => Chain.control(
  Chain.fromChains([
    ui.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
    UiFinder.cFindIn(selector)
  ]),
  Guard.addLogging(`Find ${selector} in dialog`)
);

const sAssertFieldValue = (ui: TinyUi, selector: string, value: string) => Waiter.sTryUntil(`Wait for new ${selector} value`,
  Chain.asStep({}, [
    cFindInDialog(ui, selector),
    UiControls.cGetValue,
    Assertions.cAssertEq(`Assert ${value} value`, value)
  ]), 20, 3000
);

const sSetFieldValue = (ui: TinyUi, selector: string, value: string) => Chain.asStep({}, [
  cFindInDialog(ui, selector),
  UiControls.cSetValue(value),
  cFakeEvent('input')
]);

const sOpenDialog = (ui: TinyUi) => GeneralSteps.sequence([
  ui.sClickOnToolbar('click on searchreplace button', 'button[aria-label="Find and replace"]'),
  ui.sWaitForPopup('Wait for dialog', 'div[role="dialog"]')
]);

const sCloseDialog = (ui: TinyUi) =>
  // Note: Can't use UiChains.cCloseDialog here, as the dialog doesn't have a cancel button in the footer
  ui.sClickOnUi('Click cancel button', 'div[role="dialog"] button[aria-label=Close]');

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
  sSetFieldValue,
  sOpenDialog,
  sCloseDialog,
  sClickFind,
  sClickNext,
  sClickPrev,
  sSelectPreference
};
