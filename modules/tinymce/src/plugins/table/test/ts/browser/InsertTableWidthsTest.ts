import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { insertTable, getWidths } from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.InsertTableWidthsTest', () => {
  Arr.each([ 'fixed', 'relative' ], (mode) => {
    context(`table_sizing_mode: ${mode}`, () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        plugins: 'table',
        table_sizing_mode: mode,
        width: 800,
        height: 400,
        base_url: '/project/tinymce/js/tinymce'
      }, [ Plugin, Theme ]);

      beforeEach(() => {
        hook.editor().setContent('');
      });

      const assertTableWidth = (label: string, editor: Editor, table: HTMLTableElement, expectedWidth: number, diff: number = 1) => {
        const widths = getWidths(editor, table);
        assert.approximately(widths.px, expectedWidth, diff, label);
      };

      const testTableSize = (mode: string, expectedWidth: number, styles: Record<string, string> = {}) => () => {
        const editor = hook.editor();
        Css.setAll(TinyDom.body(editor), styles);

        // Insert into the body
        insertTable(editor, { rows: 3, columns: 3 });
        // Insert into the first cell of the table
        insertTable(editor, { rows: 2, columns: 2 });

        const tables = editor.dom.select('table');
        assertTableWidth('Outer table', editor, tables[0], expectedWidth);
        assertTableWidth('Inner table', editor, tables[1], expectedWidth / 3 - 12, 5); // 12px is the cell padding

        Obj.each(styles, (_, name) => Css.remove(TinyDom.body(editor), name));
      };

      it('TINY-7991: with default styles', testTableSize(mode, 766));

      Arr.each([ 'border-box', 'content-box' ], (boxSizing) => {
        context(`box-sizing: ${boxSizing}`, () => {
          it('TINY-7991: with only box-sizing', testTableSize(mode, 766, { 'box-sizing': boxSizing }));
          it('TINY-7991: with margins', testTableSize(mode, 738, { 'box-sizing': boxSizing, 'margin': '30px' }));
          it('TINY-7991: with padding', testTableSize(mode, 726, { 'box-sizing': boxSizing, 'padding': '20px' }));
          it('TINY-7991: with borders', testTableSize(mode, 756, { 'box-sizing': boxSizing, 'border': '5px black solid' }));
        });
      });
    });
  });
});
