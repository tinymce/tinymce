import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.NewCellRowEventsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TBA: Table NewCell/NewRow events', () => {
    const editor = hook.editor();
    const cells: HTMLTableCellElement[] = [];
    const rows: HTMLTableRowElement[] = [];
    let counter = 0;

    editor.on('NewCell', (e) => {
      cells.push(e.node);
      e.node.setAttribute('data-counter', '' + counter++);
    });

    editor.on('NewRow', (e) => {
      rows.push(e.node);
      e.node.setAttribute('data-counter', '' + counter++);
    });

    TableTestUtils.insertTable(editor, { rows: 3, columns: 2 });

    assert.lengthOf(cells, 6);
    assert.lengthOf(rows, 3);

    assert.equal(cells[cells.length - 1].getAttribute('data-counter'), '8');
    assert.equal(rows[rows.length - 1].getAttribute('data-counter'), '6');
  });
});
