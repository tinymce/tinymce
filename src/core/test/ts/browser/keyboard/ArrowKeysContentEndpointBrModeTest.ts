import { GeneralSteps, Keys, Logger, Pipeline, Assertions, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysContentEndpointBrModeTest', (success, failure) => {
    Theme();

    // TODO: This should probably be in mcagar
    const sAssertRawContent = (editor: Editor, expected: string) => Step.sync(() => {
      Assertions.assertHtml('Not expected body html', expected, editor.getBody().innerHTML);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Arrow keys in figcaption', GeneralSteps.sequence([
          Logger.t('Arrow up from start of figcaption to paragraph before figure', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyActions.sContentKeystroke(Keys.up(), { }),
            tinyApis.sAssertContent('<br /><figure><figcaption>a</figcaption></figure>'),
            tinyApis.sAssertSelection([], 0, [], 0)
          ])),
          Logger.t('Arrow down from end of figcaption to paragraph after figure', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>a</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            sAssertRawContent(editor, '<figure><figcaption>a</figcaption></figure><br>'),
            tinyApis.sAssertSelection([], 1, [], 1)
          ])),
          Logger.t('Arrow up in middle of figcaption', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.up(), { }),
            sAssertRawContent(editor, '<br><figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sAssertSelection([], 0, [], 0)
          ])),
          Logger.t('Arrow down in middle of figcaption', GeneralSteps.sequence([
            tinyApis.sSetContent('<figure><figcaption>ab</figcaption></figure>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyActions.sContentKeystroke(Keys.down(), { }),
            sAssertRawContent(editor, '<figure><figcaption>ab</figcaption></figure><br>'),
            tinyApis.sAssertSelection([], 1, [], 1)
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      forced_root_block: false,
      add_unload_trigger: false,
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    }, success, failure);
  }
);
