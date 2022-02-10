import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.TableNoWidthTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-6051: Removing and adding a column doesn\'t add sizes', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>Col 1</td><td>Col 2</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>Col 1</td></tr></tbody></table>');
    editor.execCommand('mceTableInsertColAfter');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>Col 1</td><td>&nbsp;</td></tr></tbody></table>');
  });

  it('TINY-6051: Removing and adding a row doesn\'t add sizes', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>Row 1</td></tr><tr><td>Row 2</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>Row 2</td></tr></tbody></table>');
    editor.execCommand('mceTableInsertRowBefore');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>&nbsp;</td></tr><tr><td>Row 2</td></tr></tbody></table>');
  });

  it('TINY-6051: Merging and splitting a cell doesn\'t add sizes', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td data-mce-selected="1" data-mce-first-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1" data-mce-last-selected="1">3</td><td>4</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    editor.execCommand('mceTableMergeCells');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td rowspan="2">1<br>3</td><td>2</td></tr><tr><td>4</td></tr></tbody></table>');
    editor.execCommand('mceTableSplitCells');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>1<br>3</td><td>2</td></tr><tr><td>&nbsp;</td><td>4</td></tr></tbody></table>');
  });
});
