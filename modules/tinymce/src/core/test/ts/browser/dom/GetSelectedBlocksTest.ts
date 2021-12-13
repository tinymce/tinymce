import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.dom.GetSelectedBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertSelectedBlocks = (editor: Editor, expectedBlocks: (keyof HTMLElementTagNameMap)[]) => {
    const selectedBlocks = editor.selection.getSelectedBlocks();
    const selectedBlocksTags = Arr.map(selectedBlocks, (block) => block.tagName.toLowerCase());
    assert.deepEqual(selectedBlocksTags, expectedBlocks);
  };

  context('paragraphs', () => {
    it('should return paragraph for empty paragraph', () => {
      const editor = hook.editor();
      editor.resetContent();
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      assertSelectedBlocks(editor, [ 'p' ]);
    });

    it('should return paragraph for collapsed selection in simple paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      assertSelectedBlocks(editor, [ 'p' ]);
    });

    it('should return paragraph for ranged selection in simple paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.select(editor, 'p', []);
      assertSelectedBlocks(editor, [ 'p' ]);
    });

    it('should return paragraphs for ranged selection across paragraphs', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p>def</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 1);
      assertSelectedBlocks(editor, [ 'p', 'p' ]);
    });
  });

  context('table cells', () => {
    it('should return td for collapsed selection in in empty cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      assertSelectedBlocks(editor, [ 'td' ]);
    });

    it('should return td for collapsed selection in cell with text', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>abc</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      assertSelectedBlocks(editor, [ 'td' ]);
    });

    it('should return td for ranged selection in in cell with text', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>abc</td></tr></tbody></table>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 3);
      assertSelectedBlocks(editor, [ 'td' ]);
    });

    it('should return td and paragraph for selection in cell with a paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td><p>abc</p><p>def</p></td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 1);
      assertSelectedBlocks(editor, [ 'td', 'p' ]);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 3);
      assertSelectedBlocks(editor, [ 'td', 'p' ]);
    });

    it('should return fake selected cells and no other blocks even with other block selected', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody><tr>' +
        '<td data-mce-selected="1" data-mce-first-selected="1" ><p>abc</p><p>def</p></td>' +
        '<td data-mce-selected="1" data-mce-last-selected="1">cell 2</td>' +
        '</tr></tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 3);
      assertSelectedBlocks(editor, [ 'td', 'td' ]);
    });

    it('should return correct blocks for selection that starts outside a table and ends inside a table', () => {
      const editor = hook.editor();
      editor.setContent(
        '<p>abc</p>' +
        '<table><tbody>' +
        '<tr><td><p>abc</p><p>def</p></td><td>cell 2</td></tr>' +
        '<tr><td>cell 3</td><td>cell 4</td></tr>' +
        '</tbody></table>'
      );
      TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0, 1, 0, 0 ], 3);
      assertSelectedBlocks(editor, [ 'p', 'table', 'tbody', 'tr', 'td', 'p', 'p', 'td', 'tr', 'td' ]);
    });

    it('should return correct blocks for selection that starts inside a table and ends outside a table', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table><tbody>' +
        '<tr><td><p>abc</p><p>def</p></td><td>cell 2</td></tr>' +
        '<tr><td>cell 3</td><td>cell 4</td></tr>' +
        '</tbody></table>' +
        '<p>abc</p>'
      );
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 1, [ 1, 0 ], 3);
      assertSelectedBlocks(editor, [ 'td', 'p', 'p', 'td', 'tr', 'td', 'td', 'p' ]);
    });
  });
});
