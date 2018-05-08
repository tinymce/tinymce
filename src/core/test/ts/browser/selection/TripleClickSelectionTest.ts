import { Logger, Pipeline, Step, GeneralSteps } from '@ephox/agar';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.selection.TripleClickSelectionTest', (success, failure) => {
    ModernTheme();

    const sFakeTripleClick = (editor: Editor) => {
      return Step.sync(() => {
        editor.fire('click', { detail: 3 });
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Normalize selection from index text node to text node offsets', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>abc</p>'),
          tinyApis.sSetSelection([0], 0, [0], 1),
          sFakeTripleClick(editor),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 3)
        ])),
        Logger.t('Normalize selection start in text node end after paragraph', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>abc</p>'),
          tinyApis.sSetSelection([0, 0], 0, [], 1),
          sFakeTripleClick(editor),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 3)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, function () {
      success();
    }, failure);
  }
);
