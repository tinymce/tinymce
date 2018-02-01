import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.ApplyListOnParagraphWithStylesTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  ListsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('remove margin from p when applying list on it, but leave other styles', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="color: blue;margin: 30px;margin-right: 30px;margin-bottom: 30px;margin-left: 30px;margin-top: 30px;">test</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'div[aria-label="Bullet list"] button'),
        tinyApis.sAssertContent('<ul><li style="color: blue;">test</li></ul>')
      ])),
      Logger.t('remove padding from p when applying list on it, but leave other styles', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="color: red;padding: 30px;padding-right: 30px;padding-bottom: 30px;padding-left: 30px;padding-top: 30px;">test</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'div[aria-label="Bullet list"] button'),
        tinyApis.sAssertContent('<ul><li style="color: red;">test</li></ul>')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
