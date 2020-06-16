import { GeneralSteps, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.delete.OutdentForcedRootBlockFalseTest', (success, failure) => {
  Theme();

  const sTestDeleteOrBackspaceKey = (
    editor: Editor,
    tinyApis: TinyApis,
    tinyActions: TinyActions,
    key: number
  ) => (
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    expectedPath: number[],
    expectedOffset: number
  ) => GeneralSteps.sequence([
    tinyApis.sSetContent(setupHtml),
    tinyApis.sSetCursor(setupPath, setupOffset),
    tinyApis.sExecCommand('indent'),
    tinyApis.sNodeChanged(),
    tinyActions.sContentKeystroke(key, { }),
    sNormalizeBody(editor),
    tinyApis.sAssertContent(expectedHtml),
    tinyApis.sAssertSelection(expectedPath, expectedOffset, expectedPath, expectedOffset)
  ]);

  const sNormalizeBody = (editor: Editor) => Step.sync(() => {
    editor.getBody().normalize();
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    const sTestBackspace = sTestDeleteOrBackspaceKey(editor, tinyApis, tinyActions, Keys.backspace());

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('Backspace key on text with forced_root_block: false', GeneralSteps.sequence([
        sTestBackspace('a', [ 0 ], 0, '<div>a</div>', [ 0, 0 ], 0), // outdent
        sTestBackspace('aa', [ 0 ], 1, '<div style="padding-left: 40px;">aa</div>', [ 0, 0 ], 1), // no outdent
        sTestBackspace('a <br>b', [ 2 ], 0, 'a\n<div>b</div>', [ 1, 0 ], 0), // outdent
        sTestBackspace(
          'aa<br>bb',
          [ 2 ],
          1,
          'aa\n<div style="padding-left: 40px;">bb</div>',
          [ 1, 0 ],
          1
        ) // no outdent
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, success, failure);
});
