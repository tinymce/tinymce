import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { SugarElement } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

// TODO: Move into shared library
const fakeEvent = (elm: SugarElement<HTMLElement>, name: string) => {
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent(name, true, true);
  elm.dom.dispatchEvent(evt);
};

const pFindInDialog = async (editor: Editor, selector: string) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findIn(dialog, selector).getOrDie();
};

const pAssertFieldValue = async (editor: Editor, selector: string, value: string) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntilPredicate(`Wait for new ${selector} value`, () => {
    const result = UiFinder.findIn(dialog, selector);
    const actualValue = UiControls.getValue(result.getOrDie());
    return actualValue === value;
  });
};

const pSetFieldValue = async (editor: Editor, selector: string, value: string) => {
  const elm = await pFindInDialog(editor, selector);
  UiControls.setValue(elm, value);
  fakeEvent(elm, 'input');
};

const pOpenDialog = async (editor: Editor) => {
  TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Find and replace"]');
  return await TinyUiActions.pWaitForDialog(editor);
};

const clickFind = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Find"]');
const clickNext = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Next"]');
const clickPrev = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Previous"]');
const clickReplace = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Replace"]');
const clickClose = (editor: Editor) => TinyUiActions.closeDialog(editor);

const pSelectPreference = async (editor: Editor, name: string) => {
  TinyUiActions.clickOnUi(editor, 'button[title="Preferences"]');
  await TinyUiActions.pWaitForPopup(editor, '.tox-selected-menu[role=menu]');
  TinyUiActions.clickOnUi(editor, '.tox-selected-menu[role=menu] div[title="' + name + '"]');
};

export {
  clickFind,
  clickNext,
  clickPrev,
  clickReplace,
  clickClose,
  pOpenDialog,
  pAssertFieldValue,
  pSelectPreference,
  pSetFieldValue
};
