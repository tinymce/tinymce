import { FocusTools, Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Obj, Type } from '@ephox/katamari';
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

const pOpenLinkDialog = async (editor: Editor) => {
  TinyUiActions.clickOnToolbar(editor, '[aria-label="Insert/edit link"]');
  await TinyUiActions.pWaitForDialog(editor);
};

const clickOnConfirmDialog = (editor: Editor, state: boolean) => {
  TinyUiActions.clickOnUi(editor, '[role="dialog"].tox-confirm-dialog button:contains("' + (state ? 'Yes' : 'No') + '")');
};

const fireEvent = (elem: SugarElement, event: string) => {
  let evt: Event;
  if (Type.isFunction(Event)) {
    evt = new Event(event, {
      bubbles: true,
      cancelable: true
    });
  } else { // support IE
    evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
  }
  elem.dom.dispatchEvent(evt);
};

const getInput = (selector: string) =>
  UiFinder.findIn(SugarBody.body(), selector).getOrDie();

const assertInputValue = (label: string, selector: string, expected: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    assert.equal(input.dom.checked, expected, `The input value for ${label} should be: ${expected}`);
  } else if (Class.has(input, 'tox-listbox')) {
    assert.equal(Attribute.get(input, 'data-value'), expected, `The input value for ${label} should be: ${expected}`);
  } else {
    assert.equal(Value.get(input), expected, `The input value for ${label} should be: ${expected}`);
  }
};

const assertDialogContents = (expected: Record<string, any>) => {
  Obj.mapToArray(selectors, (value, key) => {
    if (Obj.has(expected, key)) {
      assertInputValue(key, value, expected[key]);
    }
  });
};

const pInsertLink = async (editor: Editor, url: string) => {
  await pOpenLinkDialog(editor);
  FocusTools.setActiveValue(doc, url);
  await pClickSave(editor);
};

const pAssertContentPresence = (editor: Editor, presence: Record<string, number>) =>
  Waiter.pTryUntil('Waiting for content to have expected presence', () => TinyAssertions.assertContentPresence(editor, presence));

const pWaitForDialogClose = () => Waiter.pTryUntil(
  'Waiting for dialog to go away',
  () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]:not(.tox-confirm-dialog)')
);

const pWaitForConfirmClose = () => Waiter.pTryUntil(
  'Waiting for confirm dialog to go away',
  () => UiFinder.notExists(SugarBody.body(), '[role="dialog"].tox-confirm-dialog')
);

const pClickSave = async (editor: Editor) => {
  TinyUiActions.submitDialog(editor);
  await pWaitForDialogClose();
};

const pClickCancel = async (editor: Editor) => {
  TinyUiActions.cancelDialog(editor);
  await pWaitForDialogClose();
};

const pClickConfirmYes = async (editor: Editor) => {
  clickOnConfirmDialog(editor, true);
  await pWaitForConfirmClose();
};

const pClickConfirmNo = async (editor: Editor) => {
  clickOnConfirmDialog(editor, false);
  await pWaitForConfirmClose();
};

const pFindInDialog = async (editor: Editor, selector: string) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return UiFinder.findIn(dialog, selector).getOrDie();
};

const clearHistory = () => {
  localStorage.removeItem('tinymce-url-history');
};

const pSetListBoxItem = async (editor: Editor, group: string, itemText: string) => {
  const element = await pFindInDialog(editor, 'label:contains("' + group + '") + .tox-listboxfield .tox-listbox');
  Mouse.click(element);
  const list = await UiFinder.pWaitForVisible('Wait for list to open', SugarBody.body(), '.tox-menu.tox-collection--list');
  const item = UiFinder.findIn(list, '.tox-collection__item-label:contains(' + itemText + ')').getOrDie();
  const parent = Traverse.parent(item).getOrDie('Failed to find parent');
  Mouse.click(parent);
};

const pSetInputFieldValue = async (editor: Editor, group: string, newValue: string) => {
  const element = await pFindInDialog(editor, 'label:contains("' + group + '") + input');
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
