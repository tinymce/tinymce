import { GeneralSteps, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.DeindentTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sTestDeleteOrBackspaceKey = function (editor, tinyApis, tinyActions, key) {
    return function (setupHtml, setupPath, setupOffset, expectedHtml, expectedPath, expectedOffet) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(setupHtml),
        tinyApis.sSetCursor(setupPath, setupOffset),
        tinyApis.sExecCommand('indent'),
        tinyApis.sNodeChanged,
        tinyActions.sContentKeystroke(key, { }),
        sNormalizeBody(editor),
        tinyApis.sAssertContent(expectedHtml),
        tinyApis.sAssertSelection(expectedPath, expectedOffet, expectedPath, expectedOffet),
      ]);
    };
  };

  const sNormalizeBody = function (editor) {
    return Step.sync(function () {
      editor.getBody().normalize();
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    const sTestBackspace = sTestDeleteOrBackspaceKey(editor, tinyApis, tinyActions, Keys.backspace());

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Backspace key on text', GeneralSteps.sequence([
        sTestBackspace('<p>a</p>', [0, 0], 0, '<p>a</p>', [0, 0], 0), // outdent
        sTestBackspace('<p>aa</p>', [0, 0], 1, '<p style="padding-left: 40px;">aa</p>', [0, 0], 1), // no outdent
        sTestBackspace('<p>a</p><p>b</p>', [1, 0], 0, '<p>a</p>\n<p>b</p>', [1, 0], 0), // outdent
        sTestBackspace('<p>a</p><p>bb</p>', [1, 0], 1, '<p>a</p>\n<p style="padding-left: 40px;">bb</p>', [1, 0], 1), // no outdent
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
