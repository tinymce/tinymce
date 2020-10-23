import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.FormatterClosestTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertClosest = (names: string[], expectedName: string) =>
      Step.sync(() => {
        const actualName = editor.formatter.closest(names);
        Assert.eq('Should match expected format name', expectedName, actualName);
      });

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Should return null since the caret is not inside a bold format', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'bold' ], null)
      ]),
      Log.stepsAsStep('TBA', 'Should return p block format since caret is inside a p', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'p', 'h1' ], 'p')
      ]),
      Log.stepsAsStep('TBA', 'Should return h1 block format since caret is inside a h1', [
        tinyApis.sSetContent('<h1>a</h1>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'p', 'h1' ], 'h1')
      ]),
      Log.stepsAsStep('TBA', 'Should return italic inline format since caret is inside a em element', [
        tinyApis.sSetContent('<p><em>a<em></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sAssertClosest([ 'p', 'italic' ], 'italic')
      ]),
      Log.stepsAsStep('TBA', 'Should return aligncenter selector format since caret is in a paragraph that is center aligned', [
        tinyApis.sSetContent('<p style="text-align: center">a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'aligncenter', 'p' ], 'aligncenter')
      ]),
      Log.stepsAsStep('TBA', 'Should return p block format since caret is inside a em inside a p element', [
        tinyApis.sSetContent('<p><em>a<em></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sAssertClosest([ 'p' ], 'p')
      ]),
      Log.stepsAsStep('TBA', 'Should return aligncenter since that format is before the also matching p format', [
        tinyApis.sSetContent('<p style="text-align: center">a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'aligncenter', 'p' ], 'aligncenter')
      ]),
      Log.stepsAsStep('TBA', 'Should return p since that format is before the also matching aligncenter format', [
        tinyApis.sSetContent('<p style="text-align: center">a</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sAssertClosest([ 'p', 'aligncenter' ], 'p')
      ]),
      Log.stepsAsStep('TBA', 'Should return aligncenter selector format since caret is inside a em inside a p element that is center aligned', [
        tinyApis.sSetContent('<p style="text-align: center"><em>a<em></p>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        sAssertClosest([ 'aligncenter', 'p' ], 'aligncenter')
      ])
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
