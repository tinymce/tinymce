import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.keyboard.InsertKeysBrModeTest', (success, failure) => {
  Theme();

  const sFireInsert = (editor: Editor) => {
    return Step.sync(() => {
      editor.fire('input', { isComposing: false });
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Insert key in text with in nbsp text node', GeneralSteps.sequence([
        Logger.t('Nbsp at first character position', GeneralSteps.sequence([
          Logger.t('Insert in text node with nbsp at start of body', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('&nbsp;a'),
            tinyApis.sSetCursor([0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 2, [0], 2),
            tinyApis.sAssertContent('&nbsp;a')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a<em>b </em>&nbsp;c'),
            tinyApis.sSetCursor([2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([2], 2, [2], 2),
            tinyApis.sAssertContent('a<em>b </em>&nbsp;c')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a<em>b</em>&nbsp;c'),
            tinyApis.sSetCursor([2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([2], 2, [2], 2),
            tinyApis.sAssertContent('a<em>b</em> c')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a<em>b&nbsp;</em>&nbsp;c'),
            tinyApis.sSetCursor([2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([2], 2, [2], 2),
            tinyApis.sAssertContent('a<em>b&nbsp;</em> c')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp after a br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a<br />&nbsp;b'),
            tinyApis.sSetCursor([2], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([2], 0, [2], 0),
            tinyApis.sAssertContent('a<br />&nbsp;b')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp within inline element followed by br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a<br /><em>&nbsp;b</em>'),
            tinyApis.sSetCursor([2, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([2, 0], 0, [2, 0], 0),
            tinyApis.sAssertContent('a<br /><em>&nbsp;b</em>')
          ]))
        ])),

        Logger.t('Nbsp at last character position', GeneralSteps.sequence([
          Logger.t('Insert in text node with nbsp at end of body', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;'),
            tinyApis.sSetCursor([0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 0, [0], 0),
            tinyApis.sAssertContent('a&nbsp;')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;<em> b</em>c'),
            tinyApis.sSetCursor([0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 0, [0], 0),
            tinyApis.sAssertContent('a&nbsp;<em> b</em>c')
          ])),
          Logger.t('Insert in text in node with trailing nbsp before inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;<em>b</em>c'),
            tinyApis.sSetCursor([0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 0, [0], 0),
            tinyApis.sAssertContent('a <em>b</em>c')
          ])),
          Logger.t('Insert in text in node with trailing nbsp before inline with leading nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;<em>&nbsp;b</em>c'),
            tinyApis.sSetCursor([0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 0, [0], 0),
            tinyApis.sAssertContent('a <em>&nbsp;b</em>c')
          ])),
          Logger.t('Insert in text in node with single middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;b'),
            tinyApis.sSetCursor([0], 3),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 3, [0], 3),
            tinyApis.sAssertContent('a b')
          ])),
          Logger.t('Insert in text in node with multiple middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetRawContent('a&nbsp;b&nbsp;c&nbsp;d'),
            tinyApis.sSetCursor([0], 7),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0], 7, [0], 7),
            tinyApis.sAssertContent('a b c d')
          ]))
        ])),
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    forced_root_block: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
