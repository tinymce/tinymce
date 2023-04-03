import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { SugarBody, SugarElement, TextContent } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const dialogSelector = 'div.tox-dialog';
const toolbarButtonSelector = 'button[aria-label="Insert/edit code sample"]';

const setLanguage = (newLanguage: string): void => {
  const select = document.querySelector('div[role="dialog"] div[class="tox-listboxfield"] button') as HTMLButtonElement;
  select.setAttribute('data-value', newLanguage);
};

const setTextareaContent = (content: string): void => {
  const textarea = document.querySelector('div[role="dialog"] textarea') as HTMLTextAreaElement;
  textarea.value = content;
};

const assertCodeSampleDialog = (expectedLanguage: string, expectedContent: string): void => {
  const select = document.querySelector('div[role="dialog"] div[class="tox-listboxfield"] button') as HTMLButtonElement;
  assert.equal(select.getAttribute('data-value'), expectedLanguage, 'Asserting language dropdown is ' + expectedLanguage);
  const textarea = document.querySelector('div[role="dialog"] textarea') as HTMLTextAreaElement;
  assert.equal(textarea.value, expectedContent, 'Asserting textarea content is ' + expectedContent);
};

const pAssertEditorContentStructure = (editorBody: SugarElement<HTMLElement>, language: string) => Waiter.pTryUntil(
  'Assert content',
  () => Assertions.assertStructure(
    'Asserting editor structure',
    ApproxStructure.build((s, str, arr) => s.element('body', {
      children: [
        s.element('pre', {
          classes: [
            arr.has('language-' + language)
          ],
          attrs: {
            contenteditable: str.is('false')
          }
        }),
        s.anything()
      ]
    })),
    editorBody
  )
);

const assertPreText = (container: SugarElement<Node>, selector: string, expected: string) => {
  const snippet = UiFinder.findIn(container, selector).getOrDie();
  const text = TextContent.get(snippet);
  assert.equal(text, expected, 'Assert ' + selector + ' has innerText ' + expected);
};

const pOpenDialogAndAssertInitial = async (editor: Editor, language: string, content: string): Promise<void> => {
  TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
  await UiFinder.pWaitForVisible('Waited for dialog to be visible', SugarBody.body(), dialogSelector);
  assertCodeSampleDialog(language, content);
};

const pSubmitDialog = async (editor: Editor): Promise<void> => {
  TinyUiActions.submitDialog(editor, dialogSelector);
  await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
};

const pCancelDialog = async (editor: Editor): Promise<void> => {
  TinyUiActions.cancelDialog(editor, dialogSelector);
  await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
};

const pAssertEditorContents = async (editorBody: SugarElement<HTMLElement>, language: string, content: string, selector: string): Promise<void> => {
  /*
   * Since the syntax highlighting wraps tokens in spans which would be annoying to assert, we assert
   * the overall structure of the editor's content, then exact match the textContent of the pre tag
   * to ensure it matches the content we set originally.
   */
  await pAssertEditorContentStructure(editorBody, language);
  assertPreText(editorBody, selector, content);
};

export {
  setLanguage,
  setTextareaContent,
  assertCodeSampleDialog,
  pOpenDialogAndAssertInitial,
  pSubmitDialog,
  pCancelDialog,
  pAssertEditorContents
};
