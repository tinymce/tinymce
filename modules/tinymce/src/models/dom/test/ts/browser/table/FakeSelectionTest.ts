import { Assertions, FocusTools, Keys, Mouse, UiFinder } from '@ephox/agar';
import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Attribute, Focus, Html, Insert, Remove, SelectorFilter, SelectorFind, SugarBody, SugarDocument, SugarElement, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableSelectionChangeEvent } from 'tinymce/models/dom/table/api/Events';

import * as TableTestUtils from '../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.FakeSelectionTest', () => {
  let tableSelectionChangeEvents: Array<EditorEvent<TableSelectionChangeEvent>> = [];
  let tableSelectionClearEvents: Array<EditorEvent<void>> = [];

  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableSelectionChange', (e) => tableSelectionChangeEvents.push(e));
      editor.on('TableSelectionClear', (e) => tableSelectionClearEvents.push(e));
    }
  }, []);

  afterEach(() => {
    tableSelectionChangeEvents = [];
    tableSelectionClearEvents = [];
  });

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

    TableTestUtils.selectWithMouse(startTd, endTd);
  };

  const assertTableSelectionChangeEvent = (editor: Editor, event: EditorEvent<TableSelectionChangeEvent>) => {
    const cells = Arr.map(TableTestUtils.getSelectedCells(editor), (cell) => cell.dom);
    const start = cells[0];
    const finish = cells[cells.length - 1];

    assert.strictEqual(event.type, 'tableselectionchange');
    assert.strictEqual(event.start, start, 'start');
    assert.strictEqual(event.finish, finish, 'finish');
    assert.deepStrictEqual(event.cells, cells, 'cells');
    assert.isNotEmpty(event.otherCells?.downOrRightCells, 'other cells (down or right)');
    assert.isNotEmpty(event.otherCells?.upOrLeftCells, 'other cells (up or left)');
  };

  const assertTableSelection = (editor: Editor, tableHtml: string, selectCells: [ string, string ], cellContents: string[]) => {
    editor.setContent(tableHtml);
    selectCellsWithMouse(editor, selectCells);
    TableTestUtils.assertSelectedCells(editor, cellContents, Html.get);

    if (cellContents.length > 0 ) {
      assert.lengthOf(tableSelectionChangeEvents, 1);
      assertTableSelectionChangeEvent(editor, tableSelectionChangeEvents[0]);
      assert.isNotEmpty(tableSelectionClearEvents);
    } else {
      assert.isEmpty(tableSelectionChangeEvents);
      assert.isNotEmpty(tableSelectionClearEvents);
    }
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
    editor.setContent('<table><tbody><tr><td contenteditable="false"><p contenteditable="true">1</p></td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>');

    // Check the CEF cell is not annotated when the contenteditable="true" child is selected
    const editablePara = SelectorFind.descendant(TinyDom.body(editor), 'p[contenteditable="true"]').getOrDie('Could not find paragraph');
    TableTestUtils.selectWithMouse(editablePara, editablePara);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 0,
      'p[data-mce-selected="1"]': 0
    });

    // Check the CEF cell is annotated if the cell itself is selected
    const noneditableCell = SelectorFind.descendant(TinyDom.body(editor), 'td[contenteditable="false"]').getOrDie('Could not find cell');
    TableTestUtils.selectWithMouse(noneditableCell, noneditableCell);
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
    TableTestUtils.assertSelectedCells(editor, [ '1', '2' ], Html.get);
    TinyAssertions.assertContentPresence(editor, {
      'td[contenteditable="false"][data-mce-first-selected="1"]:not([data-mce-last-selected="1"])': 1,
      'td:not([contenteditable="false"][data-mce-first-selected="1"])[data-mce-last-selected="1"]': 1
    });
  });

  it('TINY-8053: "selected" attributes are removed from CEF cell when unselected via mouse', () => {
    const editor = hook.editor();

    assertTableSelection(
      editor,
      '<table><tbody><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
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
      '<table><tbody><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>',
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

  context('Focusing on noneditable cell', () => {
    before(() => {
      const fakeButton = SugarElement.fromTag('button');
      const body = SugarBody.body();
      Attribute.set(fakeButton, 'id', 'button1');
      Insert.append(fakeButton, SugarElement.fromText('Button 1'));
      Insert.append(body, fakeButton);
    });

    after(() => SelectorFind.child(SugarBody.body(), '#button1').each(Remove.remove));

    const pShiftFocusOutsideEditor = async (button: SugarElement<HTMLButtonElement>) => {
      Mouse.mouseDown(button, { button: 0 });
      Mouse.mouseUp(button, { button: 0 });
      Focus.focus(button);
      await FocusTools.pTryOnSelector('Wait for focus to be shifted out of the editor', SugarDocument.getDocument(), '#button1');
    };

    const pSelectCellAndAssertSelection = async (editor: Editor, cellSelection: [string, string]) => {
      editor.focus();
      selectCellsWithMouse(editor, cellSelection);
      TinyAssertions.assertContentPresence(editor, {
        'td[contenteditable="false"][data-mce-selected="1"][data-mce-first-selected="1"][data-mce-last-selected="1"]': 1
      });
      const actual = Optional.from(editor.selection.getSel()?.anchorNode).map(SugarElement.fromDom).bind(Traverse.parentElement).getOrDie();
      const expected = UiFinder.findIn(TinyDom.body(editor), '.mce-offscreen-selection').getOrDie();

      Assertions.assertDomEq('Parent of selection anchor node should be offscreen element', expected, actual);
    };

    it('TINY-10127: Selection should still be on the noneditable cell when focus is shifted elsewhere', async () => {
      const editor = hook.editor();
      editor.setContent('<p>test</p><table><tbody><tr><td contenteditable="false">1</td><td>2</td></tr><tr><td contenteditable="false">3</td><td>4</td></tr></tbody></table>');

      const fakeButton = UiFinder.findIn<HTMLButtonElement>(SugarBody.body(), '#button1').getOrDie();
      await pShiftFocusOutsideEditor(fakeButton);
      await pSelectCellAndAssertSelection(editor, [ '1', '1' ]);

      await pShiftFocusOutsideEditor(fakeButton);
      await pSelectCellAndAssertSelection(editor, [ '3', '3' ]);

      await pSelectCellAndAssertSelection(editor, [ '1', '1' ]);
    });
  });

  context('Noneditable root', () => {
    it('TINY-9459: Should not select cells with mouse in a noneditable root', () =>
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        assertTableSelection(
          editor,
          simpleTable,
          [ '1', '2' ],
          []
        );
      })
    );

    it('TINY-9459: Should not select cells with keyboard in a noneditable root', () =>
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>');
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        TinyContentActions.keystroke(editor, Keys.down(), { shiftKey: true });
        TableTestUtils.assertSelectedCells(editor, [], Html.get);
      })
    );
  });
});
