import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.GridSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const assertTableSelection = (editor: Editor, tableHtml: string, selectCells: string[], cellContents: string[]) => {
    const selectRangeXY = (table: HTMLTableElement, startTd: HTMLTableCellElement, endTd: HTMLTableCellElement) => {
      editor.fire('mousedown', { target: startTd, button: 0 } as unknown as MouseEvent);
      editor.fire('mouseover', { target: endTd, button: 0 } as unknown as MouseEvent);
      editor.fire('mouseup', { target: endTd, button: 0 } as unknown as MouseEvent);
    };

    const getCells = (table: HTMLTableElement) => editor.$(table).find('td').toArray();

    const getSelectedCells = (table: HTMLTableElement) =>
      editor.$(table).find<HTMLTableCellElement>('td[data-mce-selected]').toArray();

    editor.setContent(tableHtml);

    const table = editor.$<HTMLTableElement>('table')[0];
    const cells = getCells(table);

    const startTd = Tools.grep(cells, (elm) => {
      return elm.innerHTML === selectCells[0];
    })[0];

    const endTd = Tools.grep(cells, (elm) => {
      return elm.innerHTML === selectCells[1];
    })[0];

    selectRangeXY(table, startTd, endTd);

    const selection = Tools.map(getSelectedCells(table), (elm) => {
      return elm.innerHTML;
    });

    assert.deepEqual(selection, cellContents);
  };

  const assertSelectionContent = (editor: Editor, expectedHtml: string) => {
    Assertions.assertHtml('Should be expected content', expectedHtml, editor.selection.getContent());
  };

  it('TBA: select row', () => assertTableSelection(
    hook.editor(),
    '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
    [ '1', '2' ],
    [ '1', '2' ]
  ));

  it('TBA: select column', () => assertTableSelection(
    hook.editor(),
    '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
    [ '1', '3' ],
    [ '1', '3' ]
  ));

  it('TBA: select whole table', () => assertTableSelection(
    hook.editor(),
    '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
    [ '1', '4' ],
    [ '1', '2', '3', '4' ]
  ));

  it('TBA: select whole table with colspan and rowspan', () => assertTableSelection(
    hook.editor(),
    '<table><tr><td colspan="2" rowspan="2">1</td><td>3</td></tr><tr><td>6</td></tr></table>',
    [ '1', '6' ],
    [ '1', '3', '6' ]
  ));

  it('TBA: select all except first column with overlapping colspan and rowspan', () => assertTableSelection(
    hook.editor(),
    '<table>' +
    '<tr><td>1</td><td>2</td><td>3</td></tr>' +
    '<tr><td colspan="2" rowspan="2">4</td><td>5</td></tr>' +
    '<tr><td>6</td></tr>' +
    '</table>',
    [ '2', '6' ],
    [ '2', '3', '4', '5', '6' ]
  ));

  it('TBA: Extracted selection contents should be without internal attributes', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td data-mce-selected="1">a</td><td>b</td></tr><tr><td data-mce-selected="1">c</td><td>d</td></tr></table>', { format: 'raw' });
    assertSelectionContent(editor, '<table><tbody><tr><td>a</td></tr><tr><td>c</td></tr></tbody></table>');
  });
});
