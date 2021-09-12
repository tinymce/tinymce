import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SelectorFilter } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.InvalidColCountTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin, Theme ], true);

  const assertBasicTablePresence = (editor: Editor, tdCount: number, colCount: number) => {
    const cols = SelectorFilter.descendants(TinyDom.body(editor), 'col');
    const actualColCount = Arr.foldl(cols, (count, col) => count + (Attribute.getOpt(col, 'span').map(parseInt).getOr(1)), 0);
    assert.equal(actualColCount, colCount);

    TinyAssertions.assertContentPresence(editor, {
      td: tdCount,
    });
  };

  Arr.each([
    {
      label: 'more cols',
      tableHTML: '<table><colgroup><col /><col /><col /><col /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'more cols with span at beginning',
      tableHTML: '<table><colgroup><col span="2" /><col /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'more cols with span at end',
      tableHTML: '<table><colgroup><col /><col span="2" /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'single col with span greater than cells',
      tableHTML: '<table><colgroup><col span="3" /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    }
  ], (scenario) => {
    context(scenario.label, () => {
      const tableHTML = scenario.tableHTML;

      it('TINY-7041: insert new column at the start of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHTML);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertColBefore');
        assertBasicTablePresence(editor, 6, 3);
      });

      // TINY-7818 Snooker doesn't properly support spans on cols so the correct number of cols aren't present
      // it.skip('TINY-7041: insert new column in the middle of the table', () => {
      //   const editor = hook.editor();
      //   editor.setContent(tableHTML);
      //   TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
      //   editor.execCommand('mceTableInsertColAfter');
      //   assertBasicTablePresence(editor, 6, 3);
      // });

      it('TINY-7041: insert new column at the emd of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHTML);
        TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
        editor.execCommand('mceTableInsertColAfter');
        assertBasicTablePresence(editor, 6, 3);
      });

      it('TINY-7041: insert new row', () => {
        const editor = hook.editor();
        editor.setContent(tableHTML);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertRowAfter');
        assertBasicTablePresence(editor, 6, 2);
      });

      it('TINY-7041: delete first column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHTML);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 2, 1);
      });

      it('TINY-7041: delete last column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHTML);
        TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 2, 1);
      });
    });
  });
});
