import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('tinymce.lists.browser.ToggleListWithEmptyLiTest', (success, failure) => {
  ModernTheme();
  ListsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('toggle bullet list on list with two empty LIs', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li><li>&nbsp;</li><li>&nbsp;</li><li>b</li></ul>'),
        tinyApis.sSetSelection([0, 0, 0], 0, [0, 3, 0], 1),
        tinyUi.sClickOnToolbar('click list', 'div[aria-label="Bullet list"] > button'),
        tinyApis.sAssertContent('<p>a</p><p>&nbsp;</p><p>&nbsp;</p><p>b</p>')
      ])),
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: '',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
