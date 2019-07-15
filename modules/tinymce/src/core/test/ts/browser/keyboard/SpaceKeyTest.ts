import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.SpaceKeyTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Logger.t('Space key around inline boundary elements', GeneralSteps.sequence([
        Logger.t('Press space at beginning of inline boundary inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a <a href="#">&nbsp;b</a> c</p>')
        ])),
        Logger.t('Press space at end of inline boundary inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 1),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
          tinyApis.sAssertContent('<p>a <a href="#">b&nbsp;</a> c</p>')
        ])),
        Logger.t('Press space at beginning of inline boundary inserting space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a<a href="#"> b</a>c</p>')
        ])),
        Logger.t('Press space at end of inline boundary inserting space', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 1),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
          tinyApis.sAssertContent('<p>a<a href="#">b </a>c</p>')
        ])),
        Logger.t('Press space at start of inline boundary with leading space inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#"> b</a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 0),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          tinyApis.sAssertContent('<p>a<a href="#">&nbsp; b</a>c</p>')
        ])),
        Logger.t('Press space at end of inline boundary with trailing space inserting nbsp', GeneralSteps.sequence([
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a<a href="#">b </a>c</p>'),
          tinyApis.sSetCursor([0, 1, 0], 2),
          tinyApis.sNodeChanged,
          tinyActions.sContentKeystroke(Keys.space(), {}),
          tinyApis.sAssertSelection([0, 1, 0], 3, [0, 1, 0], 3),
          tinyApis.sAssertContent('<p>a<a href="#">b &nbsp;</a>c</p>')
        ]))
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
