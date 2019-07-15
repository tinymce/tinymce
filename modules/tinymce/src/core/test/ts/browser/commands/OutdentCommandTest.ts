import { GeneralSteps, Logger, Pipeline, Step, Assertions } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.commands.OutdentCommandTest', (success, failure) => {
  Theme();

  const sAssertOutdentCommandState = (editor: Editor, expectedState: boolean) => Step.sync(() => {
    Assertions.assertEq('', expectedState, editor.queryCommandState('outdent'));
  });

  const sSetReadOnly = (editor: Editor, state: boolean) => Step.sync(() => {
    editor.setMode(state ? 'readonly' : 'design');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Outdent on single paragraph without margin/padding', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a</p>'),
        sAssertOutdentCommandState(editor, false),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p>a</p>')
      ])),
      Logger.t('Outdent on mutiple paragraphs without margin/padding', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [1, 0], 1),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p>a</p><p>b</p>')
      ])),
      Logger.t('Outdent on single paragraph with margin', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-left: 40px;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p>a</p>')
      ])),
      Logger.t('Outdent on single paragraph with padding', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', false),
        tinyApis.sSetContent('<p style="padding-left: 40px;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p>a</p>')
      ])),
      Logger.t('Outdent on single paragraph with margin x 2', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', false),
        tinyApis.sSetContent('<p style="padding-left: 80px;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="padding-left: 40px;">a</p>')
      ])),
      Logger.t('Outdent on single paragraph with padding x 2', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-left: 80px;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="margin-left: 40px;">a</p>')
      ])),
      Logger.t('Outdent on mutiple paragraphs with margin', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-left: 80px;">a</p><p style="margin-left: 40px;">b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [1, 0], 1),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="margin-left: 40px;">a</p><p>b</p>')
      ])),
      Logger.t('Outdent on mutiple paragraphs with padding', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', false),
        tinyApis.sSetContent('<p style="padding-left: 80px;">a</p><p style="padding-left: 40px;">b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [1, 0], 1),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="padding-left: 40px;">a</p><p>b</p>')
      ])),
      Logger.t('Outdent on single paragraph with padding and rtl', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', false),
        tinyApis.sSetContent('<p style="padding-right: 80px; direction: rtl;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="padding-right: 40px; direction: rtl;">a</p>')
      ])),
      Logger.t('Outdent on single paragraph with margin and rtl', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-right: 80px; direction: rtl;">a</p>'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="margin-right: 40px; direction: rtl;">a</p>')
      ])),
      Logger.t('Outdent on single paragraph with margin in readonly mode', GeneralSteps.sequence([
        tinyApis.sFocus,
        sSetReadOnly(editor, true),
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-left: 40px;">a</p>'),
        sAssertOutdentCommandState(editor, false),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="margin-left: 40px;">a</p>'),
        sSetReadOnly(editor, false)
      ])),
      Logger.t('Outdent on selected table using margin', GeneralSteps.sequence([
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<table style="margin-left: 80px;"><tr><td>a</td></tr></table>'),
        tinyApis.sExecCommand('SelectAll'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<table style="margin-left: 40px;"><tbody><tr><td>a</td></tr></tbody></table>')
      ])),
      Logger.t('Outdent on selected table always using margin', GeneralSteps.sequence([
        tinyApis.sSetSetting('indent_use_margin', false),
        tinyApis.sSetContent('<table style="margin-left: 80px;"><tr><td>a</td></tr></table>'),
        tinyApis.sExecCommand('SelectAll'),
        sAssertOutdentCommandState(editor, true),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<table style="margin-left: 40px;"><tbody><tr><td>a</td></tr></tbody></table>')
      ])),
      Logger.t('Outdent on contentEditable=false', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetSetting('indent_use_margin', true),
        tinyApis.sSetContent('<p style="margin-left: 80px;" contenteditable="false"><span contenteditable="true">a</span></p>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        tinyApis.sExecCommand('outdent'),
        tinyApis.sAssertContent('<p style="margin-left: 80px;" contenteditable="false"><span contenteditable="true">a</span></p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, success, failure);
});
