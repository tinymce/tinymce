import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.ApplyListOnParagraphWithStylesTest', (success, failure) => {

  Theme();
  ListsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Lists: remove margin from p when applying list on it, but leave other styles', [
        tinyApis.sSetContent('<p style="color: blue;margin: 30px;margin-right: 30px;margin-bottom: 30px;margin-left: 30px;margin-top: 30px;">test</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li style="color: blue;">test</li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: remove padding from p when applying list on it, but leave other styles', [
        tinyApis.sSetContent('<p style="color: red;padding: 30px;padding-right: 30px;padding-bottom: 30px;padding-left: 30px;padding-top: 30px;">test</p>'),
        tinyApis.sSetCursor([0, 0], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li style="color: red;">test</li></ul>')
      ])
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
