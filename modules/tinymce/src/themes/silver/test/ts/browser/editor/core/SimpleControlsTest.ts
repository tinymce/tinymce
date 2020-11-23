import { Log, Pipeline, UiFinder } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asyncTest('browser.tinymce.themes.silver.editor.core.SimpleControlsTest', (success, failure) => {
  Theme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const api = TinyApis(editor);

    const sAssertToolbarButtonPressed = (title: string) => {
      return UiFinder.sExists(SugarBody.body(), `button[title="${title}"][aria-pressed="true"]`);
    };

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'b tag is recognized as valid tag for bold', [
        api.sSetContent('<p><b>bold text</b></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Bold')
      ]),
      Log.stepsAsStep('TBA', 'strong tag is recognized as valid tag for bold', [
        api.sSetContent('<p><strong>bold text</strong></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Bold')
      ]),
      Log.stepsAsStep('TBA', 'Style "font-weight: bold" is recognized as valid style for bold', [
        api.sSetContent('<p><span style="font-weight: bold;">bold text</span></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Bold')
      ]),
      Log.stepsAsStep('TBA', 'em tag is recognized as valid tag for italic', [
        api.sSetContent('<p><em>italic text</em></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Italic')
      ]),
      Log.stepsAsStep('TBA', 'i tag is recognized as valid tag for italic', [
        api.sSetContent('<p><i>italic text</i></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Italic')
      ]),
      Log.stepsAsStep('TBA', 'Style "font-style: italic" is recognized as valid style for italic', [
        api.sSetContent('<p><span style="font-style: italic;">italic text</span></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Italic')
      ]),
      Log.stepsAsStep('TBA', 'Style "text-decoration: underline" is recognized as valid style for underline', [
        api.sSetContent('<p><span style="text-decoration: underline;">underlined text</span></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Underline')
      ]),
      Log.stepsAsStep('TBA', 'u tag is recognized as valid tag for underline', [
        api.sSetContent('<p><u>underlined text</u></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Underline')
      ]),
      Log.stepsAsStep('TINY-6681', 'strike tag is recognized as valid tag for strikethrough', [
        api.sSetContent('<p><strike>strikethrough text</strike></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Strikethrough')
      ]),
      Log.stepsAsStep('TINY-6681', 's tag is recognized as valid tag for strikethrough', [
        api.sSetContent('<p><s>strikethrough text</s></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Strikethrough')
      ]),
      Log.stepsAsStep('TINY-6681', 'Style "text-decoration: line-through" is recognized as valid style for strikethrough', [
        api.sSetContent('<p><span style="text-decoration: line-through;">strikethrough text</span></p>'),
        api.sSetCursor([ 0, 0 ], 1),
        sAssertToolbarButtonPressed('Strikethrough')
      ]),
    ], onSuccess, onFailure);

  }, {
    selector: 'textarea',
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold italic underline strikethrough',
  }, success, failure);
});
