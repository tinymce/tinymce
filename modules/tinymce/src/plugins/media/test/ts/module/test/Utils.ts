import { Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Type } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const selectors = {
  source: 'label:contains(Source) + div.tox-form__controls-h-stack input.tox-textfield',
  width: '.tox-form__controls-h-stack label:contains(Width) + input.tox-textfield',
  height: '.tox-form__controls-h-stack label:contains(Height) + input.tox-textfield',
  embed: 'label:contains(Paste your embed code below:) + textarea.tox-textarea',
  lockIcon: 'button.tox-lock',
  embedButton: 'div.tox-tab:contains(Embed)',
  poster: 'label:contains(Media poster (Image URL)) + div.tox-form__controls-h-stack input.tox-textfield'
};

const pOpenDialog = async (editor: Editor) => {
  TinyUiActions.clickOnToolbar(editor, 'div.tox-toolbar__group > button');
  return await TinyUiActions.pWaitForDialog(editor);
};

const findInDialog = (dialog: SugarElement<HTMLElement>, selector: string) =>
  UiFinder.findIn(dialog, selector).getOrDie();

const pFindInDialog = (selector: string) => async (editor: Editor) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return findInDialog(dialog, selector);
};

const getValueOn = (dialog: SugarElement<HTMLElement>, selector: string) => {
  const elem = findInDialog(dialog, selector);
  return UiControls.getValue(elem);
};

const setValueOn = (dialog: SugarElement<HTMLElement>, selector: string, newValue: string) => {
  const elem = findInDialog(dialog, selector);
  UiControls.setValue(elem, newValue);
};

const pAssertFieldValue = (selector: string) => async (editor: Editor, expected: string) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntil(`Wait for new ${selector} value`,
    () => {
      const value = getValueOn(dialog, selector);
      assert.equal(value, expected, `Assert ${expected} value`);
    }, 20, 3000
  );
};

const pAssertWidthValue = pAssertFieldValue(selectors.width);
const pAssertHeightValue = pAssertFieldValue(selectors.height);
const pAssertSourceValue = pAssertFieldValue(selectors.source);

const pSetValueAndTrigger = (selector: string, value: string, events: string[]) => async (editor: Editor) => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  const elem = findInDialog(dialog, selector);                  // get the element
  Focus.focus(elem);                                            // fire focusin, required by sizeinput to recalc ratios
  setValueOn(dialog, selector, value);                          // change the value
  Arr.map(events, (event) => fakeEvent(elem, event)); // fire [change, input etc],
  await Waiter.pWait(0);                                  // Wait needed as paste event is triggered async
};

const pPasteSourceValue = (editor: Editor, value: string) =>
  pSetValueAndTrigger(selectors.source, value, [ 'paste' ])(editor);

const pPastePosterValue = (editor: Editor, value: string) =>
  pSetValueAndTrigger(selectors.poster, value, [ 'paste' ])(editor);

const pChangeWidthValue = (editor: Editor, value: string) =>
  pSetValueAndTrigger(selectors.width, value, [ 'input', 'change' ])(editor);

const pChangeHeightValue = (editor: Editor, value: string) =>
  pSetValueAndTrigger(selectors.height, value, [ 'input', 'change' ])(editor);

const pAssertSizeRecalcConstrained = async (editor: Editor) => {
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, 'http://test.se');
  await pAssertHeightAndWidth(editor, '150', '300');
  await pChangeWidthValue(editor, '350');
  await pAssertHeightAndWidth(editor, '175', '350');
  await pChangeHeightValue(editor, '100');
  await pAssertHeightAndWidth(editor, '100', '200');
  TinyUiActions.closeDialog(editor);
};

const pAssertSizeRecalcConstrainedReopen = async (editor: Editor) => {
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, 'http://test.se');
  await pAssertHeightAndWidth(editor, '150', '300');
  await pChangeWidthValue(editor, '350');
  await pAssertHeightAndWidth(editor, '175', '350');
  await pChangeHeightValue(editor, '100');
  await pAssertHeightAndWidth(editor, '100', '200');
  await pSubmitAndReopen(editor);
  await pAssertHeightAndWidth(editor, '100', '200');
  await pChangeWidthValue(editor, '350');
  await pAssertHeightAndWidth(editor, '175', '350');
  TinyUiActions.closeDialog(editor);
};

const pAssertSizeRecalcUnconstrained = async (editor: Editor) => {
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, 'http://test.se');
  TinyUiActions.clickOnUi(editor, selectors.lockIcon);
  await pAssertHeightAndWidth(editor, '150', '300');
  await pChangeWidthValue(editor, '350');
  await pAssertHeightAndWidth(editor, '150', '350');
  await pChangeHeightValue(editor, '100');
  await pAssertHeightAndWidth(editor, '100', '350');
  TinyUiActions.closeDialog(editor);
};

const fakeEvent = (elem: SugarElement<HTMLElement>, name: string) => {
  const element: HTMLElement = elem.dom;
  // NOTE we can't fake a paste event here.
  let event: Event;
  if (Type.isFunction(Event)) {
    event = new Event(name, {
      bubbles: true,
      cancelable: true
    });
  } else { // support IE
    event = document.createEvent('Event');
    event.initEvent(name, true, true);
  }
  element.dispatchEvent(event);
};

const pFindFilepickerInput = pFindInDialog(selectors.source);
const pFindTextarea = pFindInDialog(selectors.embed);

const pSetSourceInput = async (editor: Editor, value: string) => {
  const input = await pFindFilepickerInput(editor);
  UiControls.setValue(input, value);
  return input;
};

const pPasteTextareaValue = async (editor: Editor, value: string) => {
  const button = await pFindInDialog(selectors.embedButton)(editor);
  Mouse.click(button);
  const embed = await pFindInDialog(selectors.embed)(editor);
  UiControls.setValue(embed, value);
  fakeEvent(embed, 'paste');
  // Need to wait for the post paste event to fire
  await Waiter.pWait(50);
};

const pAssertEmbedData = async (editor: Editor, content: string) => {
  TinyUiActions.clickOnUi(editor, selectors.embedButton);
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntil('Textarea should have a proper value',
    () => {
      const elem = findInDialog(dialog, selectors.embed);
      const value = UiControls.getValue(elem);
      assert.equal(value, content, 'embed content');
    }
  );
  TinyUiActions.clickOnUi(editor, '.tox-tab:contains("General")');
};

const pTestEmbedContentFromUrl = async (editor: Editor, url: string, content: string) => {
  editor.setContent('');
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, url);
  await pAssertEmbedData(editor, content);
  TinyUiActions.closeDialog(editor);
};

const pSetFormItemNoEvent = pSetSourceInput;

const pAssertEditorContent = (editor: Editor, expected: string) =>
  Waiter.pTryUntil('Wait for editor value',
    () => TinyAssertions.assertContent(editor, expected)
  );

const pSubmitAndReopen = async (editor: Editor) => {
  TinyUiActions.submitDialog(editor);
  await pOpenDialog(editor);
};

const pSetHeightAndWidth = async (editor: Editor, height: string, width: string) => {
  await pChangeWidthValue(editor, width);
  await pChangeHeightValue(editor, height);
};

const pAssertHeightAndWidth = async (editor: Editor, height: string, width: string) => {
  await pAssertWidthValue(editor, width);
  await pAssertHeightValue(editor, height);
};

export {
  pSetSourceInput,
  pFindTextarea,
  fakeEvent,
  pFindInDialog,
  pOpenDialog,
  pTestEmbedContentFromUrl,
  pSetFormItemNoEvent,
  pAssertEditorContent,
  pSubmitAndReopen,
  pAssertWidthValue,
  pAssertHeightValue,
  pPasteSourceValue,
  pPastePosterValue,
  pAssertSizeRecalcConstrained,
  pAssertSizeRecalcConstrainedReopen,
  pAssertSizeRecalcUnconstrained,
  pAssertEmbedData,
  pAssertSourceValue,
  pChangeWidthValue,
  pChangeHeightValue,
  pPasteTextareaValue,
  pSetHeightAndWidth,
  pAssertHeightAndWidth,
  selectors
};
