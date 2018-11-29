import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.SpaceKeyBrModeTest', (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Logger.t('Press space at beginning text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a'),
        tinyApis.sSetCursor([0], 0),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 1, [0], 1),
        tinyApis.sAssertContent('&nbsp;a')
      ])),
      Logger.t('Press space in middle of text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('ab'),
        tinyApis.sSetCursor([0], 1),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 2, [0], 2),
        tinyApis.sAssertContent('a b')
      ])),
      Logger.t('Press space in middle of text before space', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a b'),
        tinyApis.sSetCursor([0], 1),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 2, [0], 2),
        tinyApis.sAssertContent('a&nbsp; b')
      ])),
      Logger.t('Press space in middle of text after space', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a b'),
        tinyApis.sSetCursor([0], 2),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 3, [0], 3),
        tinyApis.sAssertContent('a &nbsp;b')
      ])),
      Logger.t('Press space at end of text', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a'),
        tinyApis.sSetCursor([0], 1),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 2, [0], 2),
        tinyApis.sAssertContent('a&nbsp;')
      ])),
      Logger.t('Press space at end of text before br', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a<br />b'),
        tinyApis.sSetCursor([0], 1),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 2, [0], 2),
        tinyApis.sAssertContent('a&nbsp;<br />b')
      ])),
      Logger.t('Press space at start of text after br', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a<br />b'),
        tinyApis.sSetCursor([2], 0),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([2], 1, [2], 1),
        tinyApis.sAssertContent('a<br />&nbsp;b')
      ])),
      Logger.t('Press space at start of text after block', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a</p>b'),
        tinyApis.sSetCursor([1], 0),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([1], 1, [1], 1),
        tinyApis.sAssertContent('<p>a</p>&nbsp;b')
      ])),
      Logger.t('Press space end of text before block', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('a<p>b</p>'),
        tinyApis.sSetCursor([0], 1),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0], 2, [0], 2),
        tinyApis.sAssertContent('a&nbsp;<p>b</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    forced_root_block: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
