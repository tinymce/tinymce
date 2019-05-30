import { Logger, Step, Assertions, Waiter, ApproxStructure, UiFinder, Chain, Mouse, FocusTools, GeneralSteps } from '@ephox/agar';
import { Element, TextContent } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

const dialogSelector = 'div.tox-dialog';
const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert/edit code sample"]';

const sSetLanguage = (newLanguage) => {
  return Logger.t('Changing language to ' + newLanguage, Step.sync(() => {
    const select: any = document.querySelector('div[role="dialog"] select');
    select.value = newLanguage;
  }));
};

const sSetTextareaContent = (content) => {
  return Logger.t('Changing textarea content to ' + content, Step.sync(() => {
    const textarea: any = document.querySelector('div[role="dialog"] textarea');
    textarea.value = content;
  }));
};

const sAssertCodeSampleDialog = (expectedLanguage, expectedContent) => {
  return Logger.t('Assert dialog language and content', Step.sync(() => {
    const select: any = document.querySelector('div[role="dialog"] select');
    Assertions.assertEq('Asseting language dropdown is ' + expectedLanguage, select.value, expectedLanguage);
    const textarea: any = document.querySelector('div[role="dialog"] textarea');
    Assertions.assertEq('Asserting textarea content is ' + expectedContent, textarea.value, expectedContent);
  }));
};

const sAssertEditorContentStructure = (editorBody, language, content) => {
  return Logger.t('Assert editor contents structure', Waiter.sTryUntil(
    'Assert content',
    Assertions.sAssertStructure(
      'Asserting editor structure',
      ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
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
      });
    }),
    Element.fromDom(editorBody)
  ), 100, 3000));
};

const sAssertPreText = (container: Element, selector, expected) => {
  return Logger.t('Assert PRE content', Chain.asStep(container, [
    UiFinder.cFindIn(selector),
    Chain.op((snippet) => {
      const text = TextContent.get(snippet);
      return Assertions.assertEq('Assert ' + selector + ' has innerText ' + expected, expected, text);
    })
  ]));
};

const sOpenDialogAndAssertInitial = (editor, docBody, language, content) => {
  return GeneralSteps.sequence(Logger.ts('Open dialog and assert initial language and content', [
    Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
    UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
    sAssertCodeSampleDialog(language, content)
  ]));
};

const sSubmitDialog = (docBody) => {
  return GeneralSteps.sequence(Logger.ts('Focus on the dialog and click on the Save button to close the dialog', [
    FocusTools.sSetFocus('Focus dialog', docBody, dialogSelector),
    Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
    Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000)
  ]));
};

const sCancelDialog = (docBody) => {
  return GeneralSteps.sequence(Logger.ts('Click on the Cancel button to close the dialog', [
    Mouse.sClickOn(docBody, 'button:contains(Cancel)'),
    Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000)
  ]));
};

const sAssertEditorContents = (editorBody, language, content, selector) => {
  /*
   * Since the syntax highlighting wraps tokens in spans which would be annoying to assert, we assert
   * the overall structure of the editor's content, then exact match the textContent of the pre tag
   * to ensure it matches the content we set originally.
   */
  return GeneralSteps.sequence(Logger.ts('Assert overall structure of editor content', [
    sAssertEditorContentStructure(editorBody, language, content),
    sAssertPreText(Element.fromDom(editorBody), selector, content),
  ]));
};

export {
  sSetLanguage,
  sSetTextareaContent,
  sAssertCodeSampleDialog,
  sOpenDialogAndAssertInitial,
  sSubmitDialog,
  sCancelDialog,
  sAssertEditorContents
};