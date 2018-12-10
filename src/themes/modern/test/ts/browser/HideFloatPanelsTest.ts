import { Pipeline, UiFinder, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import TextcolorPlugin from 'tinymce/plugins/textcolor/Plugin';

import Theme from 'tinymce/themes/modern/Theme';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.themes.modern.test.HideFloatPanelsTest', (success, failure) => {
  Theme();
  TextcolorPlugin();

  const sSetProgressState = (editor: Editor, state) => Step.sync(() => {
    editor.setProgressState(state);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Close float panels when setProgressState is called', [
        tinyUi.sClickOnToolbar('click forecolor', 'div[aria-label="Text color"] > button.mce-open'),
        UiFinder.sWaitFor('Float panel for color button should be open', Body.body(), '.mce-floatpanel'),
        sSetProgressState(editor, true),
        UiFinder.sWaitForHidden('', Body.body(), '.mce-floatpanel')
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'modern',
    skin_url: '/project/js/tinymce/skins/lightgray',
    plugins: 'textcolor',
    toolbar: 'forecolor'
  }, success, failure);
});
