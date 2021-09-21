import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ExcessColsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin, Theme ], true);

  const assertBasicTablePresence = (editor: Editor, tdCount: number) => {
    TinyAssertions.assertContentPresence(editor, {
      td: tdCount,
    });
  };

  // Note: The goal of these tests is to make sure an exception is not thrown and each table operation works
  // when there are more col elements than actual columns
  Arr.each([
    {
      label: 'more cols',
      tableHtml: '<table><colgroup><col /><col /><col /><col /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'more cols with span at beginning',
      tableHtml: '<table><colgroup><col span="2" /><col /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'more cols with span at end',
      tableHtml: '<table><colgroup><col /><col span="2" /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    },
    {
      label: 'single col with span greater than cells',
      tableHtml: '<table><colgroup><col span="3" /></colgroup><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
    }
  ], (scenario) => {
    context(scenario.label, () => {
      const tableHtml = scenario.tableHtml;

      it('TINY-7041: insert new column at the start of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertColBefore');
        assertBasicTablePresence(editor, 6);
      });

      it('TINY-7041: insert new column in the middle of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertColAfter');
        assertBasicTablePresence(editor, 6);
      });

      it('TINY-7041: insert new column at the end of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
        editor.execCommand('mceTableInsertColAfter');
        assertBasicTablePresence(editor, 6);
      });

      it('TINY-7041: insert new row', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertRowAfter');
        assertBasicTablePresence(editor, 6);
      });

      it('TINY-7041: delete first column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 2);
      });

      it('TINY-7041: delete last column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 2);
      });
    });
  });
});
