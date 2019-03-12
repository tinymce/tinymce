import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import VK from 'tinymce/core/api/util/VK';

UnitTest.asynctest('browser.tinymce.core.keyboard.HomeEndKeysTest', (success, failure) => {
    Theme();

    TinyLoader.setup((editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Home key', GeneralSteps.sequence([
          Logger.t('Home key should caret before cef within the same block', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p><p><span contenteditable="false">CEF</span>456</p>'),
            tinyApis.sSetCursor([1, 1], 3),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
          ])),
          Logger.t('Home key should not caret before cef within the same block if there is a BR in between', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p><p><span contenteditable="false">CEF</span><br>456</p>'),
            tinyApis.sSetCursor([1, 2], 3),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([1, 2], 3, [1, 2], 3)
          ]))
        ])),
        Logger.t('End key', GeneralSteps.sequence([
          Logger.t('End key should caret after cef within the same block', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123<span contenteditable="false">CEF</span></p><p>456</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 2], 1, [0, 2], 1)
          ])),
          Logger.t('End key should not caret after cef within the same block if there is a BR in between', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123<br><span contenteditable="false">CEF</span></p><p>456</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      base_url: '/project/js/tinymce',
      indent: false
    }, success, failure);
  }
);
