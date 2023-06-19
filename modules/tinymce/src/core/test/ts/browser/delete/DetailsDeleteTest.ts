import { Cursors, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface TestCase {
  readonly html: string;
  readonly selection: Cursors.CursorPath;
  readonly expectedSelection: Cursors.CursorPath;
  readonly expectedPrevented: boolean;
}

describe('browser.tinymce.core.delete.DeleteDetailsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const caret = (path: number[], offset: number): Cursors.CursorPath => ({ startPath: path, soffset: offset, finishPath: path, foffset: offset });

  const testDeleteDetails = (forward: boolean) => (testCase: TestCase) => {
    const editor = hook.editor();

    editor.setContent(testCase.html);
    TinySelections.setSelection(editor, testCase.selection.startPath, testCase.selection.soffset, testCase.selection.finishPath, testCase.selection.foffset);
    const evt = editor.dispatch('keydown', new KeyboardEvent('keydown', { keyCode: forward ? Keys.delete() : Keys.backspace() }));
    assert.equal(evt.isDefaultPrevented(), testCase.expectedPrevented);
    TinyAssertions.assertSelection(editor, testCase.expectedSelection.startPath, testCase.expectedSelection.soffset, testCase.expectedSelection.finishPath, testCase.expectedSelection.foffset);
  };

  const testDeleteForward = testDeleteDetails(true);
  const testDeleteBackward = testDeleteDetails(false);

  context('Summary', () => {
    it('Delete forward at the end of summary should do nothing', () => testDeleteForward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0, 0, 0 ], 2),
      expectedSelection: caret([ 0, 0, 0 ], 2),
      expectedPrevented: true
    }));

    it('Delete backward at the start of summary should do nothing', () => testDeleteBackward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0, 0, 0 ], 0),
      expectedSelection: caret([ 0, 0, 0 ], 0),
      expectedPrevented: true
    }));

    it('Delete forward in middle of summary should not be prevented', () => testDeleteForward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0, 0, 0 ], 1),
      expectedSelection: caret([ 0, 0, 0 ], 1),
      expectedPrevented: false
    }));

    it('Delete backward in middle of summary should not be prevented', () => testDeleteBackward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0, 0, 0 ], 1),
      expectedSelection: caret([ 0, 0, 0 ], 1),
      expectedPrevented: false
    }));

    it('Delete backward in details body should not delete into summary', () => testDeleteBackward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0, 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0 ], 0),
      expectedPrevented: true
    }));
  });

  context('Into details', () => {
    it('Delete forward before details should do nothing', () => testDeleteForward({
      html: '<p>&nbsp;</p><details open><summary>s1</summary><div><p>&nbsp;</p></details>',
      selection: caret([ 0 ], 0),
      expectedSelection: caret([ 0 ], 0),
      expectedPrevented: true
    }));

    it('Delete backward after details should move caret but not change the content', () => testDeleteBackward({
      html: '<details open><summary>s1</summary><div><p>body</p></details><p>&nbsp;</p>',
      selection: caret([ 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 0 ], 'body'.length),
      expectedPrevented: true
    }));
  });

  context('Nested details', () => {
    it('TINY-9965: Delete forward before in first block before nested details should do nothing', () => testDeleteForward({
      html: '<details open><summary>s1</summary><div><p>&nbsp;</p><details open><summary>s2</summary><div>body</div></details></div></details>',
      selection: caret([ 0, 1, 0 ], 0),
      expectedSelection: caret([ 0, 1, 0 ], 0),
      expectedPrevented: true
    }));

    it('TINY-9965: Delete backward in last block after nested details should just move caret', () => testDeleteBackward({
      html: '<details open><summary>s1</summary><div><details open><summary>s2</summary><div>body</div></details><p>&nbsp;</p></div></details>',
      selection: caret([ 0, 1, 1 ], 0),
      expectedSelection: caret([ 0, 1, 0, 1, 0 ], 'body'.length),
      expectedPrevented: true
    }));
  });
});

