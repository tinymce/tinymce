import { FocusTools, Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Obj } from '@ephox/katamari';
import { Attribute, Class, SugarBody, SugarDocument, SugarElement, Traverse, Value } from '@ephox/sugar';
import { TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const doc = SugarDocument.getDocument();

const labels = {
  href: 'URL',
  text: 'Text to display',
  title: 'Title',
  target: 'Open link in...',
  linklist: 'Link list'
};

const pOpenLinkDialog = async (editor: Editor): Promise<void> => {
  TinyUiActions.clickOnToolbar(editor, '[aria-label="Insert/edit link"]');
  await TinyUiActions.pWaitForDialog(editor);
};

const clickOnConfirmDialog = (editor: Editor, state: boolean): void => {
  TinyUiActions.clickOnUi(editor, '[role="dialog"].tox-confirm-dialog button:contains("' + (state ? 'Yes' : 'No') + '")');
};

const getInput = (labelText: string) =>
  UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), labelText).getOrDie();

const assertInputValue = (propertyKey: string, labelText: string, expected: string | boolean): void => {
  const input = getInput(labelText);
  if (input.dom.type === 'checkbox') {
    assert.equal(input.dom.checked, expected, `The input value for ${propertyKey} should be: ${expected}`);
  } else if (Class.has(input, 'tox-listbox')) {
    assert.equal(Attribute.get(input, 'data-value'), String(expected), `The input value for ${propertyKey} should be: ${expected}`);
  } else {
    assert.equal(Value.get(input), expected, `The input value for ${propertyKey} should be: ${expected}`);
  }
};

const assertDialogContents = (expected: Record<string, any>): void => {
  Obj.mapToArray(labels, (value, key) => {
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

const pFindTargetByLabelInDialog = async <T extends Element>(editor: Editor, label: string): Promise<SugarElement<T>> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findTargetByLabel<T>(dialog, label).getOrDie();
};

const clearHistory = (): void => {
  localStorage.removeItem('tinymce-url-history');
};

const pSetListBoxItem = async (editor: Editor, group: string, itemText: string): Promise<void> => {
  const element = await pFindTargetByLabelInDialog(editor, group);
  Mouse.click(element);
  const list = await UiFinder.pWaitForVisible('Wait for list to open', SugarBody.body(), '.tox-menu.tox-collection--list');
  const item = UiFinder.findIn(list, '.tox-collection__item-label:contains(' + itemText + ')').getOrDie();
  const parent = Traverse.parent(item).getOrDie('Failed to find parent');
  Mouse.click(parent);
};

const pSetInputFieldValue = async (editor: Editor, group: string, newValue: string): Promise<void> => {
  const element = await pFindTargetByLabelInDialog<HTMLInputElement>(editor, group);
  UiControls.setValue(element, newValue, 'input');
};

export const TestLinkUi = {
  assertInputValue,
  pAssertContentPresence,
  pOpenLinkDialog,
  pFindInDialog,
  pFindTargetByLabelInDialog,
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
