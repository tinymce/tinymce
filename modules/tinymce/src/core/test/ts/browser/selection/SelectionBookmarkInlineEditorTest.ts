import { Assertions, Cursors, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, Html, SimRange, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.selection.SelectionBookmarkInlineEditorTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);
  const testDivId = 'testDiv1234';

  const removeTestDiv = () => {
    const input = document.querySelector('#' + testDivId);
    input.parentNode.removeChild(input);
  };

  const addTestDiv = () => {
    const div = document.createElement('div');
    div.innerHTML = 'xxx';
    div.contentEditable = 'true';
    div.id = testDivId;
    document.body.appendChild(div);
  };

  const pWaitForBookmark = (editor: Editor, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    return Waiter.pTryUntil('wait for selection', () => {
      assertBookmark(editor, startPath, startOffset, endPath, endOffset);
    });
  };

  const focusDiv = () => {
    const input = document.querySelector<HTMLDivElement>('#' + testDivId);
    input.focus();
  };

  const assertPath = (label: string, root: SugarElement, expPath: number[], expOffset: number, actElement: Node, actOffset: number) => {
    const expected = Cursors.calculateOne(root, expPath);
    const message = () => {
      const actual = SugarElement.fromDom(actElement);
      const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
      return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
    };
    Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom === actElement);
    Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
  };

  const assertBookmark = (editor: Editor, startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
    const actual: SimRange = editor.bookmark.getOrDie('no bookmark');
    const root = TinyDom.body(editor);
    assertPath('start', root, startPath, soffset, actual.start.dom, actual.soffset);
    assertPath('finish', root, finishPath, foffset, actual.finish.dom, actual.foffset);
  };

  before(() => addTestDiv());
  after(() => removeTestDiv());

  // On edge and ie it restores on focusout only
  if (browser.isIE() || browser.isEdge()) {
    it('restore even without second nodechange, restores on focusout', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
      focusDiv();

      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('restore with second nodechange, restores on focusout', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
      focusDiv();

      TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });
  // On the other browsers we test for bookmark saved on nodechange, keyup, mouseup and touchend events
  } else {
    it('assert selection after no nodechanged, should not restore', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');
      // In FireFox blurring the editor adds an undo level that triggers a nodechange that creates a bookmark,
      // so by adding an undo level first we keep it from adding a bookmark because the undo manager
      // does not add a new undolevel if it is the same as the previous level.
      editor.undoManager.add();

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false); // Ensure node change doesn't fire
      assertBookmark(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    });

    it('assert selection after nodechanged, should restore', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
      assertBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });

    it('assert selection after keyup, should restore', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
      editor.fire('keyup', { } as KeyboardEvent);
      assertBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });

    it('assert selection after mouseup, should restore', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
      editor.fire('mouseup', { } as MouseEvent);
      return pWaitForBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });

    it('assert selection after touchend, should restore', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>b</p>');

      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
      editor.fire('touchend', { } as TouchEvent);
      return pWaitForBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    });

    it('selection with mouseup outside editor body', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1, false);
      DOMUtils.DOM.fire(document, 'mouseup');
      return pWaitForBookmark(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    });

    it('getSelectionRange event should fire on bookmarked ranges', () => {
      const editor = hook.editor();
      const modifyRange = (e: EditorEvent<{ range: Range }>) => {
        const newRng = document.createRange();
        newRng.selectNodeContents(editor.getBody().lastChild);
        e.range = newRng;
      };

      editor.setContent('<p>a</p><p>b</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
      focusDiv();

      editor.on('GetSelectionRange', modifyRange);
      const elm = editor.selection.getNode();
      editor.off('GetSelectedRange', modifyRange);

      Assertions.assertHtml('Expect event to change the selection from a to b', 'b', elm.innerHTML);
    });
  }
});
