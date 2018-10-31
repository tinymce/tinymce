import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.keyboard.InsertKeysTest', (success, failure) => {
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
          Logger.t('Insert in text node with nbsp at start of block', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>&nbsp;a</p>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<p>&nbsp;a</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b </em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b </em>&nbsp;c</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b</em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b</em> c</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b&nbsp;</em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b&nbsp;</em> c</p>')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp after a br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<br />&nbsp;b</p>'),
            tinyApis.sSetCursor([0, 2], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 0, [0, 2], 0),
            tinyApis.sAssertContent('<p>a<br />&nbsp;b</p>')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp within inline element followed by br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<br /><em>&nbsp;b</em></p>'),
            tinyApis.sSetCursor([0, 2, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2, 0], 0, [0, 2, 0], 0),
            tinyApis.sAssertContent('<p>a<br /><em>&nbsp;b</em></p>')
          ]))
        ])),

        Logger.t('Nbsp at last character position', GeneralSteps.sequence([
          Logger.t('Insert in text node with nbsp at end of block', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a&nbsp;</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em> b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a&nbsp;<em> b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with traling nbsp before inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em>b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a <em>b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with trailing nbsp before inline with leading nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em>&nbsp;b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a <em>&nbsp;b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with single middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;b</p>'),
            tinyApis.sSetCursor([0, 0], 3),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
            tinyApis.sAssertContent('<p>a b</p>')
          ])),
          Logger.t('Insert in text in node with multiple middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;b&nbsp;c&nbsp;d</p>'),
            tinyApis.sSetCursor([0, 0], 7),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 7, [0, 0], 7),
            tinyApis.sAssertContent('<p>a b c d</p>')
          ]))
        ])),
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
