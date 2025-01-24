import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell, Fun, Strings } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TableGridSize } from '@ephox/snooker';
import { Class, Css, Height, Html, Insert, InsertAll, Remove, SelectorExists, SelectorFilter, SelectorFind, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ObjectResizeEvent, TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as TableTestUtils from '../../module/table/TableTestUtils';

type Unit = 'px' | '%';

interface ExpectedUnits {
  tableWidth?: Unit;
  tableHeight?: Unit;
  colWidth?: Unit;
  tdWidth?: Unit;
  tdHeight?: Unit;
  trHeight?: Unit;
}

interface ExpectedValues {
  tableWidth?: number;
  tableHeight?: number;
  colWidths?: number[];
  tdWidths?: number[];
  tdHeights?: number[];
  trHeights?: number[];
}

interface TableMeasurements {
  readonly tableWidth: TableTestUtils.SizeData;
  readonly tableHeight: TableTestUtils.SizeData;
  readonly colWidths: TableTestUtils.SizeData[];
  readonly trHeights: TableTestUtils.SizeData[];
  readonly cellWidths: TableTestUtils.SizeData[];
  readonly cellHeights: TableTestUtils.SizeData[];
}

interface TableMeasurementsAll {
  readonly table: SugarElement<HTMLTableElement>;
  readonly before: TableMeasurements;
  readonly after: TableMeasurements;
}

describe('browser.tinymce.models.dom.table.ResizeTableTest', () => {
  const browser = PlatformDetection.detect().browser;
  const lastObjectResizeStartEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const lastObjectResizedEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const pixelDiffThreshold = 3;
  const percentDiffThreshold = 1;
  const defaultCellHeight = browser.isSafari() ? 22 : 22.5; // px
  const defaultCellPadding = 6.4 * 2;
  const defaultCellBorder = (browser.isSafari() ? 0.5 : 1) * 2;
  const editorBodyInternalWidth = 364; // px
  const defaultCellHeightOverall = defaultCellHeight + defaultCellPadding + defaultCellBorder;
  let tableModifiedEvents: Array<EditorEvent<TableModifiedEvent>> = [];

  const pixelTable = '<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>';
  const percentTable = '<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>';
  const responsiveTable = '<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>';
  const responsiveTableWithContent = '<table><colgroup><col><col></colgroup><tbody><tr><td>Content</td><td><br></td></tr></tbody></table>';
  const pixelTableWithRowHeights = '<table style="width: 200px; height: 100px;"><tbody><tr style="height: 100px;"><td style="height: 100px;"></td><td style="height: 100px;"></td></tr></tbody></table>';
  const largeTable = `<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td>
<td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;">
</td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;">
</td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;">
</td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;">
</td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>`;

  const defaultSettings = {
    width: 400,
    height: 300,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  };

  const bindResizeEvents = (editor: Editor) => {
    const objectResizeStart = (e: EditorEvent<ObjectResizeEvent>) => {
      lastObjectResizeStartEvent.set(e);
    };

    const objectResized = (e: EditorEvent<ObjectResizeEvent>) => {
      lastObjectResizedEvent.set(e);
    };

    const tableModified = (e: EditorEvent<TableModifiedEvent>) => {
      tableModifiedEvents.push(e);
    };

    editor.on('ObjectResizeStart', objectResizeStart);
    editor.on('ObjectResized', objectResized);
    editor.on('TableModified', tableModified);

    return () => {
      editor.off('ObjectResizeStart', objectResizeStart);
      editor.off('ObjectResized', objectResized);
      editor.off('TableModified', tableModified);
    };
  };

  const clearEventData = () => {
    lastObjectResizeStartEvent.set(null);
    lastObjectResizedEvent.set(null);
    tableModifiedEvents = [];
  };

  const pResizeWithCornerHandle = (editor: Editor, dx: number = -100, dy: number = -20) => TableTestUtils.pDragHandle(editor, 'se', dx, dy);

  // NOTE: Just get the widths from the first row (this might not be ideal for colspan/rowspan tables)
  const getCellWidths = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
    const size = TableGridSize.getGridSize(table);
    return Arr.range(size.columns, (col) => TableTestUtils.getCellWidth(editor, table, 0, col));
  };

  // NOTE: Just get the heights from the first column (this might not be ideal for colspan/rowspan tables)
  const getCellHeights = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
    const size = TableGridSize.getGridSize(table);
    return Arr.range(size.rows, (row) => TableTestUtils.getCellHeight(editor, table, row, 0));
  };

  const getTrHeights = (editor: Editor, table: SugarElement<HTMLTableElement>) =>
    Arr.map(SelectorFilter.descendants<HTMLTableCellElement>(table, 'tr'), (tr) => TableTestUtils.getHeightData(editor, tr.dom));

  const getColWidths = (editor: Editor, table: SugarElement<HTMLTableElement>) =>
    Arr.map(SelectorFilter.descendants<HTMLTableColElement>(table, 'col'), (col) => TableTestUtils.getWidthData(editor, col.dom));

  const pInsertResizeMeasure = async (editor: Editor, pResize: (editor: Editor) => Promise<void>, insert: (editor: Editor) => SugarElement<HTMLTableElement>): Promise<TableMeasurementsAll> => {
    const unbindEvents = bindResizeEvents(editor);

    const table = insert(editor);

    // After TINY-11082 caret is placed after the table when pasting/inserting. For the purpose of this tests we need to place it back inside to show the resize handles
    editor.selection.setCursorLocation(editor.dom.select('td:last-of-type')[0], 0);

    const tableWidthBefore = TableTestUtils.getWidthData(editor, table.dom);
    const tableHeightBefore = TableTestUtils.getHeightData(editor, table.dom);
    const colWidthsBefore = getColWidths(editor, table);
    const cellWidthsBefore = getCellWidths(editor, table);
    const cellHeightsBefore = getCellHeights(editor, table);
    const trHeightsBefore = getTrHeights(editor, table);

    Mouse.trueClick(table);
    await pResize(editor);

    const tableWidthAfter = TableTestUtils.getWidthData(editor, table.dom);
    const tableHeightAfter = TableTestUtils.getHeightData(editor, table.dom);
    const colWidthsAfter = getColWidths(editor, table);
    const cellWidthsAfter = getCellWidths(editor, table);
    const cellHeightsAfter = getCellHeights(editor, table);
    const trHeightsAfter = getTrHeights(editor, table);

    unbindEvents();

    return {
      table,
      before: {
        tableWidth: tableWidthBefore,
        tableHeight: tableHeightBefore,
        colWidths: colWidthsBefore,
        trHeights: trHeightsBefore,
        cellWidths: cellWidthsBefore,
        cellHeights: cellHeightsBefore
      },
      after: {
        tableWidth: tableWidthAfter,
        tableHeight: tableHeightAfter,
        colWidths: colWidthsAfter,
        trHeights: trHeightsAfter,
        cellWidths: cellWidthsAfter,
        cellHeights: cellHeightsAfter
      }
    };
  };

  const assertRawSizes = (type: 'before' | 'after') => (measurements: TableMeasurements, expected: ExpectedValues) => {
    assert.approximately(measurements.tableHeight.raw ?? 0, expected.tableHeight ?? 0, measurements.tableHeight.isPercent ? percentDiffThreshold : pixelDiffThreshold, `table height (${type})`);
    assert.approximately(measurements.tableWidth.raw ?? 0, expected.tableWidth ?? 0, measurements.tableWidth.isPercent ? percentDiffThreshold : pixelDiffThreshold, `table width (${type})`);
    Arr.each(measurements.colWidths, (data, idx) => {
      const expectedValue = (expected.colWidths ?? [])[idx] || 0;
      assert.approximately(data.raw ?? 0, expectedValue, data.isPercent ? percentDiffThreshold : pixelDiffThreshold, `col width (${idx}) (${type})`);
    });
    Arr.each(measurements.trHeights, (data, idx) => {
      const expectedValue = (expected.trHeights ?? [])[idx] ?? 0;
      assert.approximately(data.raw ?? 0, expectedValue, data.isPercent ? percentDiffThreshold : pixelDiffThreshold, `tr height (${idx}) (${type})`);
    });
    Arr.each(measurements.cellWidths, (data, idx) => {
      const expectedValue = (expected.tdWidths ?? [])[idx] ?? 0;
      assert.approximately(data.raw ?? 0, expectedValue, data.isPercent ? percentDiffThreshold : pixelDiffThreshold, `td width (${idx}) (${type})`);
    });
    Arr.each(measurements.cellHeights, (data, idx) => {
      const expectedValue = (expected.tdHeights ?? [])[idx] ?? 0;
      assert.approximately(data.raw ?? 0, expectedValue, data.isPercent ? percentDiffThreshold : pixelDiffThreshold, `td height (${idx}) (${type})`);
    });
  };

  const assertRawSizesBeforeResize = assertRawSizes('before');
  const assertRawSizesAfterResize = assertRawSizes('after');

  const assertUnits = (type: 'before' | 'after') => (measurements: TableMeasurements, expected: ExpectedUnits) => {
    assert.equal(measurements.tableWidth.unit, expected.tableWidth || null, `table width ${type} resizing`);
    assert.equal(measurements.tableHeight.unit, expected.tableHeight || null, `table height ${type} resizing`);
    Arr.each(measurements.colWidths, (data) => {
      assert.equal(data.unit, expected.colWidth || null, `col width ${type} resizing`);
    });
    Arr.each(measurements.trHeights, (data) => {
      assert.equal(data.unit, expected.trHeight || null, `tr height ${type} resizing`);
    });
    Arr.each(measurements.cellWidths, (data) => {
      assert.equal(data.unit, expected.tdWidth || null, `td width ${type} resizing`);
    });
    Arr.each(measurements.cellHeights, (data) => {
      assert.equal(data.unit, expected.tdHeight || null, `td height ${type} resizing`);
    });
  };

  const assertUnitsBeforeResize = assertUnits('before');
  const assertUnitsAfterResize = assertUnits('after');

  const assertEventData = (state: Cell<EditorEvent<ObjectResizeEvent> | null>, expectedEventName: string) => {
    const event = state.get();
    assert.equal(event?.target.nodeName, 'TABLE', 'Should be table element');
    assert.equal(event?.type, expectedEventName, 'Should be expected resize event');
    assert.typeOf(event?.width, 'number', 'Should have width');
    assert.typeOf(event?.height, 'number', 'Should have height');
    assert.lengthOf(tableModifiedEvents, 1, 'Should have a table modified event');
    assert.isFalse(tableModifiedEvents[0].structure, 'Should not have structure modified');
    assert.isTrue(tableModifiedEvents[0].style, 'Should have style modified');
  };

  const setupElement = (content: string) =>
    () => {
      const div = SugarElement.fromTag('div');
      Html.set(div, content);
      Insert.append(SugarBody.body(), div);

      return {
        element: div,
        teardown: () => {
          Remove.remove(div);
        },
      };
    };

  beforeEach(() => {
    clearEventData();
  });

  context('table_sizing_mode=unset (default config)', () => {
    const hook = TinyHooks.bddSetup<Editor>(defaultSettings, []);

    it('TBA: resize should detect current unit for % table', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, percentTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: '%', tdWidth: '%' });
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, { tableWidth: 100, tdWidths: [ 50, 50 ] });
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((editorBodyInternalWidth - 100) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 50, 50 ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: resize should detect current unit for px table', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
      });
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 100,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 50 - defaultCellPadding - defaultCellBorder, 50 - defaultCellPadding - defaultCellBorder ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-7699: resize a row and verify the output has the correct heights', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const dy = 50;
      const measurements = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'row', 0, 0, dy),
        () => TableTestUtils.insertRaw(editor, pixelTableWithRowHeights)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdHeight: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
        tableHeight: 100,
        trHeights: [ 100 ],
        tdHeights: [ 100 ],
      });
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 200,
        tableHeight: 100 + 50 + defaultCellPadding,
        trHeights: [ 100 + 50 + defaultCellPadding ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('table_sizing_mode="relative"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_sizing_mode: 'relative'
    }, []);

    it('TBA: new tables should default to % and resize should force %', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.makeInsertTable(editor, 5, 2)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: '%', colWidth: '%' });
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', colWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 100,
        colWidths: [ 20, 20, 20, 20, 20 ]
      });
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((editorBodyInternalWidth - 100) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall * 2,
        trHeights: [ defaultCellHeightOverall, defaultCellHeightOverall ],
        colWidths: [ 20, 20, 20, 20, 20 ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, responsiveTable)
      );

      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {});
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 5.5,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 50, 50 ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: force % on px table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
      });
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((200 - 100) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 50, 50 ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('table_sizing_mode="fixed"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_sizing_mode: 'fixed'
    }, []);

    it('TBA: new tables should default to px and resize should force px', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.makeInsertTable(editor, 5, 2)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', colWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', colWidth: 'px' });

      const colWidthBefore = editorBodyInternalWidth / 5;
      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: editorBodyInternalWidth,
        colWidths: [ colWidthBefore, colWidthBefore, colWidthBefore, colWidthBefore, colWidthBefore ]
      });
      const dx = -100;
      const dy = -20;
      const colWidthAfter = colWidthBefore + dy;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: editorBodyInternalWidth + dx,
        tableHeight: defaultCellHeightOverall * 2,
        trHeights: [ defaultCellHeightOverall, defaultCellHeightOverall ],
        colWidths: [ colWidthAfter, colWidthAfter, colWidthAfter, colWidthAfter, colWidthAfter ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force px on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, responsiveTable)
      );

      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

      assertRawSizesBeforeResize(measurements.before, {});
      const tableWidthAfter = 48.5625;
      const tdWidthAfter = (tableWidthAfter / 2) - defaultCellBorder - defaultCellPadding;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: tableWidthAfter,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ tdWidthAfter, tdWidthAfter ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: force px on % table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, percentTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: '%', tdWidth: '%' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

      assertRawSizesBeforeResize(measurements.before, { tableWidth: 100, tdWidths: [ 50, 50 ] });
      const dx = -100;
      const tableWidthAfter = editorBodyInternalWidth + dx;
      const tdWidthAfter = (tableWidthAfter / 2) - defaultCellBorder - defaultCellPadding;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: tableWidthAfter,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall, defaultCellHeightOverall ],
        tdWidths: [ tdWidthAfter, tdWidthAfter ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('table_sizing_mode="responsive"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_sizing_mode: 'responsive'
    }, []);

    it('TINY-6051: new tables should default to no widths and resize should force %', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.makeInsertTable(editor, 5, 2)
      );

      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', colWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {});
      const minColWidth = 13.8;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((minColWidth * 5) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall * 2,
        trHeights: [ defaultCellHeightOverall, defaultCellHeightOverall ],
        colWidths: [ 20, 20, 20, 20, 20 ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, responsiveTable)
      );

      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {});
      const minColWidth = 13.8;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((minColWidth * 2) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 50, 50 ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on px table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(
        editor,
        pResizeWithCornerHandle,
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
      });
      // TODO: The widths on the tds don't seem correct here (most likely existing)
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: ((200 - 100) / editorBodyInternalWidth) * 100,
        tableHeight: defaultCellHeightOverall,
        trHeights: [ defaultCellHeightOverall ],
        tdWidths: [ 35, 35 ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('table_column_resizing="preservetable" and table_sizing_mode="fixed"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'preservetable',
      table_sizing_mode: 'fixed'
    }, []);

    it('TINY-6001: adjusting an inner column should not change the table width', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tdWidth: 'px' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
      });
      const tdWidthBefore = (200.0 / 2) - defaultCellBorder - defaultCellPadding;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 200,
        tdWidths: [ tdWidthBefore + 20, tdWidthBefore - 20 ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    Arr.each([ 'nw', 'ne', 'se', 'sw' ], (origin) => {
      it(`TINY-6242: adjusting the entire table should resize all columns (origin: ${origin})`, async () => {
        const editor = hook.editor();
        editor.setContent('');
        const measurements = await pInsertResizeMeasure(editor,
          () => TableTestUtils.pDragHandle(editor, origin, Strings.endsWith(origin, 'e') ? 20 : -20, 0),
          () => TableTestUtils.insertRaw(editor, pixelTable)
        );

        assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
        assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

        assertRawSizesBeforeResize(measurements.before, {
          tableWidth: 200,
        });
        const tdWidthBefore = (200.0 / 2) - defaultCellBorder - defaultCellPadding;
        assertRawSizesAfterResize(measurements.after, {
          tableWidth: 220,
          tableHeight: defaultCellHeightOverall,
          trHeights: [ defaultCellHeightOverall ],
          tdWidths: [ tdWidthBefore + 10, tdWidthBefore + 10 ]
        });

        assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
        assertEventData(lastObjectResizedEvent, 'objectresized');
      });
    });
  });

  context('table_column_resizing="resizetable" and table_sizing_mode="fixed"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'resizetable',
      table_sizing_mode: 'fixed'
    }, []);

    it('TINY-6001: adjusting an inner column should change the table width', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );

      assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
      assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tdWidth: 'px' });

      assertRawSizesBeforeResize(measurements.before, {
        tableWidth: 200,
      });
      const tdWidthBefore = (200.0 / 2) - defaultCellBorder - defaultCellPadding;
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 220,
        tdWidths: [ tdWidthBefore + 20, tdWidthBefore ]
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    Arr.each([ 'ne', 'se' ], (origin) => {
      it(`TINY-6242: adjusting the entire table with the east corner handles should resize the last column (origin: ${origin})`, async () => {
        const editor = hook.editor();
        editor.setContent('');
        const measurements = await pInsertResizeMeasure(editor,
          () => TableTestUtils.pDragHandle(editor, origin, 20, 0),
          () => TableTestUtils.insertRaw(editor, pixelTable)
        );

        assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
        assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

        assertRawSizesBeforeResize(measurements.before, {
          tableWidth: 200,
        });
        const tdWidthBefore = (200.0 / 2) - defaultCellBorder - defaultCellPadding;
        assertRawSizesAfterResize(measurements.after, {
          tableWidth: 220,
          tableHeight: defaultCellHeightOverall,
          trHeights: [ defaultCellHeightOverall ],
          tdWidths: [ tdWidthBefore, tdWidthBefore + 20 ]
        });

        assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
        assertEventData(lastObjectResizedEvent, 'objectresized');
      });
    });

    Arr.each([ 'nw', 'sw' ], (origin) => {
      it(`TINY-6242: adjusting the entire table with the west corner handles should resize the first column (origin: ${origin})`, async () => {
        const editor = hook.editor();
        editor.setContent('');
        const measurements = await pInsertResizeMeasure(editor,
          () => TableTestUtils.pDragHandle(editor, origin, -20, 0),
          () => TableTestUtils.insertRaw(editor, pixelTable)
        );

        assertUnitsBeforeResize(measurements.before, { tableWidth: 'px' });
        assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', tdWidth: 'px' });

        assertRawSizesBeforeResize(measurements.before, {
          tableWidth: 200,
        });
        const tdWidthBefore = (200.0 / 2) - defaultCellBorder - defaultCellPadding;
        assertRawSizesAfterResize(measurements.after, {
          tableWidth: 220,
          tableHeight: defaultCellHeightOverall,
          trHeights: [ defaultCellHeightOverall ],
          tdWidths: [ tdWidthBefore + 20, tdWidthBefore ]
        });

        assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
        assertEventData(lastObjectResizedEvent, 'objectresized');
      });
    });
  });

  context('table_column_resizing="resizetable" and table_sizing_mode="relative" and table_use_colgroups=false', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'resizetable',
      table_sizing_mode: 'relative',
      table_use_colgroups: false
    }, []);

    Arr.each([ 'ne', 'se' ], (origin) => {
      it(`TINY-6242: adjusting the entire table with the east corner handles should not resize more than the last column width (origin: ${origin})`, async () => {
        const editor = hook.editor();
        editor.setContent('');
        const measurements = await pInsertResizeMeasure(editor,
          () => TableTestUtils.pDragHandle(editor, origin, -250, 0),
          () => TableTestUtils.insertRaw(editor, percentTable)
        );

        assertUnitsBeforeResize(measurements.before, { tableWidth: '%', tdWidth: '%' });
        assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

        assertRawSizesBeforeResize(measurements.before, { tableWidth: 100, tdWidths: [ 50, 50 ] });
        assertRawSizesAfterResize(measurements.after, {
          tableWidth: 53,
          tableHeight: defaultCellHeightOverall,
          trHeights: [ defaultCellHeightOverall ],
          tdWidths: [ 95, 5 ],
        });

        assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
        assertEventData(lastObjectResizedEvent, 'objectresized');
      });
    });

    Arr.each([ 'nw', 'sw' ], (origin) => {
      it(`TINY-6242: adjusting the entire table with the west corner handles should not resize more than the first column width (origin: ${origin})`, async () => {
        const editor = hook.editor();
        editor.setContent('');
        const measurements = await pInsertResizeMeasure(editor,
          () => TableTestUtils.pDragHandle(editor, origin, 250, 0),
          () => TableTestUtils.insertRaw(editor, percentTable)
        );

        assertUnitsBeforeResize(measurements.before, { tableWidth: '%', tdWidth: '%' });
        assertUnitsAfterResize(measurements.after, { tableWidth: '%', tableHeight: 'px', trHeight: 'px', tdWidth: '%' });

        assertRawSizesBeforeResize(measurements.before, { tableWidth: 100, tdWidths: [ 50, 50 ] });
        assertRawSizesAfterResize(measurements.after, {
          tableWidth: 53,
          tableHeight: defaultCellHeightOverall,
          trHeights: [ defaultCellHeightOverall ],
          tdWidths: [ 5, 95 ],
        });

        assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
        assertEventData(lastObjectResizedEvent, 'objectresized');
      });
    });
  });

  context('table_column_resizing="resizetable", table_sizing_mode="responsive" and table_use_colgroups=true', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'resizetable',
      table_use_colgroups: true,
      table_sizing_mode: 'responsive'
    }, []);

    it('TINY-6601: adjusting the entire table should not resize more than the last column width', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 100, 0),
        () => TableTestUtils.makeInsertTable(editor, 2, 2)
      );
      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', colWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {});
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 35,
        colWidths: [ 88.75, 11.25 ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('table_column_resizing="resizetable"', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'resizetable'
    }, []);

    it('TINY-6646: with responsive colgroup table, adjusting an inner column with content', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const measurements = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 100, 0),
        () => TableTestUtils.insertRaw(editor, responsiveTableWithContent)
      );
      assertUnitsBeforeResize(measurements.before, {});
      assertUnitsAfterResize(measurements.after, { tableWidth: '%', colWidth: '%' });

      assertRawSizesBeforeResize(measurements.before, {});
      assertRawSizesAfterResize(measurements.after, {
        tableWidth: 51,
        colWidths: [ 92.25, 7.75 ],
      });

      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });
  });

  context('row resizing', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_sizing_mode: 'fixed'
    }, []);

    const tableWithAllHeights = `<table style="width: 50px; height: 200px;">
    <colgroup><col style="width: 50px;"></colgroup>
    <tbody>
    <tr style="height: 100px;"><td style="height: 100px;"></td></tr>
    <tr style="height: 100px;"><td style="height: 100px;"></td></tr>
    </tbody></table>`;

    const tableWithOnlyTableHeight = `<table style="width: 50px; height: 200px;">
    <colgroup><col style="width: 50px;"></colgroup>
    <tbody>
    <tr><td></td></tr>
    <tr><td></td></tr>
    </tbody></table>`;

    const tableWithNoHeights = `<table style="width: 50px;">
    <colgroup><col style="width: 50px;"></colgroup>
    <tbody>
    <tr><td></td></tr>
    <tr><td></td></tr>
    </tbody></table>`;

    const tableWithHeightOnTableAndTrs = `<table style="width: 50px; height: 200px;">
    <colgroup><col style="width: 50px;"></colgroup>
    <tbody>
    <tr style="height: 100px;"><td></td></tr>
    <tr style="height: 100px;"><td></td></tr>
    </tbody></table>`;

    context('resizing with corner handle', () => {
      Arr.each([ 'nw', 'ne', 'se', 'sw' ], (origin) => {
        it(`TINY-10589: resizing a default table should distribute height across all trs evenly (origin: ${origin})`, async () => {
          const editor = hook.editor();
          editor.setContent('');
          const measurements = await pInsertResizeMeasure(editor,
            () => TableTestUtils.pDragHandle(editor, origin, 0, Strings.startsWith(origin, 's') ? 20 : -20),
            () => TableTestUtils.makeInsertTable(editor, 2, 2)
          );

          assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', colWidth: 'px' });
          assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', trHeight: 'px', colWidth: 'px' });

          const colWidthBefore = editorBodyInternalWidth / 2;
          assertRawSizesBeforeResize(measurements.before, {
            tableWidth: editorBodyInternalWidth,
            colWidths: [ colWidthBefore, colWidthBefore ]
          });
          assertRawSizesAfterResize(measurements.after, {
            tableWidth: editorBodyInternalWidth,
            colWidths: [ colWidthBefore, colWidthBefore ],
            tableHeight: defaultCellHeightOverall * 2 + 20,
            trHeights: [ defaultCellHeightOverall + 10, defaultCellHeightOverall + 10 ],
          });

          assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
          assertEventData(lastObjectResizedEvent, 'objectresized');
        });
      });

      Arr.each([ 'nw', 'ne', 'se', 'sw' ], (origin) => {
        it(`TINY-10589: resizing a table with existing tr heights should resize the correct row (origin: ${origin})`, async () => {
          const editor = hook.editor();
          editor.setContent('');

          const dy = 20;
          const measurements = await pInsertResizeMeasure(editor,
            () => TableTestUtils.pDragHandle(editor, origin, 0, Strings.startsWith(origin, 's') ? dy : -dy),
            () => TableTestUtils.insertRaw(editor, tableWithHeightOnTableAndTrs)
          );

          assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });
          assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

          assertRawSizesBeforeResize(measurements.before, {
            tableWidth: 50,
            colWidths: [ 50 ],
            tableHeight: 200,
            trHeights: [ 100, 100 ]
          });
          const expectedRowToResize = Strings.startsWith(origin, 'n') ? 0 : 1;
          assertRawSizesAfterResize(measurements.after, {
            tableWidth: 50,
            colWidths: [ 50 ],
            tableHeight: 200 + dy,
            trHeights: [ 100 + (expectedRowToResize === 0 ? dy : 0), 100 + (expectedRowToResize === 1 ? dy : 0) ],
          });

          assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
          assertEventData(lastObjectResizedEvent, 'objectresized');
        });
      });

      context('height on table, trs and tds', () => {
        Arr.each([
          { title: 'TINY-10589: resize table larger with se handle and verify only table and trs have heights', corner: 'se', dy: 50 },
          { title: 'TINY-10589: resize table smaller with se handle and verify only table and trs have heights', corner: 'se', dy: -30 },
          { title: 'TINY-10589: resize table larger with sw handle and verify only table and trs have heights', corner: 'sw', dy: 50 },
          { title: 'TINY-10589: resize table smaller with sw handle and verify only table and trs have heights', corner: 'sw', dy: -30 },
          { title: 'TINY-10707: resize table smaller with sw handle and verify only table and trs have heights', corner: 'sw', dy: -30 }
        ], (scenario) => {
          const { title, corner, dy } = scenario;

          it(title, async () => {
            const editor = hook.editor();
            editor.setContent('');
            const measurements = await pInsertResizeMeasure(editor,
              () => TableTestUtils.pDragHandle(editor, corner, 0, dy),
              () => TableTestUtils.insertRaw(editor, tableWithAllHeights)
            );

            assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px', tdHeight: 'px' });
            assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

            assertRawSizesBeforeResize(measurements.before, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200,
              trHeights: [ 100, 100 ],
              tdHeights: [ 100, 100 ],
            });
            assertRawSizesAfterResize(measurements.after, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200 + dy + (defaultCellBorder + defaultCellPadding) * 2,
              trHeights: [ 100 + defaultCellPadding, 100 + dy + defaultCellPadding + defaultCellBorder ],
            });

            assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
            assertEventData(lastObjectResizedEvent, 'objectresized');
          });
        });
      });
    });

    context('reszing with resize bar', () => {
      context('height on table, trs and tds', () => {
        Arr.each([
          { title: 'TINY-10589: resize inner row larger and verify only table and trs have heights', row: 0, dy: 50 },
          { title: 'TINY-10589: resize inner row smaller and verify only table and trs have heights', row: 0, dy: -20 },
          { title: 'TINY-10589: resize last row larger and verify only table and trs have heights', row: 1, dy: 50 },
          { title: 'TINY-10589: resize last row smaller and verify only table and trs have heights', row: 1, dy: -20 },

        ], (scenario) => {
          const { title, row, dy } = scenario;

          it(title, async () => {
            const editor = hook.editor();
            editor.setContent('');
            const measurements = await pInsertResizeMeasure(editor,
              () => TableTestUtils.pDragResizeBar(editor, 'row', row, 0, dy),
              () => TableTestUtils.insertRaw(editor, tableWithAllHeights)
            );

            assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px', tdHeight: 'px' });
            assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

            assertRawSizesBeforeResize(measurements.before, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200,
              trHeights: [ 100, 100 ],
              tdHeights: [ 100, 100 ],
            });
            assertRawSizesAfterResize(measurements.after, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200 + dy + (defaultCellBorder + defaultCellPadding) * 2,
              trHeights: [ 100 + (row === 0 ? dy : 0) + defaultCellPadding, 100 + (row === 1 ? dy : 0) + defaultCellPadding + defaultCellBorder ],
            });

            assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
            assertEventData(lastObjectResizedEvent, 'objectresized');
          });
        });
      });

      context('no heights', () => {
        Arr.each([
          { title: 'TINY-10589: resize inner row larger and verify only table and trs have heights', row: 0, dy: 50 },
          { title: 'TINY-10589: resize inner row smaller and verify only table and trs have heights', row: 0, dy: -20 },
          { title: 'TINY-10589: resize last row larger and verify only table and trs have heights', row: 1, dy: 50 },
          { title: 'TINY-10589: resize last row smaller and verify only table and trs have heights', row: 1, dy: -20 },

        ], (scenario) => {
          const { title, row, dy } = scenario;

          it(title, async () => {
            const editor = hook.editor();
            editor.setContent('');
            const measurements = await pInsertResizeMeasure(editor,
              () => TableTestUtils.pDragResizeBar(editor, 'row', row, 0, dy),
              () => TableTestUtils.insertRaw(editor, tableWithNoHeights)
            );

            assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', colWidth: 'px' });
            assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

            assertRawSizesBeforeResize(measurements.before, {
              tableWidth: 50,
              colWidths: [ 50 ],
            });
            assertRawSizesAfterResize(measurements.after, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: defaultCellHeightOverall * 2 + dy,
              trHeights: [ defaultCellHeightOverall + (row === 0 ? dy : 0), defaultCellHeightOverall + (row === 1 ? dy : 0) ],
            });

            assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
            assertEventData(lastObjectResizedEvent, 'objectresized');
          });
        });
      });

      context('height only on table', () => {
        Arr.each([
          { title: 'TINY-10589: resize inner row larger and verify only table and trs have heights', row: 0, dy: 50 },
          { title: 'TINY-10589: resize inner row smaller and verify only table and trs have heights', row: 0, dy: -20 },
          { title: 'TINY-10589: resize last row larger and verify only table and trs have heights', row: 1, dy: 50 },
          { title: 'TINY-10589: resize last row smaller and verify only table and trs have heights', row: 1, dy: -20 },

        ], (scenario) => {
          const { title, row, dy } = scenario;

          it(title, async () => {
            const editor = hook.editor();
            editor.setContent('');
            const measurements = await pInsertResizeMeasure(editor,
              () => TableTestUtils.pDragResizeBar(editor, 'row', row, 0, dy),
              () => TableTestUtils.insertRaw(editor, tableWithOnlyTableHeight)
            );

            assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px' });
            assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

            assertRawSizesBeforeResize(measurements.before, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200,
            });
            assertRawSizesAfterResize(measurements.after, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200 + dy,
              trHeights: [ 100 + (row === 0 ? dy : 0), 100 + (row === 1 ? dy : 0) ],
            });

            assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
            assertEventData(lastObjectResizedEvent, 'objectresized');
          });
        });
      });

      context('height only on table and trs', () => {
        Arr.each([
          { title: 'TINY-10589: resize inner row larger and verify only table and trs have heights', row: 0, dy: 50 },
          { title: 'TINY-10589: resize inner row smaller and verify only table and trs have heights', row: 0, dy: -20 },
          { title: 'TINY-10589: resize last row larger and verify only table and trs have heights', row: 1, dy: 50 },
          { title: 'TINY-10589: resize last row smaller and verify only table and trs have heights', row: 1, dy: -20 },

        ], (scenario) => {
          const { title, row, dy } = scenario;

          it(title, async () => {
            const editor = hook.editor();
            editor.setContent('');
            const measurements = await pInsertResizeMeasure(editor,
              () => TableTestUtils.pDragResizeBar(editor, 'row', row, 0, dy),
              () => TableTestUtils.insertRaw(editor, tableWithHeightOnTableAndTrs)
            );

            assertUnitsBeforeResize(measurements.before, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });
            assertUnitsAfterResize(measurements.after, { tableWidth: 'px', tableHeight: 'px', colWidth: 'px', trHeight: 'px' });

            assertRawSizesBeforeResize(measurements.before, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200,
              trHeights: [ 100, 100 ]
            });
            assertRawSizesAfterResize(measurements.after, {
              tableWidth: 50,
              colWidths: [ 50 ],
              tableHeight: 200 + dy,
              trHeights: [ 100 + (row === 0 ? dy : 0), 100 + (row === 1 ? dy : 0) ],
            });

            assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
            assertEventData(lastObjectResizedEvent, 'objectresized');
          });
        });
      });
    });
  });

  context('When the editor is started with a table', () => {
    const hook = TinyHooks.bddSetupFromElement(defaultSettings, setupElement('<table><tbody><tr><td>A</td></tr></tbody></table>'));

    it('TINY-9748: The table should not be given resize handles', () => {
      const editor = hook.editor();
      assert.isFalse(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init');
    });
  });

  const hoverOnElement = (editor: Editor, selector: string) => {
    const itemInBody = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
    Mouse.mouseOver(itemInBody);
  };

  const hoverOnTable = async (editor: Editor, table: HTMLTableElement, rowOrCol: 'row' | 'column', index: number) => {
    const docElem = TinyDom.documentElement(editor);
    // Need to mouse over the table to trigger the 'resizebar' divs to appear in the dom
    const td = UiFinder.findIn(SugarElement.fromDom(table), 'td').getOrDie();
    Mouse.mouseOver(td);

    await Waiter.pTryUntil('wait for resize bars',
      () => UiFinder.findIn(docElem, `div[data-${rowOrCol}='${index}']`).getOrDie()
    );
  };

  const getResizeBarsContainer = (editor: Editor) => SelectorFind.sibling(TinyDom.body(editor), '[id^=resizer-container]').getOrDie('Resizer container element not found as a sibling to the editor body');

  const assertContainerAndBarsExist = (editor: Editor) => {
    const container = getResizeBarsContainer(editor);
    const resizeBars = Traverse.children(container);
    assert.isAbove(resizeBars.length, 0, 'Should have resize bars within the container');
  };

  const assertBarsNotExistInContainer = (editor: Editor) => {
    const container = getResizeBarsContainer(editor);
    const resizeBars = Traverse.children(container);
    assert.equal(resizeBars.length, 0, 'Resize bars should not exist in the container');
  };

  const assertResizerPosition = (editor: Editor, table: HTMLTableElement) => {
    const container = getResizeBarsContainer(editor);
    const containerRect = container.dom.getBoundingClientRect();

    Arr.each(table.rows, (row: HTMLTableRowElement, rowIndex: number) => {
      const resizer = SelectorFind.descendant<HTMLElement>(container, `.ephox-snooker-resizer-rows[data-row="${rowIndex}"]`).getOrDie('Resizer not found');
      const rowRect = row.getBoundingClientRect();
      const resizerHeight = Height.get(resizer);

      const borderSpacing = parseFloat(Css.get(SugarElement.fromDom(table), 'border-spacing'));
      const isLastRow = rowIndex === table.rows.length - 1;

      const distanceFromBottom = containerRect.bottom - rowRect.bottom;
      const expectedTop = -(distanceFromBottom + resizerHeight / 2 - (isLastRow ? 0 : borderSpacing));

      const actualResizerTop = parseFloat(Strings.removeTrailing(Css.get(resizer, 'top'), 'px'));
      assert.approximately(actualResizerTop, expectedTop, 2, `Resizer position mismatch for row ${rowIndex} - Expected: ${expectedTop}, Actual: ${actualResizerTop}`);
    });
  };

  context('Location of table resize bar handler container', () => {
    context('iframe mode', () => {
      const hook = TinyHooks.bddSetup<Editor>(defaultSettings, [], true);

      it('TINY-11215: The resize bar handler container should be inside the iframe', async () => {
        const editor = hook.editor();
        TableTestUtils.insertRaw(editor, percentTable);
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        const resizerBars = SelectorFilter.siblings(TinyDom.body(editor), '.ephox-snooker-resizer-bar');
        assert.isAbove(resizerBars.length, 0, 'Resizer bars should exist');
      });
    });

    context('inline mode', () => {
      const hook = TinyHooks.bddSetupFromElement<Editor>({ ...defaultSettings, inline: true, plugins: 'table', ui_mode: 'split' }, () => {
        const div = SugarElement.fromTag('div');
        Html.set(div, percentTable);
        Insert.append(SugarBody.body(), div);

        return {
          element: div,
          teardown: () => {
            Remove.remove(div);
          },
        };
      }, [], true);

      it('TINY-11215: The resize bar handler container should be adjacent to the editor body', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
      });

      it('TINY-11215: The resize bar wires should be at the correct location', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertResizerPosition(editor, table);
      });

      it('TINY-11215: The resize bar wires should be at the correct location with resized rows', async () => {
        const editor = hook.editor();
        editor.setContent(`<table style="border-collapse: collapse; width: 100%; height: 178.586px;" border="1"><colgroup><col style="width: 33.3112%;"><col style="width: 33.3112%;"><col style="width: 33.3112%;"></colgroup>
        <tbody><tr style="height: 36.1953px;"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr style="height: 56.1953px;">
        <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        <tr style="height: 86.1953px;"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`);
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertResizerPosition(editor, table);
      });
    });

    context('inline mode with scrollable container', () => {
      const hook = TinyHooks.bddSetupFromElement<Editor>({ ...defaultSettings, inline: true, plugins: 'table', ui_mode: 'split' }, () => {
        const div = SugarElement.fromTag('div');
        Css.setAll(div, {
          display: 'flex',
	        flex: '1 1 0%',
          position: 'relative',
          height: `${500}px`,
        });

        const reviewPane = SugarElement.fromTag('div');
        Css.setAll(reviewPane, {
          'border': '1px solid #CCCCCC',
          'box-sizing': 'border-box',
          'overflow': 'auto',
          'margin': '0px 5px',
          'padding': '2px',
          'flex': '1 1 0%'
        });
        Class.add(reviewPane, 'scrollable');

        const reviewPane2 = SugarElement.fromHtml(`<div>${Arr.range(1000, Fun.constant('a')).join(' ')}</div>`);
        Css.setAll(reviewPane2, {
          'border': '1px solid #CCCCCC',
          'box-sizing': 'border-box',
          'overflow': 'auto',
          'margin': '0px 5px',
          'padding': '2px',
          'flex': '1 1 0%'
        });

        InsertAll.append(div, [ reviewPane, reviewPane2 ]);

        const editor = SugarElement.fromTag('div');
        const paragraph = SugarElement.fromTag('p');
        Html.set(paragraph, `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled`
          + `it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, ` +
          `remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages` +
          `, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`);
        const table = SugarElement.fromHtml(largeTable);
        InsertAll.append(editor, [ paragraph, table ]);

        InsertAll.append(reviewPane, [ editor, SugarElement.fromHtml(`<div>${Arr.range(1000, Fun.constant('a')).join(' ')}</div>`) ]);
        Insert.append(SugarBody.body(), div);

        return {
          element: editor,
          teardown: () => Remove.remove(div)
        };
      }, [], true);

      it('TINY-11215: The resize bar handler container should be adjacent to the editor body', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
      });

      it('TINY-11215: Resize bar handler should render at the correct location, close to the bottom of tr', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
        assertResizerPosition(editor, table);
      });

      it('TINY-11215: Table resize wires should still be attached when scrolled', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
        const scrollable = SelectorFind.descendant(SugarBody.body(), '.scrollable').getOrDie();
        scrollable.dom.scrollBy(0, scrollable.dom.scrollHeight / 2);
        assertResizerPosition(editor, table);
        await hoverOnTable(editor, table, 'row', 0);
      });

      it('TINY-11215: Hovering non table element should remove the table resize bar container', async () => {
        const editor = hook.editor();
        editor.resetContent();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
        hoverOnElement(editor, 'p');
        assertBarsNotExistInContainer(editor);
      });

      it('TINY-11215: Table resize wires should still be attached when scrolling with multiple tables', async () => {
        const editor = hook.editor();
        editor.insertContent(largeTable);

        const scrollable = SelectorFind.descendant(SugarBody.body(), '.scrollable').getOrDie();
        scrollable.dom.scrollTo(0, 0);

        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertContainerAndBarsExist(editor);
        assertResizerPosition(editor, table);

        scrollable.dom.scrollTo(0, scrollable.dom.scrollHeight / 6);
        assertResizerPosition(editor, table);

        const table2 = editor.dom.select('table')[1];
        await hoverOnTable(editor, table2, 'row', 0);
        assertResizerPosition(editor, table2);

        scrollable.dom.scrollTo(0, scrollable.dom.scrollHeight / 2);
        assertResizerPosition(editor, table2);

        scrollable.dom.scrollTo(0, scrollable.dom.scrollHeight / 4);
        assertResizerPosition(editor, table2);
      });
    });
  });
});
