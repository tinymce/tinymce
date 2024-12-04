import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell, Fun, Strings } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TableGridSize } from '@ephox/snooker';
import { Class, Css, Html, Insert, InsertAll, Remove, SelectorExists, SelectorFilter, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
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

  const hoverOnTable = async (editor: Editor, tableElement: HTMLTableElement, rowOrCol: 'row' | 'column', index: number) => {
    const docElem = TinyDom.documentElement(editor);
    // Need to mouse over the table to trigger the 'resizebar' divs to appear in the dom
    const td = UiFinder.findIn(SugarElement.fromDom(tableElement), 'td').getOrDie();
    Mouse.mouseOver(td);

    await Waiter.pTryUntil('wait for resize bars',
      () => UiFinder.findIn(docElem, `div[data-${rowOrCol}='${index}']`).getOrDie()
    );
  };

  const assertInlineResizerPosition = (table: HTMLTableElement) => {
    const rows = table.rows;
    const resizeBars = SelectorFilter.descendants(SugarBody.body(), '.ephox-snooker-resizer-bar');

    Arr.each(rows, (row, i) => {
      const bar = resizeBars[i];
      const rect = row.getBoundingClientRect();

      const top = parseFloat(Strings.removeTrailing(Css.get(bar, 'top'), 'px'));
      // For last row, subtract 4 (double border spacing) border spacing between the previous row and the table border
      const borderSpacingOffset = i === rows.length - 1 ? 4 : 2;
      const expectedTop = Math.round(rect.bottom - borderSpacingOffset);

      assert.approximately(top, expectedTop, 1, `Row ${i} resize bar position mismatch`);
    });
  };

  const assertIframeResizerPosition = (editor: Editor, table: HTMLTableElement) => {
    const rows = table.rows;
    const resizeBars = SelectorFilter.descendants(SugarElement.fromDom(editor.getDoc().documentElement), '.ephox-snooker-resizer-bar');

    Arr.each(rows, (row, i) => {
      const bar = resizeBars[i];
      const rect = row.getBoundingClientRect();

      const top = parseFloat(Strings.removeTrailing(Css.get(bar, 'top'), 'px'));
      // For last row, subtract 4 (double border spacing) border spacing between the previous row and the table border
      const borderSpacingOffset = i === rows.length - 1 ? 4 : 2;
      const expectedTop = Math.round(rect.bottom - borderSpacingOffset);

      assert.approximately(top, expectedTop, 1, `Row ${i} resize bar position mismatch`);
    });
  };

  // const assertResizerPosition = (editor: Editor, table: HTMLTableElement) => {
  //   const editorBody = editor.getBody();
  //
  //   Arr.each(table.rows, (row, rowIndex) => {
  //     const resizer = SelectorFind.descendant(SugarBody.body(), `.ephox-snooker-resizer-rows[data-row="${rowIndex}"]`).getOrDie('Resizer not found');
  //
  //     const editorRect = editorBody.getBoundingClientRect();
  //     const rowRect = row.getBoundingClientRect();
  //     const rowTopRelativeToEditor = rowRect.top - editorRect.top;
  //
  //     // Get table's border spacing
  //     const borderSpacing = parseInt(Css.get(SugarElement.fromDom(table), 'border-spacing'), 10);
  //
  //     // For all rows except last, offset includes the border spacing
  //     const isLastRow = rowIndex === table.rows.length - 1;
  //     const expectedOffset = isLastRow ?
  //       19 : // Last row: no need to account for spacing
  //       19 + borderSpacing; // Other rows: account for spacing to next row
  //
  //     const expectedTop = rowTopRelativeToEditor + expectedOffset;
  //     const actualResizerTop = parseInt(Strings.removeTrailing(Css.get(resizer, 'top'), 'px'), 10);
  //
  //     assert.approximately(actualResizerTop, expectedTop, 5, `Resizer position mismatch for row ${rowIndex} - Expected: ${expectedTop}, Actual: ${actualResizerTop}`);
  //   });
  // };

  context('Location of table resize bar handler container', () => {
    context('iframe mode', () => {
      const hook = TinyHooks.bddSetup<Editor>(defaultSettings, [], true);

      it('TINY-11215: The resize bar handler container should be inside the iframe', async () => {
        const editor = hook.editor();
        TableTestUtils.insertRaw(editor, percentTable);
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertIframeResizerPosition(editor, table);
      });
    });

    context('inline mode', () => {
      const hook = TinyHooks.bddSetupFromElement<Editor>({ ...defaultSettings, inline: true, plugins: 'table' }, () => {
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

      it('TINY-11215: The resize bar wires should be at the correct location', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertInlineResizerPosition(table);
      });
    });

    enum TriggerWaitDecision {
      FailWithError,
      KeepWaiting,
      Succeed
    }

    const pWaitUntilTriggersEvent = (
      editor: Editor,
      eventName: string,
      validate: (evt: any) => TriggerWaitDecision,
      action: () => void
    ): Promise<void> => {

      let hasFinished = false;
      let errorMessage: string | null = null;

      const f = (evt: Event) => {
        const v = validate(evt);
        if (v === TriggerWaitDecision.Succeed) {
          editor.off(eventName, f);
          hasFinished = true;
        } else if (v === TriggerWaitDecision.FailWithError) {
          editor.off(eventName, f);
          hasFinished = false;
          errorMessage = `Error while waiting for ${eventName} event`;
        } else {
          // Keep waiting.
        }
      };

      editor.on(eventName, f);
      action();

      return Waiter.pTryUntil(
        `Waiting until event ${eventName} is triggered by action`,
        () => {
          if (errorMessage !== null) {
            const m = errorMessage;
            errorMessage = null;
            throw new Error(m);
          } else if (hasFinished) {
            return;
          } else {
            throw new Error('Keep waiting');
          }
        }
      );
    };
    const pWaitUntilElementScrollFires = (editor: Editor, scroller: SugarElement<HTMLElement>, x: number, y: number): Promise<void> =>
      pWaitUntilTriggersEvent(
        editor,
        'ElementScroll',
        (evt) => evt.target === scroller.dom ? TriggerWaitDecision.Succeed : TriggerWaitDecision.KeepWaiting,
        () => scroller.dom.scrollTo(x, y)
      );

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

      it('TINY-11215: Resize bar handler should render at the correct location, close to the bottom of tr', async () => {
        const editor = hook.editor();
        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        assertInlineResizerPosition(table);
      });

      it('TINY-11215: Scrolling the scrollable container, the table resize wires should still be attached', async () => {
        const editor = hook.editor();
        // TableTestUtils.insertRaw(editor, percentTable);
        editor.focus();
        editor.nodeChanged();
        await UiFinder.pWaitForVisible('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');

        const table = editor.dom.select('table')[0];
        await hoverOnTable(editor, table, 'row', 0);
        const test = SelectorFind.descendant<HTMLElement>(SugarBody.body(), '.scrollable').getOrDie();
        // test.dom.scrollBy(0, test.dom.scrollHeight / 2);
        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 2);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(table);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 4);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(table);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 6);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(table);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 1.5);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(table);

        await hoverOnTable(editor, table, 'row', 0);
      });

      it('TINY-11215: Table resize wires should be removed when hovering on non table', async () => {
        const editor = hook.editor();
        editor.resetContent();
        hoverOnElement(editor, 'p');
        const resizerBars = SelectorFilter.descendants(TinyDom.body(editor), '.ephox-snooker-resizer-bar');
        assert.equal(resizerBars.length, 0, 'Should have ancestors');
      });

      it('TINY-11215: Hovering non table element should remove the table resize bar container', async () => {
        const editor = hook.editor();
        editor.resetContent();
        await hoverOnTable(editor, editor.dom.select('table')[0], 'row', 0);
        hoverOnElement(editor, 'p');
        const resizerBars = SelectorFilter.descendants(TinyDom.body(editor), '.ephox-snooker-resizer-bar');
        assert.equal(resizerBars.length, 0, 'Should have ancestors');
      });

      it('TINY-11215: Multiple tables within the editor content', async () => {
        const editor = hook.editor();
        editor.insertContent(largeTable);
        editor.focus();
        editor.nodeChanged();
        await UiFinder.pWaitForVisible('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');
        const test = SelectorFind.descendant<HTMLElement>(SugarBody.body(), '.scrollable').getOrDie();

        const tableOne = editor.dom.select('table')[0];
        await hoverOnTable(editor, tableOne, 'row', 0);
        await pWaitUntilElementScrollFires(editor, test, 0, 1);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(tableOne);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 2);
        const tableTwo = editor.dom.select('table')[1];
        await hoverOnTable(editor, tableTwo, 'row', 0);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(tableTwo);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 4);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(tableTwo);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 6);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(tableTwo);

        await pWaitUntilElementScrollFires(editor, test, 0, test.dom.scrollHeight / 1.5);
        await Waiter.pWait(1000);
        assertInlineResizerPosition(tableTwo);

        await hoverOnTable(editor, tableTwo, 'row', 0);

        assert.isString(false);
      });
    });
  });
});
