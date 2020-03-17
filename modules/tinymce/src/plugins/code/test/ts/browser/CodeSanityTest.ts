import { FocusTools, GeneralSteps, Log, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.code.CodeSanityTest', (success, failure) => {

  CodePlugin();
  SilverTheme();

  const dialogSelector = 'div.tox-dialog';
  const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Source code"]';

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const docBody = Element.fromDom(document.body);

    const sSetTextareaContent = (content) => Logger.t('Changing textarea content to ' + content, Step.sync(() => {
      const textarea: any = document.querySelector('div[role="dialog"] textarea');
      textarea.value = content;
    }));

    const sAssertTextareaContent = (expected) => Logger.t('Asserting textarea content is ' + expected, Step.sync(() => {
      const textarea: any = document.querySelector('div[role="dialog"] textarea');
      Assert.eq('Should have correct value', expected, textarea.value);
    }));

    const sSubmitDialog = (docBody) => GeneralSteps.sequence(Logger.ts('Clicking on the Save button to close dialog', [
      FocusTools.sSetFocus('Focus dialog', docBody, dialogSelector),
      Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
      Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector))
    ]));

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Code: Set content in empty editor and assert values', [
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        sAssertTextareaContent(''),
        sSetTextareaContent('<em>a</em>'),
        sSubmitDialog(docBody),
        tinyApis.sAssertContent('<p><em>a</em></p>'),
      ]),

      Log.stepsAsStep('TBA', 'Code: Reopen dialog and check textarea content is correct', [
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        sAssertTextareaContent('<p><em>a</em></p>')
      ]),

      Log.stepsAsStep('TBA', 'Code: Change source code and assert editor content changes', [
        sSetTextareaContent('<strong>b</strong>'),
        sSubmitDialog(docBody),
        tinyApis.sAssertContent('<p><strong>b</strong></p>'),
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'code',
    theme: 'silver',
    toolbar: 'code',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
