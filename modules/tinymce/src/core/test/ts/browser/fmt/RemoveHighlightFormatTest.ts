import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import SilverTheme from 'tinymce/themes/silver/Theme';

interface Editor {
  formatter: {
    remove: (target: string, any: any) => void;
  };
}
UnitTest.asynctest('browser.tinymce.core.fmt.RemoveHighlightFormatTest', (success, failure) => {
  SilverTheme();

  const sRemoveHighlight = function (editor: Editor) {
    return Step.sync(function () {
      const options = {
        value: '#e03e2d',
      };

      editor.formatter.remove('hilitecolor', options);
    });
  };

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor as any);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('We remove a block', GeneralSteps.sequence([
        Logger.t('Which starts in the color, but ends outside of it', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4'),
          tinyApis.sSetSelection([0, 1, 0], 6, [0, 2], 4),
          sRemoveHighlight(editor),
          tinyApis.sAssertContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2</span> Part 3 Part 4</p>'),
          tinyApis.sAssertSelection([0, 2], 0, [0, 3], 4)
        ])),
        Logger.t('Which starts in the color, but ends outside of it', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4'),
          tinyApis.sSetSelection([0, 0], 3, [0, 1, 0], 4),
          sRemoveHighlight(editor),
          tinyApis.sAssertContent('<p>Part 1 Part<span style="background-color: #e03e2d;"> 2 Part 3</span> Part 4</p>'),
          tinyApis.sAssertSelection([0, 0], 3, [0, 2], 0)
        ])),
        Logger.t('Which starts and ends in the color', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4'),
          tinyApis.sSetSelection([0, 1, 0], 6, [0, 1, 0], 7),
          sRemoveHighlight(editor),
          tinyApis.sAssertContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2</span> <span style="background-color: #e03e2d;">Part 3</span> Part 4</p>'),
          tinyApis.sAssertSelection([0, 3, 0], 0, [0, 3, 0], 0)
        ])),
        Logger.t('Which starts and ends outside the color', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4'),
          tinyApis.sSetSelection([0, 0], 2, [0, 2], 4),
          sRemoveHighlight(editor),
          tinyApis.sAssertContent('<p>Part 1 Part 2 Part 3 Part 4</p>'),
          tinyApis.sAssertSelection([0, 0], 2, [0, 2], 4)
        ])),
      ])),
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: '',
    toolbar: '',
  }, success, failure);
});
