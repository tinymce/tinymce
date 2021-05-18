import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { TinyUiActions } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const fakeEvent = (elm: SugarElement<HTMLElement>, name: string) => {
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent(name, true, true);
  elm.dom.dispatchEvent(evt);
};

const pFindInDialog = async (editor: Editor, selector: string) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor, 'div[role="dialog"]');
  return UiFinder.findIn(dialog, selector);
};

const pAssertFieldValue = async (editor: Editor, selector: string, value: string) => {
  await Waiter.pTryUntil('', async () => {
    const result = await pFindInDialog(editor, selector);
    const actualValue = UiControls.getValue(result.getOrDie());
    return actualValue === value;
  });
};

const pSetFieldValue = async (editor: Editor, selector: string, value: string) => {
  const elm = (await pFindInDialog(editor, selector)).getOrDie();
  UiControls.setValue(elm, value);
  fakeEvent(elm, 'input');
};

const pOpenDialog = async (editor: Editor) => {
  TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Find and replace"]');
  await TinyUiActions.pWaitForDialog(editor, 'div[role="dialog"]');
};

const clickFind = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button:contains("Find")');
const clickNext = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Next"]');
const clickPrev = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Previous"]');
const clickReplace = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Replace"]');
const clickClose = (editor: Editor) => TinyUiActions.clickOnUi(editor, '[role=dialog] button[aria-label="Close"]');

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
