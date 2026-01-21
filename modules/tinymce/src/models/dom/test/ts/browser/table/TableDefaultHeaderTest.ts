import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import type { TableHeaderType } from 'tinymce/models/dom/table/api/Options';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.DefaultTableHeaderTest', () => {
  const headerTypes: TableHeaderType[] = [ 'section', 'sectionCells', 'cells' ];

  Arr.each(headerTypes, (headerType) =>
    Arr.range(3, (headerRows) =>
      Arr.range(3, (headerCols) => {
        context(`${headerRows} header rows, ${headerCols} header cols with ${headerType}`, () => {
          const hook = TinyHooks.bddSetup<Editor>({
            base_url: '/project/tinymce/js/tinymce',
            table_default_header_rows: headerRows,
            table_default_header_cols: headerCols,
            table_header_type: headerType,
            table_use_colgroups: false
          }, []);

          it(`TINY-13391: Insert 5x5 table with ${headerRows} header rows, ${headerCols} header cols with ${headerType}`, () => {
            const editor = hook.editor();
            TableTestUtils.insertTable(editor, { rows: 5, columns: 5 });
            TableTestUtils.assertTableStructureWithSizes(editor, 5, 5, '%', 100, [], false, { headerRows, headerCols }, headerType);
          });
        });
      }))
  );
});

