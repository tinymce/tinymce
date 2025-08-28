import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.DivDeleteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('Commands', () => {
    it('TINY-10840: Delete last character unwraps divs in WebKit/Blink browsers that div should be retained', () => {
      const editor = hook.editor();
      editor.setContent('<div class="foo"><br><br>a</div>');
      TinySelections.setCursor(editor, [ 0, 2 ], 1);
      editor.execCommand('Delete');
      TinyAssertions.assertContent(editor, '<div class="foo"><br><br><br></div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-10840: ForwardDelete last character unwraps divs in WebKit/Blink browsers', () => {
      const editor = hook.editor();
      editor.setContent('<div><br><br>a</div>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      editor.execCommand('ForwardDelete');
      TinyAssertions.assertContent(editor, '<div><br><br><br></div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-10840: Delete last br should empty the div', () => {
      const editor = hook.editor();
      editor.setContent('<div><br><br></div>');
      TinySelections.setCursor(editor, [ 0 ], 2);
      editor.execCommand('Delete');
      TinyAssertions.assertContent(editor, '<div>&nbsp;</div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-10840: Delete inside a empty div should replace it with the default block', () => {
      const editor = hook.editor();
      editor.setContent('<div>&nbsp;</div>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      editor.execCommand('Delete');
      assert.equal(editor.getBody().firstChild?.nodeName, 'P');
      TinyAssertions.assertContent(editor, '');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });
  });

  context('Keyboard', () => {
    it('TINY-10840: Backspace last character unwraps divs in WebKit/Blink browsers', () => {
      const editor = hook.editor();
      editor.setContent('<div><br><br>a</div>');
      TinySelections.setCursor(editor, [ 0, 2 ], 1);
      TinyContentActions.keystroke(editor, Keys.backspace());
      TinyAssertions.assertContent(editor, '<div><br><br><br></div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-10840: Delete last character unwraps divs in WebKit/Blink browsers', () => {
      const editor = hook.editor();
      editor.setContent('<div><br><br>a</div>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.delete());
      TinyAssertions.assertContent(editor, '<div><br><br><br></div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-10840: Backspace last br should empty the div', () => {
      const editor = hook.editor();
      editor.setContent('<div><br><br></div>');
      TinySelections.setCursor(editor, [ 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.backspace());
      TinyAssertions.assertContent(editor, '<div>&nbsp;</div>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-10840: Backspace inside a empty div should replace it with the default block', () => {
      const editor = hook.editor();
      editor.setContent('<div>&nbsp;</div>');
      TinySelections.setCursor(editor, [ 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.backspace());
      assert.equal(editor.getBody().firstChild?.nodeName, 'P');
      TinyAssertions.assertContent(editor, '');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });
  });
});

