import { GeneralSteps, Keys, Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as NodeType from 'tinymce/core/dom/NodeType';
import Theme from 'tinymce/themes/silver/Theme';
import * as KeyUtils from '../../module/test/KeyUtils';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysCefTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    let scrollIntoViewCount = 0;
    let keydownCount = 0;
    editor.on('ScrollIntoView', () => scrollIntoViewCount++);
    editor.on('keydown', () => keydownCount++);

    const sScrollTo = (x: number, y: number) => Step.sync(() => editor.getWin().scrollTo(x, y));
    const sResetScrollCount = Step.sync(() => scrollIntoViewCount = 0);
    const sAssertScrollCount = (expected: number) => Step.sync(() => {
      Assert.eq('ScrollIntoView count', expected, scrollIntoViewCount);
    });

    const sResetKeydownCount = Step.sync(() => keydownCount = 0);
    const sAssertKeydownCount = (expected: number) => Step.sync(() => {
      Assert.eq('Keydown count', expected, keydownCount);
    });

    const sAssertStartContainer = (f: (node: Node) => boolean) => Step.sync(() => {
      const startContainer = editor.selection.getRng().startContainer;
      Assert.eq('Check selection is in caret container', true, f(startContainer));
    });

    const sAssertNode = (f: (node: Node) => boolean) => Step.sync(() => {
      const node = editor.selection.getNode();
      Assert.eq('Check selection is node', true, f(node));
    });

    const sType = (text: string) => Step.sync(() => KeyUtils.type(editor, text));

    // Firefox freezes up if loading media too quickly, so we need a small wait
    const sMediaWait = Env.browser.isFirefox() ? Step.wait(20) : Step.pass;

    const sExitPreTest = (arrow: number, offset: number, expectedContent: string) => GeneralSteps.sequence([
      tinyApis.sSetContent('<pre>abc</pre>'),
      tinyApis.sSetCursor([ 0, 0 ], 1),

      tinyActions.sContentKeystroke(arrow),
      tinyApis.sAssertContent('<pre>abc</pre>'),
      sAssertNode((node) => node.nodeName === 'PRE'),

      tinyApis.sSetCursor([ 0, 0 ], offset),
      tinyActions.sContentKeystroke(arrow),
      tinyApis.sAssertContent(expectedContent),
      sAssertNode((node) => node.nodeName === 'P')
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'left/right over cE=false inline', [
        tinyApis.sSetContent('<span contenteditable="false">1</span>'),
        tinyApis.sSelect('span', []),

        tinyActions.sContentKeystroke(Keys.left()),
        tinyApis.sAssertContent('<p><span contenteditable="false">1</span></p>'),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent('<p><span contenteditable="false">1</span></p>'),
        sAssertNode(NodeType.isContentEditableFalse),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent('<p><span contenteditable="false">1</span></p>'),
        sAssertStartContainer(CaretContainer.isCaretContainerInline)
      ]),
      Log.stepsAsStep('TBA', 'left/right over cE=false block', [
        tinyApis.sSetContent('<p contenteditable="false">1</p>'),
        tinyApis.sSelect('p[contenteditable=false]', []),

        tinyActions.sContentKeystroke(Keys.left()),
        tinyApis.sAssertContent('<p contenteditable="false">1</p>'),
        sAssertStartContainer(CaretContainer.isCaretContainerBlock),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent('<p contenteditable="false">1</p>'),
        sAssertNode(NodeType.isContentEditableFalse),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent('<p contenteditable="false">1</p>'),
        sAssertStartContainer(CaretContainer.isCaretContainerBlock)
      ]),
      Log.stepsAsStep('TBA', 'left before cE=false block and type', [
        tinyApis.sSetContent('<p contenteditable="false">1</p>'),
        tinyApis.sSelect('p[contenteditable=false]', []),

        tinyActions.sContentKeystroke(Keys.left()),
        sType('a'),
        tinyApis.sAssertContent('<p>a</p><p contenteditable="false">1</p>'),
        sAssertStartContainer((node) => !CaretContainer.isCaretContainerBlock(node.parentNode))
      ]),
      Log.stepsAsStep('TBA', 'right after cE=false block and type', [
        tinyApis.sSetContent('<p contenteditable="false">1</p>'),
        tinyApis.sSelect('p[contenteditable=false]', []),

        tinyActions.sContentKeystroke(Keys.right()),
        sType('a'),
        tinyApis.sAssertContent('<p contenteditable="false">1</p><p>a</p>'),
        sAssertStartContainer((node) => !CaretContainer.isCaretContainerBlock(node.parentNode))
      ]),
      Log.stepsAsStep('TBA', 'up from P to inline cE=false', [
        tinyApis.sSetContent('<p>a<span contentEditable="false">1</span></p><p>abc</p>'),
        tinyApis.sSetCursor([ 1, 0 ], 3),

        tinyActions.sContentKeystroke(Keys.up()),
        sAssertStartContainer(CaretContainer.isCaretContainerInline)
      ]),
      Log.stepsAsStep('TBA', 'down from P to inline cE=false', [
        tinyApis.sSetContent('<p>abc</p><p>a<span contentEditable="false">1</span></p>'),
        tinyApis.sSetCursor([ 0, 0 ], 3),

        tinyActions.sContentKeystroke(Keys.down()),
        sAssertStartContainer(CaretContainer.isCaretContainerInline)
      ]),
      Log.step('TBA', 'exit pre block (up)', sExitPreTest(Keys.up(), 0, '<p>&nbsp;</p><pre>abc</pre>')),
      Log.step('TBA', 'exit pre block (left)', sExitPreTest(Keys.left(), 0, '<p>&nbsp;</p><pre>abc</pre>')),
      Log.step('TBA', 'exit pre block (down)', sExitPreTest(Keys.down(), 3, '<pre>abc</pre><p>&nbsp;</p>')),
      Log.step('TBA', 'exit pre block (right)', sExitPreTest(Keys.right(), 3, '<pre>abc</pre><p>&nbsp;</p>')),
      Log.stepsAsStep('TINY-6226', 'Should move to line above when large cef element is inline', [
        tinyApis.sSetContent('<p>Line 1</p><p><video height="400" width="200" src="custom/video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3 with some more text</p>'),
        sMediaWait,
        sScrollTo(0, 400),
        tinyApis.sSetCursor([ 2, 0 ], 26),
        sResetScrollCount,
        tinyActions.sContentKeystroke(Keys.up()),
        sAssertScrollCount(1),
        tinyApis.sAssertSelection([ 1, 1 ], 1, [ 1, 1 ], 1),
        tinyActions.sContentKeystroke(Keys.up()),
        sAssertScrollCount(2),
        tinyApis.sAssertSelection([ 0, 0 ], 6, [ 0, 0 ], 6)
      ]),
      Log.stepsAsStep('TINY-6226', 'Should move to line below when large cef element is on next line', [
        tinyApis.sSetContent('<p>Line 1</p><p><video height="400" width="200" src="custom/video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3</p>'),
        sMediaWait,
        sScrollTo(0, 0),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sResetScrollCount,
        tinyActions.sContentKeystroke(Keys.down()),
        sAssertScrollCount(1),
        tinyApis.sAssertSelection([ 1, 0 ], 0, [ 1, 0 ], 0),
        tinyActions.sContentKeystroke(Keys.down()),
        sAssertScrollCount(2),
        tinyApis.sAssertSelection([ 2, 0 ], 0, [ 2, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6471', 'Should not throw exception when line below when bogus cef is below', [
        tinyApis.sSetRawContent('<p><br data-mce-bogus="1"></p><div contenteditable="false" data-mce-bogus="1"  style="user-select: none;"><div contenteditable="false" data-mce-bogus="1"></div></div>'),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        sResetKeydownCount,
        tinyActions.sContentKeystroke(Keys.down()),
        tinyActions.sContentKeystroke(Keys.down()),
        // Checking 2 events fired verifies the event handlers finished running, so an exception shouldn't have been raised
        sAssertKeydownCount(2)
      ])
    ], onSuccess, onFailure);
  }, {
    height: 200,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
