import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';
import { Hierarchy } from '@ephox/sugar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.selection.FullySelectedBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, []);

  const getBlockPaths = (editor: Editor): number[][] =>
    Arr.map(editor.selection.getFullySelectedBlocks(), (block) =>
      Hierarchy.path(TinyDom.body(editor), TinyDom.fromDom(block)).getOrDie('Block is not inside the editor body')
    );

  const testSelection = (content: string, sPath: number[], sOffset: number, fPath: number[], fOffset: number, expected: number[][]) => {
    const editor = hook.editor();
    editor.setContent(content);
    TinySelections.setSelection(editor, sPath, sOffset, fPath, fOffset);
    // Guard against the selection being normalized away from what the case intends to test
    TinyAssertions.assertSelection(editor, sPath, sOffset, fPath, fOffset);
    assert.deepEqual(getBlockPaths(editor), expected);
  };

  context('Collapsed selection', () => {
    it('TINYMCE-14939: should return no blocks for a collapsed selection at the start', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      assert.deepEqual(getBlockPaths(editor), []);
    });

    it('TINYMCE-14939: should return no blocks for a collapsed selection in an empty block', () => {
      const editor = hook.editor();
      editor.setContent('<p></p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      assert.deepEqual(getBlockPaths(editor), []);
    });
  });

  context('Single block', () => {
    it('TINYMCE-14939: should return the paragraph when all of its text is selected', () =>
      testSelection('<p>abc</p>', [ 0, 0 ], 0, [ 0, 0 ], 3, [[ 0 ]]));

    it('TINYMCE-14939: should return no blocks when the start of the paragraph is not selected', () =>
      testSelection('<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 3, []));

    it('TINYMCE-14939: should return no blocks when the end of the paragraph is not selected', () =>
      testSelection('<p>abc</p>', [ 0, 0 ], 0, [ 0, 0 ], 2, []));

    it('TINYMCE-14939: should ignore a trailing padding br', () =>
      testSelection('<p>abc<br></p>', [ 0, 0 ], 0, [ 0, 0 ], 3, [[ 0 ]]));

    it('TINYMCE-14939: should not ignore two trailing brs', () =>
      testSelection('<p>abc<br><br></p>', [ 0, 0 ], 0, [ 0, 0 ], 3, []));

    it('TINYMCE-14939: should return the paragraph when the text of a nested inline wrapper is selected', () =>
      testSelection('<p><strong><em>abc</em></strong></p>', [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 3, [[ 0 ]]));

    it('TINYMCE-14939: should return no blocks when only the inline wrapper is selected and a sibling text follows', () =>
      testSelection('<p><strong>abc</strong>def</p>', [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3, []));

    it('TINYMCE-14939: should return the pre when all of its text including the whitespace is selected', () =>
      testSelection('<pre>  abc  </pre>', [ 0, 0 ], 0, [ 0, 0 ], 7, [[ 0 ]]));

    it('TINYMCE-14939: should return no blocks when the whitespace of the pre is not selected', () =>
      testSelection('<pre>  abc  </pre>', [ 0, 0 ], 2, [ 0, 0 ], 5, []));
  });

  context('Multiple blocks', () => {
    it('TINYMCE-14939: should return both paragraphs when they are fully selected', () =>
      testSelection('<p>abc</p><p>def</p>', [ 0, 0 ], 0, [ 1, 0 ], 3, [[ 0 ], [ 1 ]]));

    it('TINYMCE-14939: should leave out a partially selected first paragraph', () =>
      testSelection('<p>abc</p><p>def</p>', [ 0, 0 ], 1, [ 1, 0 ], 3, [[ 1 ]]));

    it('TINYMCE-14939: should leave out a partially selected last paragraph', () =>
      testSelection('<p>abc</p><p>def</p>', [ 0, 0 ], 0, [ 1, 0 ], 2, [[ 0 ]]));

    it('TINYMCE-14939: should return only the middle paragraph when the first and last are partially selected', () =>
      testSelection('<p>abc</p><p>def</p><p>ghi</p>', [ 0, 0 ], 1, [ 2, 0 ], 1, [[ 1 ]]));
  });

  context('Lists', () => {
    it('TINYMCE-14939: should return no blocks when the text of a list item is selected without its nested list', () =>
      testSelection('<ul><li>abc<ul><li>def</li></ul></li></ul>', [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3, []));

    // The nested list is a block between the two list items, so it is included as well
    it('TINYMCE-14939: should return the list item, the nested list and its list item when both list items are selected', () =>
      testSelection('<ul><li>abc<ul><li>def</li></ul></li></ul>', [ 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 3, [[ 0, 0 ], [ 0, 0, 1 ], [ 0, 0, 1, 0 ]]));
  });

  context('Body level selection', () => {
    it('TINYMCE-14939: should return the paragraph for a body level range around it', () =>
      testSelection('<p>abc</p>', [], 0, [], 1, [[ 0 ]]));

    it('TINYMCE-14939: should return the paragraph after selecting it with editor.selection.select', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      editor.selection.select(editor.dom.select('p')[0]);
      TinyAssertions.assertSelection(editor, [], 0, [], 1);
      assert.deepEqual(getBlockPaths(editor), [[ 0 ]]);
    });

    it('TINYMCE-14939: should return all paragraphs after the SelectAll command', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p>def</p>');
      editor.execCommand('SelectAll');
      assert.deepEqual(getBlockPaths(editor), [[ 0 ], [ 1 ]]);
    });
  });
});
