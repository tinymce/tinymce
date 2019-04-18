import { GeneralSteps, Logger, Pipeline, Keys, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import VK from 'tinymce/core/api/util/VK';

UnitTest.asynctest('browser.tinymce.core.delete.ImageBlockDeleteTest',  (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,

      Log.stepsAsStep('TBA', 'Delete keys for image block element', [
        Logger.t('Should place the selection on the image block element on delete before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank" class="block">b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
          tinyActions.sContentKeystroke(VK.DELETE, {}),
          tinyApis.sAssertSelection([0], 1, [0], 2)
        ])),

        Logger.t('Should place the selection on the image block element on delete before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p><img src="about:blank" class="block"></p><p>b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
          tinyActions.sContentKeystroke(VK.DELETE, {}),
          tinyApis.sAssertSelection([1], 0, [1], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Backspace keys for image block element', [
        Logger.t('Should place the selection on the image block element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank" class="block">b</p>'),
          tinyApis.sSetSelection([0, 2], 0, [0, 2], 0),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([0], 1, [0], 2)
        ])),

        Logger.t('Should place the selection on the image block element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p><img src="about:blank" class="block"></p><p>b</p>'),
          tinyApis.sSetSelection([2, 0], 0, [2, 0], 0),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([1], 0, [1], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Backspace/delete before on non block images should not select the image', [
        Logger.t('Should place the selection on the image block element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank">b</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 1),
          tinyActions.sContentKeystroke(VK.DELETE, {}),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),

        Logger.t('Should place the selection on the image block element on backspace after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<img src="about:blank">b</p>'),
          tinyApis.sSetSelection([0, 2], 0, [0, 2], 0),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([0, 2], 0, [0, 2], 0)
        ]))
      ])
    ], onSuccess, onFailure);
  }, {
    content_style: 'img.block { display: block }',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
