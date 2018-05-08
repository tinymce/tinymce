import { GeneralSteps, Logger, Pipeline, Step, RawAssertions } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import Plugin from 'tinymce/plugins/table/Plugin';
import KeyUtils from '../../module/test/KeyUtils';
import Env from 'tinymce/core/api/Env';
import { Editor } from 'tinymce/core/api/Editor';

const sAssertUndoManagerDataLength = (editor: Editor, expected: number) =>
  Step.sync(() => RawAssertions.assertEq('should have correct length', expected, editor.undoManager.data.length));

UnitTest.asynctest('browser.tinymce.core.FirefoxFakeCaretBeforeTableTypeTest', (success, failure) => {
  Theme();
  Plugin();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Env.gecko ? [ // This test is only relevant on Firefox
      Logger.t('cursor before table type', GeneralSteps.sequence([
        tinyApis.sSetContent('<table style="border-collapse: collapse; width: 100%;" border="1"><tbody><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr><tr><td style="width: 50%;">&nbsp;</td><td style="width: 50%;">&nbsp;</td></tr></tbody></table>'),
        tinyApis.sSetCursor([], 0),
        sAssertUndoManagerDataLength(editor, 1),
        Step.sync(() => KeyUtils.type(editor, 'a')),
        sAssertUndoManagerDataLength(editor, 3)
      ]))
    ] : [], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    plugins: 'table'
  }, success, failure);
});
