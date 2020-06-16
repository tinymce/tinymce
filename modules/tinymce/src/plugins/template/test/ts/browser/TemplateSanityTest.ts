import { Chain, Log, Mouse, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.TemplateSanityTest', (success, failure) => {

  TemplatePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const docBody = Element.fromDom(document.body);
    const dialogSelector = 'div.tox-dialog';
    const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Template: Test basic template insertion', [
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<strong>c</strong>' }]),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<p><strong>c</strong></p>')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test basic content replacement', [
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<p>{$name} {$email}</p>' }]),
        tinyApis.sSetSetting('template_replace_values', { name: 'Tester', email: 'test@test.com' }),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<p>Tester test@test.com</p>')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test loading in snippet from other file', [
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: '<strong>b</strong>', url: '/project/tinymce/src/plugins/template/test/html/test_template.html' }]),
        Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
        UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
        Chain.asStep(docBody, [
          UiFinder.cFindIn(dialogSelector),
          UiFinder.cWaitForState('iframe is loaded', 'iframe', (elm) => {
            const iframeDoc = elm.dom().contentDocument || elm.dom().contentWindow.document;
            return iframeDoc.body.firstChild !== null;
          })
        ]),
        UiFinder.sExists(docBody, dialogSelector + ' p:contains("<strong>b</strong>")'),
        Mouse.sClickOn(docBody, 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('<p><em>this is external</em></p>')
      ]),

      Log.stepsAsStep('TBA', 'Template: Test command', [
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('template_replace_values', { name: 'Tester' }),
        tinyApis.sExecCommand('mceInsertTemplate', '<p>{$name}</p>'),
        tinyApis.sAssertContent('<p>Tester</p>')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'template',
    toolbar: 'template',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
