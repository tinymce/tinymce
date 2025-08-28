import { Mouse, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const labels = {
  embed: 'Paste your embed code below:',
  source: 'Source',
  poster: 'Media poster (Image URL)',
  width: 'Width',
  height: 'Height'
};

const selectors = {
  lockIcon: 'button.tox-lock',
  embedButton: 'div.tox-tab:contains(Embed)',
  sourceLabel: `label:contains(${labels.source})`,
  widthLabel: `label:contains(${labels.width})`,
  heightLabel: `label:contains(${labels.height})`
};

const pOpenDialog = async (editor: Editor): Promise<SugarElement<Element>> => {
  TinyUiActions.clickOnToolbar(editor, 'div.tox-toolbar__group > button');
  return await TinyUiActions.pWaitForDialog(editor);
};

const findInDialog = <T extends HTMLElement>(dialog: SugarElement<Element>, selector: string): SugarElement<T> =>
  UiFinder.findIn<T>(dialog, selector).getOrDie();

const findTargetInDialogByLabel = <T extends HTMLElement>(dialog: SugarElement<Element>, labelText: string): SugarElement<T> =>
  UiFinder.findTargetByLabel<T>(dialog, labelText).getOrDie();

const pFindInDialog = <T extends HTMLElement>(selector: string) => async (editor: Editor): Promise<SugarElement<T>> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return findInDialog<T>(dialog, selector);
};

const pFindTargetInDialogByLabel = <T extends HTMLElement>(labelText: string) => async (editor: Editor): Promise<SugarElement<T>> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  return findTargetInDialogByLabel<T>(dialog, labelText);
};

const getValueOn = (dialog: SugarElement<Element>, labelText: string): string => {
  const elem = findTargetInDialogByLabel<HTMLInputElement>(dialog, labelText);
  return UiControls.getValue(elem);
};

const setValueOn = (dialog: SugarElement<Element>, labelText: string, newValue: string): void => {
  const elem = findTargetInDialogByLabel<HTMLInputElement>(dialog, labelText);
  UiControls.setValue(elem, newValue);
};

const pAssertFieldValue = (labelText: string) => async (editor: Editor, expected: string): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntil(`Wait for new ${labelText} value`,
    () => {
      const value = getValueOn(dialog, labelText);
      assert.equal(value, expected, `Assert ${expected} value`);
    }, 20, 3000
  );
};

const pAssertWidthValue = pAssertFieldValue(labels.width);
const pAssertHeightValue = pAssertFieldValue(labels.height);
const pAssertSourceValue = pAssertFieldValue(labels.source);

const pSetValueAndTrigger = (labelText: string, value: string, events: string[]) => async (editor: Editor): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  const elem = findTargetInDialogByLabel(dialog, labelText);                  // get the element
  Focus.focus(elem);                                            // fire focusin, required by sizeinput to recalc ratios
  setValueOn(dialog, labelText, value);                          // change the value
  Arr.map(events, (event) => fakeEvent(elem, event)); // fire [change, input etc],
  await Waiter.pWaitBetweenUserActions();
};

const pPasteSourceValue = (editor: Editor, value: string): Promise<void> =>
  pSetValueAndTrigger(labels.source, value, [ 'paste' ])(editor);

const pPastePosterValue = (editor: Editor, value: string): Promise<void> =>
  pSetValueAndTrigger(labels.poster, value, [ 'paste' ])(editor);

const pChangeWidthValue = (editor: Editor, value: string): Promise<void> =>
  pSetValueAndTrigger(labels.width, value, [ 'input', 'change' ])(editor);

const pChangeHeightValue = (editor: Editor, value: string): Promise<void> =>
  pSetValueAndTrigger(labels.height, value, [ 'input', 'change' ])(editor);

const pAssertSizeRecalcConstrained = async (editor: Editor): Promise<void> => {
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, 'http://test.se');
  await pAssertHeightAndWidth(editor, '150', '300');
  await pChangeWidthValue(editor, '350');
  await pAssertHeightAndWidth(editor, '175', '350');
  await pChangeHeightValue(editor, '100');
  await pAssertHeightAndWidth(editor, '100', '200');
  TinyUiActions.closeDialog(editor);
};

const pAssertSizeRecalcConstrainedReopen = async (editor: Editor): Promise<void> => {
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

const pAssertSizeRecalcUnconstrained = async (editor: Editor): Promise<void> => {
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

const fakeEvent = (elem: SugarElement<HTMLElement>, name: string): void => {
  const element: HTMLElement = elem.dom;
  // NOTE we can't fake a paste event here.
  const event = new Event(name, {
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
};

const pFindFilepickerInput = pFindTargetInDialogByLabel<HTMLInputElement>(labels.source);
const pFindTextarea = pFindTargetInDialogByLabel<HTMLTextAreaElement>(labels.embed);

const pSetSourceInput = async (editor: Editor, value: string): Promise<SugarElement<HTMLInputElement>> => {
  const input = await pFindFilepickerInput(editor);
  UiControls.setValue(input, value);
  return input;
};

const pPasteTextareaValue = async (editor: Editor, value: string): Promise<void> => {
  const button = await pFindInDialog(selectors.embedButton)(editor);
  Mouse.click(button);
  const embed = await pFindTextarea(editor);
  UiControls.setValue(embed, value);
  fakeEvent(embed, 'paste');
  // Need to wait for the post paste event to fire
  await Waiter.pWait(50);
};

const pAssertEmbedData = async (editor: Editor, content: string): Promise<void> => {
  TinyUiActions.clickOnUi(editor, selectors.embedButton);
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pTryUntil('Textarea should have a proper value',
    () => {
      const elem = findTargetInDialogByLabel<HTMLTextAreaElement>(dialog, labels.embed);
      const value = UiControls.getValue(elem);
      assert.equal(value, content, 'embed content');
    }
  );
  TinyUiActions.clickOnUi(editor, '.tox-tab:contains("General")');
};

const pTestEmbedContentFromUrl = async (editor: Editor, url: string, content: string): Promise<void> => {
  editor.setContent('');
  await pOpenDialog(editor);
  await pPasteSourceValue(editor, url);
  await pAssertEmbedData(editor, content);
  TinyUiActions.closeDialog(editor);
};

const pSetFormItemNoEvent = pSetSourceInput;

const pAssertEditorContent = (editor: Editor, expected: string): Promise<void> =>
  Waiter.pTryUntil(`Waiting for editor value: ${expected}`,
    () => TinyAssertions.assertContent(editor, expected)
  );

const pSubmitAndReopen = async (editor: Editor): Promise<void> => {
  TinyUiActions.submitDialog(editor);
  await pOpenDialog(editor);
};

const pSetHeightAndWidth = async (editor: Editor, height: string, width: string): Promise<void> => {
  await pChangeWidthValue(editor, width);
  await pChangeHeightValue(editor, height);
};

const pAssertHeightAndWidth = async (editor: Editor, height: string, width: string): Promise<void> => {
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
