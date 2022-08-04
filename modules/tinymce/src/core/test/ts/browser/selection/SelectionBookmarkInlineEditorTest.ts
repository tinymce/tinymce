import { Assertions, Cursors, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Hierarchy, Html, SimRange, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.selection.SelectionBookmarkInlineEditorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    inline: true,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);
  const testDivId = 'testDiv1234';

  const removeTestDiv = () => {
    const input = document.querySelector('#' + testDivId);
    if (input) {
      input.parentNode?.removeChild(input);
    }
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
    const input = document.querySelector('#' + testDivId) as HTMLDivElement;
    input.focus();
  };

  const assertPath = (label: string, root: SugarElement<Node>, expPath: number[], expOffset: number, actElement: Node, actOffset: number) => {
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

  it('assert bookmark is updated in response to `setRng`', () => {
    const editor = hook.editor();
    editor.resetContent('<p>a</p><p>b</p>');

    TinySelections.setRawSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false); // Ensure node change doesn't fire
    assertBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('assert selection after no nodechanged, should not restore', () => {
    const editor = hook.editor();
    editor.resetContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinySelections.setRawSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
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
    editor.dispatch('keyup', { } as KeyboardEvent);
    assertBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('assert selection after mouseup, should restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
    editor.dispatch('mouseup', { } as MouseEvent);
    return pWaitForBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('assert selection after touchend, should restore', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');

    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, false);
    editor.dispatch('touchend', { } as TouchEvent);
    return pWaitForBookmark(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });

  it('selection with mouseup outside editor body', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1, false);
    DOMUtils.DOM.dispatch(document, 'mouseup');
    return pWaitForBookmark(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  });

  it('getSelectionRange event should fire on bookmarked ranges', () => {
    const editor = hook.editor();
    const modifyRange = (e: EditorEvent<{ range: Range }>) => {
      const newRng = document.createRange();
      newRng.selectNodeContents(editor.getBody().lastChild as HTMLParagraphElement);
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
});
