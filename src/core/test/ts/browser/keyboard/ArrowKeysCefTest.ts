import { Keys, Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysCefTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    let scrollIntoViewCount = 0;
    editor.on('ScrollIntoView', () => scrollIntoViewCount++);

    const sScrollTo = (x: number, y: number) => Step.sync(() => editor.getWin().scrollTo(x, y));
    const sResetScrollCount = Step.sync(() => scrollIntoViewCount = 0);
    const sAssertScrollCount = (expected: number) => Step.sync(() => {
      Assert.eq('ScrollIntoView count', expected, scrollIntoViewCount);
    });

    Pipeline.async({}, [
      tinyApis.sFocus,
      Log.stepsAsStep('TINY-6226', 'Should move to line above when large cef element is inline', [
        tinyApis.sSetContent('<p>Line 1</p><p><video height="400" width="200" src="video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3 with some more text</p>'),
        sScrollTo(0, 400),
        tinyApis.sSetCursor([ 2, 0 ], 26),
        sResetScrollCount,
        tinyActions.sContentKeystroke(Keys.up()),
        sAssertScrollCount(1),
        tinyApis.sAssertSelection([ 1, 1 ], 1, [ 1, 1 ], 1),
        tinyActions.sContentKeystroke(Keys.up()),
        tinyApis.sAssertSelection([ 0, 0 ], 6, [ 0, 0 ], 6)
      ]),
      Log.stepsAsStep('TINY-6226', 'Should move to line below when large cef element is on next line', [
        tinyApis.sSetContent('<p>Line 1</p><p><video height="400" width="200" src="video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3</p>'),
        sScrollTo(0, 0),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sResetScrollCount,
        tinyActions.sContentKeystroke(Keys.down()),
        sAssertScrollCount(1),
        tinyApis.sAssertSelection([ 1, 0 ], 0, [ 1, 0 ], 0),
        tinyActions.sContentKeystroke(Keys.down()),
        tinyApis.sAssertSelection([ 2, 0 ], 0, [ 2, 0 ], 0)
      ])
    ], onSuccess, onFailure);
  }, {
    height: 200,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});