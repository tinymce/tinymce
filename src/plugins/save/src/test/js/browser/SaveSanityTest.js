import { Keys } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import SavePlugin from 'tinymce/plugins/save/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.save.SaveSanityTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  SavePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyUi = TinyUi(editor);
    var tinyApis = TinyApis(editor);
    var tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyUi.sWaitForUi('check button', 'div[aria-disabled="true"] i.mce-i-save'),
      tinyApis.sSetContent('<p>a</p>'),
      tinyApis.sSetCursor([0, 0], 1),
      tinyActions.sContentKeystroke(Keys.enter(), {}),
      tinyUi.sWaitForUi('check button', 'div[aria-disabled="false"] i.mce-i-save')
    ], onSuccess, onFailure);
  }, {
    plugins: 'save',
    toolbar: 'save',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

