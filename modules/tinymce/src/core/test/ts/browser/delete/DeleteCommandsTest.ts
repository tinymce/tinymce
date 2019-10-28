import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import DeleteCommands from 'tinymce/core/delete/DeleteCommands';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.delete.DeleteCommandsTest', function (success, failure) {

  Theme();

  const sDelete = function (editor) {
    return Step.sync(function () {
      DeleteCommands.deleteCommand(editor);
    });
  };

  const sForwardDelete = function (editor) {
    return Step.sync(function () {
      DeleteCommands.forwardDeleteCommand(editor);
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('Delete should merge blocks', GeneralSteps.sequence([
        tinyApis.sSetContent('<h1>a</h1><p><span style="color: red;">b</span></p>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        sDelete(editor),
        tinyApis.sAssertContent('<h1>a<span style="color: red;">b</span></h1>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('ForwardDelete should merge blocks', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="color: red;">a</span></p><h1>b</h1>'),
        tinyApis.sSetCursor([0, 0, 0], 1),
        sForwardDelete(editor),
        tinyApis.sAssertContent('<p><span style="color: red;">a</span>b</p>'),
        tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, success, failure);
});
