import { Assertions, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

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

  const selectCellsWithMouse = (editor: Editor, selectCells: [ string, string ]) => {
    const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Could not find table');
    const cells = getCells(table);
    const startTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[0]).getOrDie('Could not find start TD');
    const endTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[1]).getOrDie('Could not find end TD');

    selectWithMouse(startTd, endTd);
  };

  const assertTableSelection = (editor: Editor, tableHtml: string, selectCells: [ string, string ], cellContents: string[]) => {
    editor.setContent(tableHtml);
    selectCellsWithMouse(editor, selectCells);
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

  it('TINY-7724: can select single CEF cell', () => {
    const editor = hook.editor();
    assertTableSelection(
      editor,
      '<table><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      [ '1', '1' ],
      [ '1' ]
    );
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('TINY-7724: can select CEF cell and normal cell', () => {
    const editor = hook.editor();
    assertTableSelection(
      editor,
      '<table><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      [ '1', '3' ],
      [ '1', '3' ]
    );
  });

  it('TINY-7724: does not select CEF cell if contenteditable=true child is selected', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td contenteditable="false"><p contenteditable="true">1</p></td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>');

    // Check the CEF cell is not annotated when the contenteditable="true" child is selected
    const editablePara = SelectorFind.descendant(TinyDom.body(editor), 'p[contenteditable="true"]').getOrDie('Could not find paragraph');
    selectWithMouse(editablePara, editablePara);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 0,
      'p[data-mce-selected="1"]': 0
    });
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 0);

    // Check the CEF cell is annotated if the cell itself is selected
    const noneditableCell = SelectorFind.descendant(TinyDom.body(editor), 'td[contenteditable="false"]').getOrDie('Could not find cell');
    selectWithMouse(noneditableCell, noneditableCell);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1,
      'p[data-mce-selected="1"]': 0
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('TINY-7724: does not select CEF cell if contenteditable=false child is selected', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td contenteditable="false"><p contenteditable="false"><strong>1</strong></p></td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>');

    // Check the CEF cell is not annotated when the contenteditable="false" child is selected
    const noneditablePara = SelectorFind.descendant(TinyDom.body(editor), 'p[contenteditable="false"]').getOrDie('Could not find paragraph');
    selectWithMouse(noneditablePara, noneditablePara);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 0,
      'p[data-mce-selected="1"]': 1
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);

    // Check the CEF cell is not annotated when the strong child of contenteditable="false" paragraph is selected
    const strongElm = SelectorFind.descendant(TinyDom.body(editor), 'strong').getOrDie('Could not find strong element');
    selectWithMouse(strongElm, strongElm);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 0,
      'p[data-mce-selected="1"]': 1
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1);

    // Check the CEF cell is annotated if the cell itself is selected
    const noneditableCell = SelectorFind.descendant(TinyDom.body(editor), 'td[contenteditable="false"]').getOrDie('Could not find cell');
    selectWithMouse(noneditableCell, noneditableCell);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1,
      'p[data-mce-selected="1"]': 0
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('TINY-7724: can select other cells from CEF cell selection', () => {
    const editor = hook.editor();
    assertTableSelection(
      hook.editor(),
      '<table><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      [ '1', '1' ],
      [ '1' ]
    );

    TinyContentActions.keystroke(editor, Keys.right(), { shiftKey: true });
    assertSelectedCells(editor, [ '1', '2' ], Html.get);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-first-selected="1"]:not([data-mce-last-selected="1"])': 1,
      'td:not([contenteditable="false"][data-mce-first-selected="1"])[data-mce-last-selected="1"]': 1
    });
  });

  it('TINY-8053: "selected" attributes are removed from CEF cell when unselected via mouse', () => {
    const editor = hook.editor();

    assertTableSelection(
      editor,
      '<table><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      [ '1', '1' ],
      [ '1' ]
    );
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

    selectCellsWithMouse(editor, [ '2', '4' ]);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"]': 0,
      'td[contenteditable="false"][data-mce-first-selected="1"]': 0,
      'td[contenteditable="false"][data-mce-last-selected="1"]': 0
    });
  });

  it('TINY-8053: "selected" attributes are removed from CEF cell when unselected via keyboard', () => {
    const editor = hook.editor();

    assertTableSelection(
      editor,
      '<table><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      [ '1', '1' ],
      [ '1' ]
    );
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1
    });
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

    TinyContentActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"]': 0,
      'td[contenteditable="false"][data-mce-first-selected="1"]': 0,
      'td[contenteditable="false"][data-mce-last-selected="1"]': 0
    });
  });
});
