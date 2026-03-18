import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import type { TableHeaderType } from 'tinymce/models/dom/table/api/Options';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.DefaultTableHeaderTest', () => {
  const headerTypes: TableHeaderType[] = [ 'section', 'sectionCells', 'cells' ];

  context(`Insert table with default header rows and columns`, () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_use_colgroups: false
    }, []);

    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('');
    });

    Arr.each(headerTypes, (headerType) => {
      for (let headerRows = 0; headerRows < 3; headerRows++) {
        for (let headerCols = 0; headerCols < 3; headerCols++) {
          it(`TINY-13391: Insert 5x5 table with ${headerRows} header rows, ${headerCols} header cols with ${headerType}`, () => {
            const editor = hook.editor();
            editor.options.set('table_default_header_rows', headerRows);
            editor.options.set('table_default_header_cols', headerCols);
            editor.options.set('table_header_type', headerType);
            TableTestUtils.insertTable(editor, { rows: 5, columns: 5 });
            TableTestUtils.assertTableStructureWithSizes(editor, 5, 5, '%', 100, [], false, { headerRows, headerCols }, headerType);
          });
        }
      }
    });
  });
});

