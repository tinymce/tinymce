import { describe, it, context } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { requiresDeleteRangeOverride } from 'tinymce/core/delete/InlineFormatDelete';

describe('browser.tinymce.core.delete.InlineFormatDelete', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  context('TINY-9302: requiresDeleteRangeOverride', () => {
    it('should return true for selections of text format elements starting from start of and ending at the end of the element', () => {
      const editor = hook.editor();

      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'abc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><strong><em>abc</em></strong></p><p>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 'abc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p>a<strong><em>bcd</em>e</strong>f</p>');
      TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 'bcd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<ul><li><span style="text-decoration: underline;">abc</span></li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 'abc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<table><tr><td><span style="text-decoration: underline;">abc</span></td></tr></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 'abc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">a<img src="about:blank">bc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 2 ], 'bc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">a<iframe src="about:blank"></iframe>bc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 2 ], 'bc'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));
    });

    it('should return true for selections of text format elements starting from start of and ending after the end of the element', () => {
      const editor = hook.editor();

      editor.setContent('<p><span style="text-decoration: underline;">abc</span>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p><p>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 1, 0 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<ul><li><span style="text-decoration: underline;">abc</span>d</li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 1 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<table><tr><td><span style="text-decoration: underline;">abc</span>d</td></tr></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">a<img src="about:blank">bc</span>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">a<iframe src="about:blank"></iframe>bc</span></p><p>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 1, 0 ], 'd'.length);
      assert.isTrue(requiresDeleteRangeOverride(editor));
    });

    it('should return false for partial selections of text format element', () => {
      const editor = hook.editor();

      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 'ab'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 0, 0, 0 ], 'bc'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><strong><em>abc</em></strong></p><p>d</p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'a'.length, [ 1, 0 ], 'd'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));
    });

    it('should return false for text selections from the start of non-format element', () => {
      const editor = hook.editor();

      editor.setContent('<p>a<span style="text-decoration: underline;">bcd</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 0 ], 'bcd'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));

      editor.setContent('<div>a</div><p><span style="text-decoration: underline;">bcd</span></p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0 ], 'bcd'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));
    });

    it('should return false for non-text selections from the start of text format element', () => {
      const editor = hook.editor();

      editor.setContent('<p><span style="text-decoration: underline;"><img src="about:blank">a</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 1 ], 'a'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));

      editor.setContent('<p><span style="text-decoration: underline;"><iframe src="about:blank"></iframe>a</span></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 1 ], 'a'.length);
      assert.isFalse(requiresDeleteRangeOverride(editor));
    });
  });
});
