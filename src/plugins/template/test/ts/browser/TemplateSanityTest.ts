import { Chain, GeneralSteps, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.TemplateSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TemplatePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('test basic template insertion', GeneralSteps.sequence([
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<strong>c</strong>' }]),
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContent('<p><strong>c</strong></p>')
      ])),

      Logger.t('test basic content replacement', GeneralSteps.sequence([
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<p>{$name} {$email}</p>' }]),
        tinyApis.sSetSetting('template_replace_values', { name: 'Tester', email: 'test@test.com' }),
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContent('<p>Tester test@test.com</p>')
      ])),

      Logger.t('test loading in snippet from other file', GeneralSteps.sequence([
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', url: '/project/src/plugins/template/test/html/test_template.html' }]),
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
          UiFinder.cWaitForState('iframe is loaded', 'iframe', function (elm) {
            const iframeDoc = elm.dom().contentDocument || elm.dom().contentWindow.document;
            return iframeDoc.body.firstChild !== null;
          })
        ]),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContent('<p><em>this is external</em></p>')
      ])),

      Logger.t('test command', GeneralSteps.sequence([
        tinyApis.sSetContent(''),
        tinyApis.sSetSetting('template_replace_values', { name: 'Tester' }),
        tinyApis.sExecCommand('mceInsertTemplate', '<p>{$name}</p>'),
        tinyApis.sAssertContent('<p>Tester</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'template',
    toolbar: 'template',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
