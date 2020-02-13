import { Keys, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Browser Test: .RemoveTrailingBlockquoteTest', (success, failure) => {

  ListsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Lists: backspace from p inside div into li', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<ul><li>a</li></ul><div><p><br /></p></div>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: backspace from p inside blockquote into li', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><br /></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: backspace from b inside p inside blockquote into li', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><b><br /></b></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: backspace from span inside p inside blockquote into li', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<ul><li>a</li></ul><blockquote><p><span class="x"><br /></span></p></blockquote>'),
        tinyApis.sSetCursor([1, 0, 0, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: backspace from p into li', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<ul><li>a</li></ul><p><br /></p>'),
        tinyApis.sSetCursor([1, 0], 0),
        tinyActions.sContentKeystroke(Keys.backspace(), { }),
        tinyApis.sAssertContent('<ul><li>a</li></ul>')
      ])
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: '',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
