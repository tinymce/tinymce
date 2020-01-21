// import { Chain, Log, Mouse, Pipeline, UiFinder, Waiter, Step } from '@ephox/agar';
import { Log, Mouse, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.InvalidUrlTest', (success, failure) => {

  TemplatePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const docBody = Element.fromDom(document.body);
    const alertDialogSelector = 'div.tox-dialog.tox-alert-dialog';
    const dialogSelector = 'div.tox-dialog';
    const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';

    Pipeline.async({}, [
        Log.stepsAsStep('TBA', 'Template: Test loading in snippet from file that does not exist', [
            tinyApis.sSetContent(''),
            tinyApis.sSetSetting('templates', [{ title: 'invalid', description: 'b', url: '/custom/404' }, { title: 'a', description: 'a', content: '<strong>c</strong>' }]),
            Mouse.sClickOn(Element.fromDom(editor.getContainer()), toolbarButtonSelector),
            UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
            UiFinder.sWaitForVisible('Waited for alert dialog to be visible', docBody, alertDialogSelector),
            Mouse.sClickOn(docBody, 'button.tox-button:contains(OK)'),
            Waiter.sTryUntil('Alert dialog should close', UiFinder.sNotExists(docBody, alertDialogSelector)),
            Mouse.sClickOn(docBody, 'button.tox-button:contains(Cancel)'),
            Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
            tinyApis.sAssertContent(''),
          ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'template',
    toolbar: 'template',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
