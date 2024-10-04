import { Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as NodeType from 'tinymce/core/dom/NodeType';

import * as KeyUtils from '../../module/test/KeyUtils';

describe('browser.tinymce.core.keyboard.ArrowKeysCefTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    height: 200,
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('ScrollIntoView', () => scrollIntoViewCount++);
      editor.on('keydown', () => keydownCount++);
    }
  }, [], true);
  let scrollIntoViewCount = 0;
  let keydownCount = 0;

  const scrollTo = (editor: Editor, x: number, y: number) => editor.getWin().scrollTo(x, y);
  const resetScrollCount = () => scrollIntoViewCount = 0;
  const assertScrollCount = (expected: number) => {
    assert.equal(scrollIntoViewCount, expected, 'ScrollIntoView count');
  };

  const resetKeydownCount = () => keydownCount = 0;
  const assertKeydownCount = (expected: number) => {
    assert.equal(keydownCount, expected, 'Keydown count');
  };

  const assertStartContainer = (editor: Editor, f: (node: Node) => boolean) => {
    const startContainer = editor.selection.getRng().startContainer;
    assert.isTrue(f(startContainer), 'Check selection is in caret container');
  };

  const assertNode = (editor: Editor, f: (node: Node) => boolean) => {
    const node = editor.selection.getNode();
    assert.isTrue(f(node), 'Check selection is node');
  };

  // Firefox freezes up if loading media too quickly, so we need a small wait
  const pMediaWait = () => Env.browser.isFirefox() ? Waiter.pWait(20) : Waiter.pWait(0);

  const exitPreTest = (arrow: number, offset: number, expectedContent: string) => () => {
    const editor = hook.editor();
    editor.setContent('<pre>abc</pre>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);

    TinyContentActions.keystroke(editor, arrow);
    TinyAssertions.assertContent(editor, '<pre>abc</pre>');
    assertNode(editor, (node) => node.nodeName === 'PRE');

    TinySelections.setCursor(editor, [ 0, 0 ], offset);
    TinyContentActions.keystroke(editor, arrow);
    TinyAssertions.assertContent(editor, expectedContent);
    assertNode(editor, (node) => node.nodeName === 'P');
  };

  it('TBA: left/right over cE=false inline', () => {
    const editor = hook.editor();
    editor.setContent('<span contenteditable="false">1</span>');
    TinySelections.select(editor, 'span', []);

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">1</span></p>');
    assertStartContainer(editor, CaretContainer.isCaretContainerInline);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">1</span></p>');
    assertNode(editor, NodeType.isContentEditableFalse);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">1</span></p>');
    assertStartContainer(editor, CaretContainer.isCaretContainerInline);
  });

  it('TBA: left/right over cE=false block', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">1</p>');
    TinySelections.select(editor, 'p[contenteditable=false]', []);

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertContent(editor, '<p contenteditable="false">1</p>');
    assertStartContainer(editor, CaretContainer.isCaretContainerBlock);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertContent(editor, '<p contenteditable="false">1</p>');
    assertNode(editor, NodeType.isContentEditableFalse);

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertContent(editor, '<p contenteditable="false">1</p>');
    assertStartContainer(editor, CaretContainer.isCaretContainerBlock);
  });

  it('TBA: left before cE=false block and type', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">1</p>');
    TinySelections.select(editor, 'p[contenteditable=false]', []);

    TinyContentActions.keystroke(editor, Keys.left());
    KeyUtils.type(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>a</p><p contenteditable="false">1</p>');
    assertStartContainer(editor, (node) => !CaretContainer.isCaretContainerBlock(node.parentNode));
  });

  it('TBA: right after cE=false block and type', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">1</p>');
    TinySelections.select(editor, 'p[contenteditable=false]', []);

    TinyContentActions.keystroke(editor, Keys.right());
    KeyUtils.type(editor, 'a');
    TinyAssertions.assertContent(editor, '<p contenteditable="false">1</p><p>a</p>');
    assertStartContainer(editor, (node) => !CaretContainer.isCaretContainerBlock(node.parentNode));
  });

  it('TBA: up from P to inline cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<span contentEditable="false">1</span></p><p>abc</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 3);

    TinyContentActions.keystroke(editor, Keys.up());
    assertStartContainer(editor, CaretContainer.isCaretContainerInline);
  });

  it('TBA: down from P to inline cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p><p>a<span contentEditable="false">1</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);

    TinyContentActions.keystroke(editor, Keys.down());
    assertStartContainer(editor, CaretContainer.isCaretContainerInline);
  });

  it('TBA: exit pre block (up)', exitPreTest(Keys.up(), 0, '<p>&nbsp;</p><pre>abc</pre>'));
  it('TBA: exit pre block (left)', exitPreTest(Keys.left(), 0, '<p>&nbsp;</p><pre>abc</pre>'));
  it('TBA: exit pre block (down)', exitPreTest(Keys.down(), 3, '<pre>abc</pre><p>&nbsp;</p>'));
  it('TBA: exit pre block (right)', exitPreTest(Keys.right(), 3, '<pre>abc</pre><p>&nbsp;</p>'));

  it('TINY-6226: Should move to line above when large cef element is inline', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Line 1</p><p><video height="400" width="200" src="custom/video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3 with some more text</p>');
    await pMediaWait();
    scrollTo(editor, 0, 400);
    TinySelections.setCursor(editor, [ 2, 0 ], 22);
    resetScrollCount();
    TinyContentActions.keystroke(editor, Keys.up());
    assertScrollCount(1);
    TinyAssertions.assertSelection(editor, [ 1, 1 ], 1, [ 1, 1 ], 1);
    TinyContentActions.keystroke(editor, Keys.up());
    assertScrollCount(2);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 6, [ 0, 0 ], 6);
  });

  it('TINY-6226: Should move to line below when large cef element is on next line', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Line 1</p><p><video height="400" width="200" src="custom/video.mp4" contenteditable="false"></video> Line 2</p><p>Line 3</p>');
    await pMediaWait();
    scrollTo(editor, 0, 0);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resetScrollCount();
    TinyContentActions.keystroke(editor, Keys.down());
    assertScrollCount(1);
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.down());
    assertScrollCount(2);
    TinyAssertions.assertSelection(editor, [ 2, 0 ], 0, [ 2, 0 ], 0);
  });

  it('TINY-6471: Should not throw exception when line below when bogus cef is below', () => {
    const editor = hook.editor();
    editor.setContent('<p><br data-mce-bogus="1"></p><div contenteditable="false" data-mce-bogus="1"  style="user-select: none;"><div contenteditable="false" data-mce-bogus="1"></div></div>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    resetKeydownCount();
    TinyContentActions.keystroke(editor, Keys.down());
    TinyContentActions.keystroke(editor, Keys.down());
    // Checking 2 events fired verifies the event handlers finished running, so an exception shouldn't have been raised
    assertKeydownCount(2);
  });

  it('TINY-9565: Should navigate CEFs in reverse if the element has a dir attribute of rtl', () => {
    const editor = hook.editor();
    editor.setContent('<p dir="rtl">&#x5e2;&#x5b4;&#x5d1;<span contenteditable="false">CEF</span><span contenteditable="false">CEF</span>&#x5e2;&#x5b4;&#x5d1;</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 0);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 3);
    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 3 ], 1);
    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertSelection(editor, [ 0 ], 2, [ 0 ], 3);
    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 0);
    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 0);
  });
});
