import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysContentEndpointTest', (success, failure) => {
    Theme();

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Arrow keys in figcaption', GeneralSteps.sequence([
          Logger.t('Arrow up from start of figcaption to paragraph before figure', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyActions.sContentKeystroke(Keys.up(), { }),
            tinyApis.sAssertContent('<p>&nbsp;</p><figure><figcaption>a</figcaption></figure>'),
            tinyApis.sAssertSelection([0], 0, [0], 0)
          ])),
          Logger.t('Arrow down from end of figcaption to paragraph after figure', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            tinyApis.sAssertContent('<figure><figcaption>a</figcaption></figure><p>&nbsp;</p>'),
            tinyApis.sAssertSelection([1], 0, [1], 0)
          ])),
          Logger.t('Arrow up in middle of figcaption', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.up(), { }),
            tinyApis.sAssertContent('<p>&nbsp;</p><figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sAssertSelection([0], 0, [0], 0)
          ])),
          Logger.t('Arrow down in middle of figcaption', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            tinyApis.sAssertContent('<figure><figcaption>ab</figcaption></figure><p>&nbsp;</p>'),
            tinyApis.sAssertSelection([1], 0, [1], 0)
          ])),
          Logger.t('Arrow up at line 2 in figcaption should not insert new block', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a<br />b</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 2], 0),
            tinyActions.sContentKeystroke(Keys.up(), { }),
            tinyApis.sAssertContent('<figure><figcaption>a<br />b</figcaption></figure>'),
            tinyApis.sAssertSelection([0, 0, 2], 0, [0, 0, 2], 0)
          ])),
          Logger.t('Arrow down at line 1 in figcaption should not insert new block', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a<br />b</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            tinyApis.sAssertContent('<figure><figcaption>a<br />b</figcaption></figure>'),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
          ])),
          Logger.t('Arrow down at figcaption with forced_root_block_attrs set', GeneralSteps.sequence([
            tinyApis.sSetSetting('forced_root_block_attrs', { class: 'x' }),
            tinyApis.sSetContent('<figure><figcaption>a</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            tinyApis.sAssertContent('<figure><figcaption>a</figcaption></figure><p class="x">&nbsp;</p>'),
            tinyApis.sAssertSelection([1], 0, [1], 0),
            tinyApis.sDeleteSetting('forced_root_block_attrs')
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
