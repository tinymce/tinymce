import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const platform = PlatformDetection.detect();

// TODO: Move into shared library
const fakeEvent = (elm: SugarElement<HTMLElement>, name: string): void => {
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent(name, true, true);
  elm.dom.dispatchEvent(evt);
};

const pFindInDialog = async <T extends HTMLElement>(editor: Editor, selector: string): Promise<SugarElement<T>> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findIn<T>(dialog, selector).getOrDie();
};

const pAssertAlertInDialog = async (editor: Editor): Promise<boolean> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findIn(dialog, '.tox-notification--error').fold(Fun.never, Fun.always);
};

const pAssertFieldValue = async (editor: Editor, selector: string, value: string): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntilPredicate(`Wait for new ${selector} value`, () => {
    const result = UiFinder.findIn<HTMLInputElement>(dialog, selector);
    const actualValue = UiControls.getValue(result.getOrDie());
    return actualValue === value;
  });
};

const pSetFieldValue = async (editor: Editor, selector: string, value: string): Promise<void> => {
  const elm = await pFindInDialog<HTMLInputElement>(editor, selector);
  UiControls.setValue(elm, value);
  fakeEvent(elm, 'input');
};

const pOpenDialog = async (editor: Editor): Promise<SugarElement<Element>> => {
  TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Find and replace"]');
  return await TinyUiActions.pWaitForDialog(editor);
};

const pOpenDialogWithKeyboard = async (editor: Editor): Promise<void> => {
  TinyContentActions.keystroke(editor, 'F'.charCodeAt(0), platform.os.isMacOS() ? { meta: true } : { ctrl: true });
  await TinyUiActions.pWaitForDialog(editor);
};

const clickFind = (editor: Editor): SugarElement<HTMLElement> => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Find"]');
const clickNext = (editor: Editor): SugarElement<HTMLElement> => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Next"]');
const clickPrev = (editor: Editor): SugarElement<HTMLElement> => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Previous"]');
const clickReplace = (editor: Editor): SugarElement<HTMLElement> => TinyUiActions.clickOnUi(editor, '[role=dialog] button[title="Replace"]');
const clickClose = (editor: Editor): void => TinyUiActions.closeDialog(editor);

const pSelectPreference = async (editor: Editor, name: string): Promise<void> => {
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
  pOpenDialogWithKeyboard,
  pAssertFieldValue,
  pAssertAlertInDialog,
  pSelectPreference,
  pSetFieldValue
};
