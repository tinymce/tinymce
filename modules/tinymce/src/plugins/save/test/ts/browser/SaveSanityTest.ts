import { Keys, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SavePlugin from 'tinymce/plugins/save/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.save.SaveSanityTest', (success, failure) => {

  SavePlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Save: Assert Save button is disabled when editor is opened. Add content and assert Save button is enabled', [
        tinyUi.sWaitForUi('check button', 'button.tox-tbtn--disabled[aria-label="Save"]'),
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyUi.sWaitForUi('check button', 'button[aria-label="Save"]:not(.tox-tbtn--disabled)')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'save',
    toolbar: 'save',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver'
  }, success, failure);
});
