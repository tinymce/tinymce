import { Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.InvalidUrlTest', (success, failure) => {

  TemplatePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const docBody = Element.fromDom(document.body);
    const alertDialogSelector = 'div.tox-dialog.tox-alert-dialog';
    const dialogSelector = 'div.tox-dialog';
    const toolbarButtonSelector = 'button[aria-label="Insert template"]';

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Template: Test loading in snippet from file that does not exist', [
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('templates', [{ title: 'invalid', description: 'b', url: '/custom/404' }, { title: 'a', description: 'a', content: '<strong>c</strong>' }]),
        tinyUi.sClickOnToolbar('Click template button', toolbarButtonSelector),
        tinyUi.sWaitForPopup('Waited for dialog to be visible', dialogSelector),
        tinyUi.sWaitForPopup('Waited for alert dialog to be visible', alertDialogSelector),
        tinyUi.sClickOnUi('Click on OK button', 'button.tox-button:contains(OK)'),
        Waiter.sTryUntil('Alert dialog should close', UiFinder.sNotExists(docBody, alertDialogSelector)),
        tinyUi.sClickOnUi('Click on Save button (should be disabled)', 'button.tox-button:contains(Save)'),
        Waiter.sTryUntil('Dialog should not close', UiFinder.sExists(docBody, dialogSelector)),
        tinyUi.sClickOnUi('Click on Cancel button', 'button.tox-button:contains(Cancel)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('')
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
