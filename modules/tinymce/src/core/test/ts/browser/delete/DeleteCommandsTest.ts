import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import * as DeleteCommands from 'tinymce/core/delete/DeleteCommands';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.delete.DeleteCommandsTest', (success, failure) => {

  Theme();
  const caret = Cell<Text>(null);

  const sDelete = (editor) => Step.sync(() => {
    DeleteCommands.deleteCommand(editor, caret);
  });

  const sForwardDelete = (editor) => Step.sync(() => {
    DeleteCommands.forwardDeleteCommand(editor, caret);
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('Delete should merge blocks', GeneralSteps.sequence([
        tinyApis.sSetContent('<h1>a</h1><p><span style="color: red;">b</span></p>'),
        tinyApis.sSetCursor([ 1, 0, 0 ], 0),
        sDelete(editor),
        tinyApis.sAssertContent('<h1>a<span style="color: red;">b</span></h1>'),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1)
      ])),
      Logger.t('ForwardDelete should merge blocks', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="color: red;">a</span></p><h1>b</h1>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 1),
        sForwardDelete(editor),
        tinyApis.sAssertContent('<p><span style="color: red;">a</span>b</p>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, success, failure);
});
