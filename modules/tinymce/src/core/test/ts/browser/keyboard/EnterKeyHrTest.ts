import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyHrTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,

      Logger.t('Enter before HR in the beginning of content', GeneralSteps.sequence([
        tinyApis.sSetContent('<hr /><p>a</p>'),
        tinyApis.sSetCursor([], 0),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<p>&nbsp;</p><hr /><p>a</p>'),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ])),

      Logger.t('Enter after HR in the beginning of content', GeneralSteps.sequence([
        tinyApis.sSetContent('<hr /><p>a</p>'),
        tinyApis.sSetCursor([], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<hr /><p>&nbsp;</p><p>a</p>'),
        tinyApis.sAssertSelection([2, 0], 0, [2, 0], 0)
      ])),

      Logger.t('Enter before HR in the middle of content', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><hr /><p>b</p>'),
        tinyApis.sSetCursor([], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<p>a</p><p>&nbsp;</p><hr /><p>b</p>'),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),

      Logger.t('Enter after HR in the middle of content', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><hr /><p>b</p>'),
        tinyApis.sSetCursor([], 2),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<p>a</p><hr /><p>&nbsp;</p><p>b</p>'),
        tinyApis.sAssertSelection([3, 0], 0, [3, 0], 0)
      ])),

      Logger.t('Enter before HR in the end of content', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a</p><hr />'),
        tinyApis.sSetCursor([], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<p>a</p><p>&nbsp;</p><hr />'),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),

      Logger.t('Enter after HR in the end of content', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a</p><hr />'),
        tinyApis.sSetCursor([], 2),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContent('<p>a</p><hr /><p>&nbsp;</p>'),
        tinyApis.sAssertSelection([2], 0, [2], 0)
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: '',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
