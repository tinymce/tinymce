import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('Browser Test: .RemoveTrailingBlockquoteTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  ListsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Logger.t('backspace from p inside div into li', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li></ul><div><p><br /></p></div>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ])),
      Logger.t('backspace from p inside blockquote into li', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><br /></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ])),
      Logger.t('backspace from b inside p inside blockquote into li', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><b><br /></b></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ])),
      Logger.t('backspace from span inside p inside blockquote into li', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><span class="x"><br /></span></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ])),
      Logger.t('backspace from p into li', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<ul><li>a</li></ul><p><br /></p>'),
        tinyApis.sSetCursor([1, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: '',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
