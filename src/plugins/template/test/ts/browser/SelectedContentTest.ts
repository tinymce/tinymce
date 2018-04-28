import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.template.SelectedContentTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TemplatePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('test selectedcontent replacement with default class', GeneralSteps.sequence([
        tinyApis.sSetContent('Text'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<h1 class="selcontent">This will be replaced</h1>' }]),
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContent('<h1 class="selcontent">Text</h1>')
      ])),

      Logger.t('test selectedcontent replacement with custom class', GeneralSteps.sequence([
        tinyApis.sSetContent('Text'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        tinyApis.sSetSetting('template_selected_content_classes', 'customSelected'),
        tinyApis.sSetSetting('templates', [{ title: 'a', description: 'b', content: '<h1 class="customSelected">This will be replaced/h1>' }]),
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContent('<h1 class="customSelected">Text</h1>')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'template',
    toolbar: 'template',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
