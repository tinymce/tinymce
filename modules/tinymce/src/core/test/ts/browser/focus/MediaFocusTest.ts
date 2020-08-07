import { FocusTools, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.focus.MediaFocusTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const editorBody = SugarElement.fromDom(editor.getBody());

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-4211', 'Focus media will select the object', [
        tinyApis.sSetContent('<p>a</p><p><audio src="custom/audio.mp3" controls="controls"></audio></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        FocusTools.sSetFocus('Focus audio element', editorBody, 'audio'),
        tinyApis.sSetSelection([ 1 ], 0, [ 1 ], 1)
      ]),
      Log.stepsAsStep('TINY-4211', 'Focus media in a cef span will select the span', [
        tinyApis.sSetContent('<p>a</p><p><span contenteditable="false"><audio src="custom/audio.mp3" controls="controls"></audio></span></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        FocusTools.sSetFocus('Focus audio element', editorBody, 'audio'),
        tinyApis.sSetSelection([ 1 ], 0, [ 1 ], 1)
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
