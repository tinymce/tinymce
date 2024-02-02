import { Mouse } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { TableGridSize } from '@ephox/snooker';
import { Html, Insert, Remove, SelectorExists, SelectorFilter, SugarBody, SugarElement } from '@ephox/sugar';
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
  const lastObjectResizeStartEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const lastObjectResizedEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const pixelDiffThreshold = 3;
  const percentDiffThreshold = 1;
  const defaultCellHeight = 22.5; // px
  const defaultCellPadding = 6.4 * 2;
  const defaultCellBorder = 1 * 2;
  const editorBodyInternalWidth = 364; // px
  const defaultCellHeightOverall = defaultCellHeight + defaultCellPadding + defaultCellBorder;
  let tableModifiedEvents: Array<EditorEvent<TableModifiedEvent>> = [];

  const pixelTable = '<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>';
  const percentTable = '<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>';
  const responsiveTable = '<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>';
  const responsiveTableWithContent = '<table><colgroup><col><col></colgroup><tbody><tr><td>Content</td><td><br></td></tr></tbody></table>';
  const pixelTableWithRowHeights = '<table style="width: 200px; height: 100px;"><tbody><tr style="height: 100px;"><td style="height: 100px;"></td><td style="height: 100px;"></td></tr></tbody></table>';
  // TODO: Consider adding other items as well

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

  // const getCellHeights = (editor: Editor, table: SugarElement<HTMLTableElement>) =>
  //   Arr.map(SelectorFilter.descendants<HTMLTableCellElement>(table, 'td,th'), (cell) => TableTestUtils.getHeightData(editor, cell.dom));

  const getTrHeights = (editor: Editor, table: SugarElement<HTMLTableElement>) =>
    Arr.map(SelectorFilter.descendants<HTMLTableCellElement>(table, 'tr'), (tr) => TableTestUtils.getHeightData(editor, tr.dom));

  const getColWidths = (editor: Editor, table: SugarElement<HTMLTableElement>) =>
    Arr.map(SelectorFilter.descendants<HTMLTableColElement>(table, 'col'), (col) => TableTestUtils.getWidthData(editor, col.dom));

  const pInsertResizeMeasure = async (editor: Editor, pResize: (editor: Editor) => Promise<void>, insert: (editor: Editor) => SugarElement<HTMLTableElement>): Promise<TableMeasurementsAll> => {
    const unbindEvents = bindResizeEvents(editor);

    const table = insert(editor);
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

  // TODO: TODO: Swap to using assertRawSizes
  const assertWidthAfterResize = (width: number | null, measurements: TableMeasurementsAll, approx: boolean = false) => {
    if (approx) {
      assert.approximately(measurements.after.tableWidth.raw ?? 0, width ?? 0, pixelDiffThreshold, `table raw width after resizing is ~${width}`);
    } else {
      assert.equal(measurements.after.tableWidth.raw, width, `table raw width after resizing is ${width}`);
    }
  };

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

    // TODO: Test differnt table height variations
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

      assertRawSizesBeforeResize(measurements.before, { });
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
        // () => {
        //   TableTestUtils.insertRaw(editor, pixelTable);
        //   assert.fail();
        // }
      );
      assertWidthAfterResize(200, measurements);

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

    it('TINY-6242: adjusting the entire table should resize all columns', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragHandle(editor, 'se', 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );
      assertWidthAfterResize(220, widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const firstColWidth = widths.after.cellWidths[0];
      const lastColWidth = widths.after.cellWidths[1];
      // Note: Use 96px as the padding + borders are about 14px which adds up to ~110px per cell
      const rawFirstColWidth = firstColWidth.raw ?? 0;
      assert.approximately(rawFirstColWidth, 96, pixelDiffThreshold, `First column raw width ${rawFirstColWidth + String(firstColWidth.unit)} should be ~96px`);
      assert.equal(firstColWidth.unit, 'px', 'First column unit width');
      const rawLastColWidth = lastColWidth.raw ?? 0;
      assert.approximately(rawLastColWidth, 96, pixelDiffThreshold, `Last column raw width ${rawLastColWidth + String(lastColWidth.unit)} should be ~96px`);
      assert.equal(lastColWidth.unit, 'px', 'Last column unit width');
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
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );
      assertWidthAfterResize(220, widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6242: adjusting the entire table should resize the last column', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragHandle(editor, 'ne', 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );
      assertWidthAfterResize(220, widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const lastColWidth = widths.after.cellWidths[1];
      // Note: Use 106px as the padding + borders are about 14px
      const rawLastColWidth = lastColWidth.raw ?? 0;
      assert.approximately(rawLastColWidth, 106, pixelDiffThreshold, `Last column raw width ${rawLastColWidth + String(lastColWidth.unit)} should be ~106px`);
      assert.equal(lastColWidth.unit, 'px', 'Last column unit width');
      const firstColWidthBefore = widths.before.cellWidths[0];
      const firstColWidthAfter = widths.after.cellWidths[0];
      // Allow for a 1px variation here due to potential rounding issues
      assert.approximately(firstColWidthAfter.px, firstColWidthBefore.px, 1, `First column raw width ${firstColWidthBefore.px + String(firstColWidthBefore.unit)} should be unchanged`);
      assert.equal(firstColWidthAfter.unit, 'px', 'First column unit width');
    });
  });

  context('table_column_resizing="resizetable" and table_sizing_mode="relative" and table_use_colgroups=false', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...defaultSettings,
      table_column_resizing: 'resizetable',
      table_sizing_mode: 'relative',
      table_use_colgroups: false
    }, []);

    it('TINY-6242: adjusting the entire table should not resize more than the last column width', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragHandle(editor, 'ne', -250, 0),
        () => TableTestUtils.insertRaw(editor, percentTable)
      );
      assertWidthAfterResize(53, widths, true);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const firstColWidth = widths.after.cellWidths[0];
      const lastColWidth = widths.after.cellWidths[1];
      const rawFirstColWidth = firstColWidth.raw ?? 0;
      assert.approximately(rawFirstColWidth, 95, percentDiffThreshold, `First column raw width ${rawFirstColWidth + String(firstColWidth.unit)} should be ~95%`);
      assert.equal(firstColWidth.unit, '%', 'First column unit width');
      const rawLastColWidth = lastColWidth.raw ?? 0;
      assert.approximately(rawLastColWidth, 5, percentDiffThreshold, `Last column raw width ${rawLastColWidth + String(lastColWidth.unit)} should be ~5%`);
      assert.equal(lastColWidth.unit, '%', 'Last column unit width');
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
      assertWidthAfterResize(35, measurements, true);
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
      assertWidthAfterResize(53, measurements, true);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const firstColWidth = measurements.after.cellWidths[0];
      const lastColWidth = measurements.after.cellWidths[1];
      assert.approximately(firstColWidth.px, 157, pixelDiffThreshold, `First column computed width ${firstColWidth.px}px should be ~157px`);
      assert.approximately(lastColWidth.px, 0, pixelDiffThreshold, `Last column computed width ${lastColWidth.px}px should be ~0px`);
    });
  });

  context('When the editor is started with a table', () => {
    const hook = TinyHooks.bddSetupFromElement(defaultSettings, setupElement('<table><tbody><tr><td>A</td></tr></tbody></table>'));

    it('TINY-9748: The table should not be given resize handles', () => {
      const editor = hook.editor();
      assert.isFalse(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Should not give the handles at init');
    });
  });
});
