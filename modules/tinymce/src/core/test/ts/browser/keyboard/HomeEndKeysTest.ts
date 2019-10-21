import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import VK from 'tinymce/core/api/util/VK';

UnitTest.asynctest('browser.tinymce.core.keyboard.HomeEndKeysTest', (success, failure) => {
    Theme();

    TinyLoader.setupLight((editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus(),
        Logger.t('Home key', GeneralSteps.sequence([
          Logger.t('Home key should move caret before cef within the same block', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p><p><span contenteditable="false">CEF</span>456</p>'),
            tinyApis.sSetCursor([1, 1], 3),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
          ])),
          Logger.t('Home key should move caret from after cef to before cef', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><span contenteditable="false">CEF</span></p>'),
            tinyApis.sSetCursor([0], 1),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
          ])),
          Logger.t('Home key should move caret to before cef from the start of range', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p><p><span contenteditable="false">CEF</span>456<br>789</p>'),
            tinyApis.sSetSelection([1, 1], 3, [1, 1], 3),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
          ])),
          Logger.t('Home key should not move caret before cef within the same block if there is a BR in between', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p><p><span contenteditable="false">CEF</span><br>456</p>'),
            tinyApis.sSetCursor([1, 2], 3),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([1, 2], 3, [1, 2], 3)
          ])),
          Logger.t('Home key should not move caret if there is no cef', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyActions.sContentKeystroke(VK.HOME, { }),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
          ]))
        ])),
        Logger.t('End key', GeneralSteps.sequence([
          Logger.t('End key should move caret after cef within the same block', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123<span contenteditable="false">CEF</span></p><p>456</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 2], 1, [0, 2], 1)
          ])),
          Logger.t('End key should move caret from before cef to after cef', GeneralSteps.sequence([
            tinyApis.sSetContent('<p><span contenteditable="false">CEF</span></p>'),
            tinyApis.sSetCursor([0], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1)
          ])),
          Logger.t('End key should move caret to after cef from the end of range', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123<br>456<span contenteditable="false">CEF</span></p>'),
            tinyApis.sSetSelection([0, 0], 0, [0, 2], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 4], 1, [0, 4], 1)
          ])),
          Logger.t('End key should not move caret after cef within the same block if there is a BR in between', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123<br><span contenteditable="false">CEF</span></p><p>456</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
          ])),
          Logger.t('End key should not move caret if there is no cef', GeneralSteps.sequence([
            tinyApis.sSetContent('<p>123</p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyActions.sContentKeystroke(VK.END, { }),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    }, success, failure);
  }
);
