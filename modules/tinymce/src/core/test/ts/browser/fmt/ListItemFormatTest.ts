import { Cursors } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { FormatVars } from 'tinymce/core/fmt/FormatTypes';

interface ListItemFormatCase {
  readonly format: string;
  readonly value?: string;
  readonly rawInput: string;
  readonly selection: Cursors.CursorPath;
  readonly expected: string;
}

describe('browser.tinymce.core.fmt.ListItemFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const testListFormat = (f: (editor: Editor, format: string, vars: FormatVars | undefined) => void) => (testCase: ListItemFormatCase) => {
    const { format, selection, expected } = testCase;
    const editor = hook.editor();
    const vars = Type.isString(testCase.value) ? { value: testCase.value } : undefined;

    editor.getBody().innerHTML = testCase.rawInput;
    TinySelections.setSelection(editor, selection.startPath, selection.soffset, selection.finishPath, selection.foffset);
    f(editor, format, vars);
    TinyAssertions.assertContent(editor, expected);
  };

  context('Apply inline formats to LIs', () => {
    const testApplyInlineListFormat = testListFormat((editor, format, vars) => editor.formatter.apply(format, vars));

    context('Apply inline format to a single LI', () => {
      it('TINY-8961: applying bold to the entire contents of a LI should also apply that bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-weight: bold;"><strong>abc</strong></li></ul>'
        })
      );

      it('TINY-8961: applying italic to the entire contents of a LI should also apply that italic to the LI', () =>
        testApplyInlineListFormat({
          format: 'italic',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-style: italic;"><em>abc</em></li></ul>'
        })
      );

      it('TINY-8961: applying text color to the entire contents of a LI should also apply that color to the LI', () =>
        testApplyInlineListFormat({
          format: 'forecolor',
          value: 'red',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="color: red;"><span style="color: red;">abc</span></li></ul>'
        })
      );

      it('TINY-8961: applying font size to the entire contents of a LI should also apply that font size to the LI', () =>
        testApplyInlineListFormat({
          format: 'fontsize',
          value: '30px',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-size: 30px;"><span style="font-size: 30px;">abc</span></li></ul>'
        })
      );

      it('TINY-8961: applying font family to the entire contents of a LI should also apply that font family to the LI', () =>
        testApplyInlineListFormat({
          format: 'fontname',
          value: 'Arial',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-family: Arial;"><span style="font-family: Arial;">abc</span></li></ul>'
        })
      );

      it('TINY-8961: applying bold to a fully selected LI with deep nested content should apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li><em><span id="x">abc</span></em></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-weight: bold;"><strong><em><span id="x">abc</span></em></strong></li></ul>',
        })
      );

      it('TINY-9089: applying bold to fully selected LI with a trailing br element should ignore the br and apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc<br data-mce-bogus="1"></li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li style="font-weight: bold;"><strong>abc</strong></li></ul>'
        })
      );

      it('TINY-9089: applying bold to a partially selected LI with a br element with content after it should not apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc<br>def</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li><strong>abc</strong><br>def</li></ul>'
        })
      );

      it('TINY-8961: applying bold to a partially selected start of a LI should not apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 2 },
          expected: '<ul><li><strong>ab</strong>c</li></ul>'
        })
      );

      it('TINY-8961: applying bold to a partially selected end of a LI should not apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>a<strong>bc</strong></li></ul>'
        })
      );

      it('TINY-8961: applying bold to a partially selected LI should not apply bold to the LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 0, 0 ], foffset: 2 },
          expected: '<ul><li>a<strong>b</strong>c</li></ul>'
        })
      );

      it('TINY-8961: applying underline to the entire contents of a LI should not apply that to the LI since it will not be rendered', () =>
        testApplyInlineListFormat({
          format: 'underline',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li><span style="text-decoration: underline;">abc</span></li></ul>'
        })
      );
    });

    context('Apply inline formats to multiple LIs', () => {
      it('TINY-8961: applying bold to 3 fully selected LIs should also apply bold to the LIs', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li><li>def</li><li>ghj</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0 ], foffset: 3 },
          expected: '<ul><li style="font-weight: bold;"><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li style="font-weight: bold;"><strong>ghj</strong></li></ul>'
        })
      );

      it('TINY-8961: applying bold to a partially selected start LI and 2 fully selected LIs should also apply bold to the fully selected LIs', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li><li>def</li><li>ghj</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 2, 0 ], foffset: 3 },
          expected: '<ul><li>a<strong>bc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li style="font-weight: bold;"><strong>ghj</strong></li></ul>'
        })
      );

      it('TINY-8961: applying bold to 2 fully selected LIs and a partially selected end LI should also apply bold to the 2 fully selected LIs', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li><li>def</li><li>ghj</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0 ], foffset: 2 },
          expected: '<ul><li style="font-weight: bold;"><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li><strong>gh</strong>j</li></ul>'
        })
      );

      it('TINY-8961: applying bold to a fully selected LI and partially selected start and end LIs should only apply bold to the fully selected LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li><li>def</li><li>ghj</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 2, 0 ], foffset: 2 },
          expected: '<ul><li>a<strong>bc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li><strong>gh</strong>j</li></ul>'
        })
      );
    });

    context('Apply inline formats at caret', () => {
      it('TINY-8961: applying bold at caret in middle of word should not apply bold to parent LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 0, 0 ], foffset: 1 },
          expected: '<ul><li><strong>abc</strong></li></ul>',
        })
      );

      it('TINY-8961: applying bold at caret at the end of a word should not apply bold to parent LI', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li>abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 3, finishPath: [ 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>',
        })
      );
    });

    context('Apply inline formats on noneditable lists', () => {
      it('TINY-8961: applying bold on LIs in a noneditable parent should not get bold styles', () =>
        testApplyInlineListFormat({
          format: 'bold',
          rawInput: '<p>a</p><ul contenteditable="false"><li>b</li><li>c</li></ul><p>d</p>',
          selection: { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 2, 0 ], foffset: 1 },
          expected: '<p><strong>a</strong></p><ul contenteditable="false"><li>b</li><li>c</li></ul><p><strong>d</strong></p>',
        })
      );

      it('TINY-9563: applying bold on LIs in a noneditable root should not get bold styles', () => {
        TinyState.withNoneditableRootEditor(hook.editor(), () => {
          testApplyInlineListFormat({
            format: 'bold',
            rawInput: '<p>a</p><ul><li>b</li><li>c</li></ul><p>d</p>',
            selection: { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 2, 0 ], foffset: 1 },
            expected: '<p>a</p><ul><li>b</li><li>c</li></ul><p>d</p>',
          });
        });
      });
    });
  });

  context('Remove inline formats from LIs', () => {
    const testRemoveInlineListFormat = testListFormat((editor, format, vars) => editor.formatter.remove(format, vars));

    context('Remove inline formats from single LI', () => {
      it('TINY-8961: removing bold from the entire contents of a LI should also remove that bold from the LI', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold;"><strong>abc</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>',
        })
      );

      it('TINY-8961: removing italic from the entire contents of a LI should also remove that italic from the LI', () =>
        testRemoveInlineListFormat({
          format: 'italic',
          rawInput: '<ul><li style="font-style: italic;"><em>abc</em></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>',
        })
      );

      it('TINY-8961: removing text color from the entire contents of a LI should also remove that color from the LI', () =>
        testRemoveInlineListFormat({
          format: 'forecolor',
          value: 'red',
          rawInput: '<ul><li style="color: red;"><span style="color: red;">abc</span></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>'
        })
      );

      it('TINY-8961: removing font size from the entire contents of a LI should also remove that font size from the LI', () =>
        testRemoveInlineListFormat({
          format: 'fontsize',
          value: '30px',
          rawInput: '<ul><li style="font-size: 30px;"><span style="font-size: 30px;">abc</span></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>'
        })
      );

      it('TINY-8961: removing font family from the entire contents of a LI should also remove that font family from the LI', () =>
        testRemoveInlineListFormat({
          format: 'fontname',
          value: 'Arial',
          rawInput: '<ul><li style="font-family: Arial;"><span style="font-family: Arial;">abc</span></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li></ul>'
        })
      );
    });

    context('Remove inline formats from multiple LIs', () => {
      it('TINY-8961: removing bold from 3 fully selected LIs', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold;"><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li style="font-weight: bold;"><strong>ghj</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0, 0 ], foffset: 3 },
          expected: '<ul><li>abc</li><li>def</li><li>ghj</li></ul>',
        })
      );

      it('TINY-8961: removing bold from a partially selected start LI and 2 fully selected LIs should remove bold from all 3 LIs', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold;"><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li style="font-weight: bold;"><strong>ghj</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 1, finishPath: [ 0, 2, 0, 0 ], foffset: 3 },
          expected: '<ul><li><strong>a</strong>bc</li><li>def</li><li>ghj</li></ul>'
        })
      );

      it('TINY-8961: removing bold from 2 fully selected LIs and a partially selected end LI should remove bold from all 3 LIs', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold;"><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li><strong>ghj</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0, 0 ], foffset: 2 },
          expected: '<ul><li>abc</li><li>def</li><li>gh<strong>j</strong></li></ul>'
        })
      );

      it('TINY-8961: removing bold from a fully selected LI and partially selected start and end LIs should remove bold from all 3 LIs', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li><strong>abc</strong></li><li style="font-weight: bold;"><strong>def</strong></li><li><strong>ghj</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 1, finishPath: [ 0, 2, 0, 0 ], foffset: 2 },
          expected: '<ul><li><strong>a</strong>bc</li><li>def</li><li>gh<strong>j</strong></li></ul>'
        })
      );
    });

    context('Removing inline formats at caret', () => {
      it('TINY-8961: removing bold at caret in middle of word should remove bold from parent LI', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold"><strong>abc</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 1, finishPath: [ 0, 0, 0, 0 ], foffset: 1 },
          expected: '<ul><li>abc</li></ul>',
        })
      );

      it('TINY-8961: removing bold at caret at end of word should remove bold from parent LI', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<ul><li style="font-weight: bold"><strong>abc</strong></li></ul>',
          selection: { startPath: [ 0, 0, 0, 0 ], soffset: 3, finishPath: [ 0, 0, 0, 0 ], foffset: 3 },
          expected: '<ul><li><strong>abc</strong></li></ul>',
        })
      );
    });

    context('Remove inline formats on noneditable lists', () => {
      it('TINY-8961: remove bold on LI elements in a noneditable parent should not remove bold styles', () =>
        testRemoveInlineListFormat({
          format: 'bold',
          rawInput: '<p><strong>a</strong></p><ul contenteditable="false"><li style="font-weight: bold;">b</li><li style="font-weight: bold;">c</li></ul><p><strong>d</strong></p>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 2, 0, 0 ], foffset: 1 },
          expected: '<p>a</p><ul contenteditable="false"><li style="font-weight: bold;">b</li><li style="font-weight: bold;">c</li></ul><p>d</p>',
        })
      );

      it('TINY-9563: remove bold on LI elements in a noneditable root should not remove bold styles', () => {
        TinyState.withNoneditableRootEditor(hook.editor(), () => {
          const initialContent = '<ul><li style="font-weight: bold;">b</li><li style="font-weight: bold;">c</li></ul>';

          testRemoveInlineListFormat({
            format: 'bold',
            rawInput: initialContent,
            selection: { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 1, 0 ], foffset: 1 },
            expected: initialContent,
          });
        });
      });
    });

    context('Remove all formats', () => {
      it('TINY-8961: remove all formats should only remove the LI specific styles on a partially selected LI', () =>
        testRemoveInlineListFormat({
          format: 'removeformat',
          rawInput: '<ul><li style="font-size: 30px; font-weight: bold; color: red; font-style: italic; text-decoration: underline;">abc</li></ul>',
          selection: { startPath: [ 0, 0, 0 ], soffset: 1, finishPath: [ 0, 0, 0 ], foffset: 2 },
          expected: '<ul><li style="text-decoration: underline;">abc</li></ul>',
        })
      );
    });
  });
});
