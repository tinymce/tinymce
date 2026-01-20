import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.DefaultTableHeaderTest', () => {

  const createTableWithHeaderStructure = (rows: number, cols: number, headerRows: number, headerCols: number) => {
    return ApproxStructure.build((s, str) => {
      const style = {
        width: str.contains('%')
      };

      return s.element('table', {
        attrs: { border: str.is('1') },
        styles: { 'border-collapse': str.is('collapse') },
        children: [
          s.zeroOrMore(s.element('thead', {
            children: Arr.range(headerRows, () =>
              s.element('tr', {
                children: Arr.range(cols, (colIndex) =>
                  s.element(colIndex < headerCols ? 'th' : 'td', {
                    styles: style,
                    children: [
                      s.element('br', {})
                    ]
                  })
                )
              })
            )
          })),
          s.zeroOrOne(s.element('tbody', {
            children: Arr.range((rows - headerRows), () =>
              s.element('tr', {
                children: Arr.range(cols, (colIndex) =>
                  s.element(colIndex < headerCols ? 'th' : 'td', {
                    styles: style,
                    children: [
                      s.element('br', {})
                    ]
                  })
                )
              })
            )
          }))
        ]
      });
    });
  };

  Arr.each([
    { label: 'Single header row', headerRows: 1, headerCols: 0 },
    { label: 'Single header col', headerRows: 0, headerCols: 1 },
    { label: 'Single header row and col', headerRows: 1, headerCols: 1 },
    { label: 'Multiple header rows', headerRows: 2, headerCols: 0 },
    { label: 'Multiple header cols', headerRows: 0, headerCols: 2 },
    { label: 'Multiple header rows and cols', headerRows: 2, headerCols: 2 },
  ], ({ label, headerRows, headerCols }) => {
    context(label, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        table_default_header_rows: headerRows,
        table_default_header_cols: headerCols,
        table_header_type: 'section', // Current default value,
        table_use_colgroups: false
      }, []);

      it(`TINY-13391: Insert 2x2 table with default header`, () => {
        const editor = hook.editor();
        TableTestUtils.insertTable(editor, { rows: 2, columns: 2 });
        TableTestUtils.assertTableStructure(editor, createTableWithHeaderStructure(2, 2, headerRows, headerCols));
      });
    });
  });
});

