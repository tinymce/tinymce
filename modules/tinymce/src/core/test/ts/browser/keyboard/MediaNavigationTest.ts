import { Keys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as NodeType from 'tinymce/core/dom/NodeType';

describe('browser.tinymce.core.keyboard.MediaNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    height: 400,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const assertStartContainer = (editor: Editor, f: (node: Node) => boolean) => {
    const startContainer = editor.selection.getRng().startContainer;
    assert.isTrue(f(startContainer), 'Check selection is in caret container');
  };

  const assertNode = (editor: Editor, f: (node: Node) => boolean) => {
    const node = editor.selection.getNode();
    assert.isTrue(f(node), 'Check selection is node');
  };

  Arr.each([
    { type: 'video', content: '<video controls="controls"><source src="custom/video.mp4"></video>', skip: false },
    { type: 'audio', content: '<audio controls="controls"><source src="custom/audio.mp3"></audio>', skip: false },
    // Firefox won't render without a valid embed/object, so skip
    { type: 'embed', content: '<embed src="custom/video.mp4">', skip: Env.browser.isFirefox() },
    // TINY-7871: Safari 14.1 also appears to have a bug that causes it to freeze without a valid object
    { type: 'object', content: '<object data="custom/file.pdf"></object>', skip: Env.browser.isFirefox() || Env.browser.isSafari() }
  ], (test) => {
    const { type, content } = test;

    context(`${type} media`, () => {
      before(function () {
        if (test.skip) {
          this.skip();
        }
      });

      it(`TINY-4211: left/right over ${type} element`, () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);

        TinyContentActions.keystroke(editor, Keys.left());
        TinyAssertions.assertContent(editor, `<p>${content}</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        TinyContentActions.keystroke(editor, Keys.right());
        TinyAssertions.assertContent(editor, `<p>${content}</p>`);
        assertNode(editor, (node) => node.nodeName.toLowerCase() === type);

        TinyContentActions.keystroke(editor, Keys.right());
        TinyAssertions.assertContent(editor, `<p>${content}</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);
      });

      it(`TINY-4211: up/down over ${type} element`, () => {
        const editor = hook.editor();
        editor.setContent(`<p>a</p><p>${content}</p><p>b</p>`);
        TinySelections.setCursor(editor, [ 0, 0 ], 1);

        TinyContentActions.keystroke(editor, Keys.down());
        TinyAssertions.assertContent(editor, `<p>a</p><p>${content}</p><p>b</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        TinyContentActions.keystroke(editor, Keys.down());
        TinyAssertions.assertContent(editor, `<p>a</p><p>${content}</p><p>b</p>`);
        assertNode(editor, (node) => NodeType.isElement(node) && node.innerHTML === 'b');

        TinyContentActions.keystroke(editor, Keys.up());
        TinyAssertions.assertContent(editor, `<p>a</p><p>${content}</p><p>b</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        TinyContentActions.keystroke(editor, Keys.up());
        TinyAssertions.assertContent(editor, `<p>a</p><p>${content}</p><p>b</p>`);
        assertNode(editor, (node) => NodeType.isElement(node) && node.innerHTML === 'a');
      });

      it(`TINY-4211: up/down/home/end at start/end of single line`, () => {
        const editor = hook.editor();
        editor.setContent(`<p>a${content}</p>`);
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        TinyContentActions.keystroke(editor, Keys.down());
        TinyAssertions.assertContent(editor, `<p>a${content}</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        TinyContentActions.keystroke(editor, Keys.end());
        TinyAssertions.assertContent(editor, `<p>a${content}</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        editor.setContent(`<p>${content}a</p>`);
        TinySelections.setCursor(editor, [ 0, 2 ], 1);
        TinyContentActions.keystroke(editor, Keys.up());
        TinyAssertions.assertContent(editor, `<p>${content}a</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);

        TinySelections.setCursor(editor, [ 0, 2 ], 1);
        TinyContentActions.keystroke(editor, Keys.home());
        TinyAssertions.assertContent(editor, `<p>${content}a</p>`);
        assertStartContainer(editor, CaretContainer.isCaretContainerInline);
      });
    });
  });
});
