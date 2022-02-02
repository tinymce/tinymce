import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.NewCellRowEventsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Table newcell/newrow events', () => {
    const editor = hook.editor();
    const cells: HTMLTableCellElement[] = [];
    const rows: HTMLTableRowElement[] = [];
    let counter = 0;

    editor.on('newcell', (e) => {
      cells.push(e.node);
      e.node.setAttribute('data-counter', counter++);
    });

    editor.on('newrow', (e) => {
      rows.push(e.node);
      e.node.setAttribute('data-counter', counter++);
    });

    editor.plugins.table.insertTable(2, 3);

    assert.lengthOf(cells, 6);
    assert.lengthOf(rows, 3);

    assert.equal(cells[cells.length - 1].getAttribute('data-counter'), '8');
    assert.equal(rows[rows.length - 1].getAttribute('data-counter'), '6');
  });
});
