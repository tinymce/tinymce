import { FocusTools, Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Obj } from '@ephox/katamari';
import { Attribute, Class, SugarBody, SugarDocument, SugarElement, Traverse, Value } from '@ephox/sugar';
import { TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const doc = SugarDocument.getDocument();

const selectors = {
  href: 'label.tox-label:contains(URL) + div>div>input.tox-textfield',
  text: 'label.tox-label:contains(Text to display) + input.tox-textfield',
  title: 'label.tox-label:contains(Title) + input.tox-textfield',
  target: 'label.tox-label:contains(Open link in...) + div.tox-listboxfield > .tox-listbox',
  linklist: 'label.tox-label:contains(Link list) + div.tox-listboxfield > .tox-listbox'
};

const pOpenLinkDialog = async (editor: Editor): Promise<void> => {
  TinyUiActions.clickOnToolbar(editor, '[aria-label="Insert/edit link"]');
  await TinyUiActions.pWaitForDialog(editor);
};

const clickOnConfirmDialog = (editor: Editor, state: boolean): void => {
  TinyUiActions.clickOnUi(editor, '[role="dialog"].tox-confirm-dialog button:contains("' + (state ? 'Yes' : 'No') + '")');
};

const fireEvent = (elem: SugarElement, event: string): void => {
  const evt = new Event(event, {
    bubbles: true,
    cancelable: true
  });
  elem.dom.dispatchEvent(evt);
};

const getInput = (selector: string) =>
  UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();

const assertInputValue = (label: string, selector: string, expected: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    assert.equal(input.dom.checked, expected, `The input value for ${label} should be: ${expected}`);
  } else if (Class.has(input, 'tox-listbox')) {
    assert.equal(Attribute.get(input, 'data-value'), String(expected), `The input value for ${label} should be: ${expected}`);
  } else {
    assert.equal(Value.get(input), expected, `The input value for ${label} should be: ${expected}`);
  }
};

const assertDialogContents = (expected: Record<string, any>): void => {
  Obj.mapToArray(selectors, (value, key) => {
    if (Obj.has(expected, key)) {
      assertInputValue(key, value, expected[key]);
    }
  });
};

const pInsertLink = async (editor: Editor, url: string): Promise<void> => {
  await pOpenLinkDialog(editor);
  FocusTools.setActiveValue(doc, url);
  await pClickSave(editor);
};

const pAssertContentPresence = (editor: Editor, presence: Record<string, number>): Promise<void> =>
  Waiter.pTryUntil('Waiting for content to have expected presence', () => TinyAssertions.assertContentPresence(editor, presence));

const pWaitForDialogClose = (): Promise<void> => Waiter.pTryUntil(
  'Waiting for dialog to go away',
  () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]:not(.tox-confirm-dialog)')
);

const pWaitForConfirmClose = (): Promise<void> => Waiter.pTryUntil(
  'Waiting for confirm dialog to go away',
  () => UiFinder.notExists(SugarBody.body(), '[role="dialog"].tox-confirm-dialog')
);

const pClickSave = async (editor: Editor): Promise<void> => {
  TinyUiActions.submitDialog(editor);
  await pWaitForDialogClose();
};

const pClickCancel = async (editor: Editor): Promise<void> => {
  TinyUiActions.cancelDialog(editor);
  await pWaitForDialogClose();
};

const pClickConfirmYes = async (editor: Editor): Promise<void> => {
  clickOnConfirmDialog(editor, true);
  await pWaitForConfirmClose();
};

const pClickConfirmNo = async (editor: Editor): Promise<void> => {
  clickOnConfirmDialog(editor, false);
  await pWaitForConfirmClose();
};

const pFindInDialog = async <T extends Element>(editor: Editor, selector: string): Promise<SugarElement<T>> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findIn<T>(dialog, selector).getOrDie();
};

const clearHistory = (): void => {
  localStorage.removeItem('tinymce-url-history');
};

const pSetListBoxItem = async (editor: Editor, group: string, itemText: string): Promise<void> => {
  const element = await pFindInDialog(editor, 'label:contains("' + group + '") + .tox-listboxfield .tox-listbox');
  Mouse.click(element);
  const list = await UiFinder.pWaitForVisible('Wait for list to open', SugarBody.body(), '.tox-menu.tox-collection--list');
  const item = UiFinder.findIn(list, '.tox-collection__item-label:contains(' + itemText + ')').getOrDie();
  const parent = Traverse.parent(item).getOrDie('Failed to find parent');
  Mouse.click(parent);
};

const pSetInputFieldValue = async (editor: Editor, group: string, newValue: string): Promise<void> => {
  const element = await pFindInDialog<HTMLInputElement>(editor, 'label:contains("' + group + '") + input');
  UiControls.setValue(element, newValue);
  fireEvent(element, 'input');
};

export const TestLinkUi = {
  assertInputValue,
  pAssertContentPresence,
  pOpenLinkDialog,
  fireEvent,
  pFindInDialog,
  assertDialogContents,
  pClickSave,
  pClickCancel,
  pWaitForDialogClose,
  pClickConfirmYes,
  pClickConfirmNo,
  pInsertLink,
  clearHistory,
  pSetListBoxItem,
  pSetInputFieldValue
};
