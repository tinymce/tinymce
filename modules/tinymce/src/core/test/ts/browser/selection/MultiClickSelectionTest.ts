import { Logger, Pipeline, Step, GeneralSteps } from '@ephox/agar';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.selection.MultiClickSelectionTest', (success, failure) => {
    Theme();

    const sFakeMultiClick = (editor: Editor, clickCount) => {
      return Step.sync(() => {
        editor.fire('click', { detail: clickCount });
      });
    };

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);

      const testXClicksNormalisation = (clickCount) => GeneralSteps.sequence([
        Logger.t('Normalize selection from index text node to text node offsets with ' + clickCount + ' clicks', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>abc</p>'),
          tinyApis.sSetSelection([0], 0, [0], 1),
          sFakeMultiClick(editor, clickCount),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 3)
        ])),
        Logger.t('Normalize selection start in text node end after paragraph with ' + clickCount + ' clicks', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>abc</p>'),
          tinyApis.sSetSelection([0, 0], 0, [], 1),
          sFakeMultiClick(editor, clickCount),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 3)
        ]))
      ]);

      Pipeline.async({}, [
        tinyApis.sFocus,
        testXClicksNormalisation(3),
        testXClicksNormalisation(4),
        testXClicksNormalisation(5),
        testXClicksNormalisation(6),
        testXClicksNormalisation(7),
        testXClicksNormalisation(8),
        testXClicksNormalisation(9),
        testXClicksNormalisation(10)
      ], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      base_url: '/project/tinymce/js/tinymce'
    }, function () {
      success();
    }, failure);
  }
);
