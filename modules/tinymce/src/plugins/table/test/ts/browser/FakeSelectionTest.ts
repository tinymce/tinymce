import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { assertSelectedCells, selectWithMouse } from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.FakeSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const simpleTable =
  '<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>';

  const simpleColgroupTable =
  '<table><colgroup><col /><col /></colgroup><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>';

  const getCells = (table: SugarElement<HTMLTableElement>, selector: string = 'td,th'): SugarElement<HTMLTableCellElement>[] =>
    SelectorFilter.descendants(table, selector);

  const assertTableSelection = (editor: Editor, tableHtml: string, selectCells: [ string, string ], cellContents: string[]) => {
    editor.setContent(tableHtml);

    const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Could not find table');
    const cells = getCells(table);
    const startTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[0]).getOrDie('Could not find start TD');
    const endTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[1]).getOrDie('Could not find end TD');

    selectWithMouse(startTd, endTd);
    assertSelectedCells(editor, cellContents, Html.get);
  };

  const assertSelectionContent = (editor: Editor, expectedHtml: string) => {
    Assertions.assertHtml('Should be expected content', expectedHtml, editor.selection.getContent());
  };

  it('TBA: select row', () => assertTableSelection(
    hook.editor(),
    simpleTable,
    [ '1', '2' ],
    [ '1', '2' ]
  ));

  it('TBA: select row - colgroup', () => assertTableSelection(
    hook.editor(),
    simpleColgroupTable,
    [ '1', '2' ],
    [ '1', '2' ]
  ));

  it('TBA: select column', () => assertTableSelection(
    hook.editor(),
    simpleTable,
    [ '1', '3' ],
    [ '1', '3' ]
  ));

  it('TBA: select column - colgroup', () => assertTableSelection(
    hook.editor(),
    simpleColgroupTable,
    [ '1', '3' ],
    [ '1', '3' ]
  ));

  it('TBA: select whole table', () => assertTableSelection(
    hook.editor(),
    simpleTable,
    [ '1', '4' ],
    [ '1', '2', '3', '4' ]
  ));

  it('TBA: select whole table - colgroup', () => assertTableSelection(
    hook.editor(),
    simpleColgroupTable,
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
