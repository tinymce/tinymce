import { GeneralSteps, Logger, Pipeline, Keys, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import VK from 'tinymce/core/api/util/VK';

UnitTest.asynctest('browser.tinymce.core.delete.PageBreakDeleteTest',  (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,

      Log.stepsAsStep('TBA', 'Delete keys for page break element', [
        Logger.t('Should place the selection on the page break element on delete before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<!-- pagebreak -->b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
          tinyActions.sContentKeystroke(VK.DELETE, {}),
          tinyApis.sAssertSelection([0], 1, [0], 2)
        ])),

        Logger.t('Should place the selection on the page break element on delete before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p><!-- pagebreak --></p><p>b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
          tinyActions.sContentKeystroke(VK.DELETE, {}),
          tinyApis.sAssertSelection([1], 0, [1], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Backspace keys for page break element', [
        Logger.t('Should place the selection on the page break element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<!-- pagebreak -->b</p>'),
          tinyApis.sSetSelection([0, 2], 0, [0, 2], 0),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([0], 1, [0], 2)
        ])),

        Logger.t('Should place the selection on the page break element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p><!-- pagebreak --></p><p>b</p>'),
          tinyApis.sSetSelection([2, 0], 0, [2, 0], 0),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([1], 0, [1], 1)
        ]))
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'pagebreak',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
