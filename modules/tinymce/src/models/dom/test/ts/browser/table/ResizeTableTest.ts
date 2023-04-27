import { Mouse } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { TableGridSize } from '@ephox/snooker';
import { Html, Insert, Remove, SelectorExists, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ObjectResizeEvent, TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as TableTestUtils from '../../module/table/TableTestUtils';

interface WidthMeasurements {
  readonly table: SugarElement<HTMLTableElement>;
  readonly widthAfter: TableTestUtils.WidthData;
  readonly widthBefore: TableTestUtils.WidthData;
  readonly colWidthsAfter: TableTestUtils.WidthData[];
  readonly colWidthsBefore: TableTestUtils.WidthData[];
}

describe('browser.tinymce.models.dom.table.ResizeTableTest', () => {
  const lastObjectResizeStartEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const lastObjectResizedEvent = Cell<EditorEvent<ObjectResizeEvent> | null>(null);
  const pixelDiffThreshold = 3;
  const percentDiffThreshold = 1;
  let tableModifiedEvents: Array<EditorEvent<TableModifiedEvent>> = [];

  const pixelTable = '<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>';
  const percentTable = '<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>';
  const responsiveTable = '<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>';
  const responsiveTableWithContent = '<table><colgroup><col><col></colgroup><tbody><tr><td>Content</td><td><br></td></tr></tbody></table>';
  const pixelTableWithRowHeights = '<table style="width: 200px; height: 100px;"><tbody><tr style="height: 100px;"><td style="height: 100px;"></td><td style="height: 100px;"></td></tr></tbody></table>';

  const defaultSettings = {
    width: 400,
    height: 300,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  };

  const assertWithin = (value: number, min: number, max: number) => {
    assert.isAtMost(value, max, 'asserting if value falls within a certain range');
    assert.isAtLeast(value, min, 'asserting if value falls within a certain range');
  };

  const assertWidths = (input: any) => {
    const expectedPx = input.widthBefore.px - 100;
    const expectedPercent = input.widthAfter.px / input.widthBefore.px * 100;

    // not able to match the percent exactly - there's always a difference in fractions, so lets assert a small range instead
    assertWithin(input.widthAfter.px, expectedPx - 1, expectedPx + 1);
    assert.isTrue(input.widthAfter.isPercent, 'table width should be in percents');
    assertWithin(input.widthAfter.raw, expectedPercent - 1, expectedPercent + 1);
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

  const pResizeWithHandle = (editor: Editor) => TableTestUtils.pDragHandle(editor, 'se', -100, -20);

  const getColWidths = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
    const size = TableGridSize.getGridSize(table);
    return Arr.range(size.columns, (col) => TableTestUtils.getCellWidth(editor, table, 0, col));
  };

  const pInsertResizeMeasure = async (editor: Editor, pResize: (editor: Editor) => Promise<void>, insert: (editor: Editor) => SugarElement<HTMLTableElement>): Promise<WidthMeasurements> => {
    const unbindEvents = bindResizeEvents(editor);
    const table = insert(editor);
    const widthBefore = TableTestUtils.getWidths(editor, table.dom);
    const colWidthsBefore = getColWidths(editor, table);
    Mouse.trueClick(table);
    await pResize(editor);
    const widthAfter = TableTestUtils.getWidths(editor, table.dom);
    const colWidthsAfter = getColWidths(editor, table);
    unbindEvents();
    return {
      table,
      widthBefore,
      widthAfter,
      colWidthsBefore,
      colWidthsAfter
    };
  };

  const assertUnitBeforeResize = (unit: string | null, widths: WidthMeasurements) => {
    assert.equal(widths.widthBefore.unit, unit, `table width before resizing is in ${unit}`);
  };

  const assertUnitAfterResize = (unit: string | null, widths: WidthMeasurements) => {
    assert.equal(widths.widthAfter.unit, unit, `table width after resizing is in ${unit}`);
  };

  const assertWidthBeforeResize = (width: number | null, widths: WidthMeasurements) => {
    assert.equal(widths.widthBefore.raw, width, `table raw width before resizing is ${width}`);
  };

  const assertWidthAfterResize = (width: number | null, widths: WidthMeasurements, approx: boolean = false) => {
    if (approx) {
      assert.approximately(widths.widthAfter.raw ?? 0, width ?? 0, pixelDiffThreshold, `table raw width after resizing is ~${width}`);
    } else {
      assert.equal(widths.widthAfter.raw, width, `table raw width after resizing is ${width}`);
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
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, percentTable));
      assertUnitAfterResize('%', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: resize should detect current unit for px table', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, pixelTable));
      assertUnitAfterResize('px', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-7699: resize a row and verify the output has the correct heights', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'row', 0, 0, 50),
        () => TableTestUtils.insertRaw(editor, pixelTableWithRowHeights)
      );
      assertUnitAfterResize('px', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const height = '150px';
      TinyAssertions.assertContent(editor,
        `<table style="width: 200px; height: ${height};">` +
        '<tbody>' +
        `<tr style="height: ${height};"><td style="height: ${height};">&nbsp;</td><td style="height: ${height};">&nbsp;</td></tr>` +
        '</tbody>' +
        '</table>'
      );
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
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.makeInsertTable(editor, 5, 2));
      assertWidths(widths);
      assertUnitBeforeResize('%', widths);
      assertUnitAfterResize('%', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, responsiveTable));
      assertUnitAfterResize('%', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: force % on px table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, pixelTable));
      assertUnitAfterResize('%', widths);
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
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.makeInsertTable(editor, 5, 2));
      assertUnitBeforeResize('px', widths);
      assertUnitAfterResize('px', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force px on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, responsiveTable));
      assertUnitAfterResize('px', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TBA: force px on % table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, percentTable));
      assertUnitAfterResize('px', widths);
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
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.makeInsertTable(editor, 5, 2));
      assertUnitBeforeResize(null, widths);
      assertUnitAfterResize('%', widths);
      assertWidthBeforeResize(null, widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on responsive/unset table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, responsiveTable));
      assertUnitAfterResize('%', widths);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
    });

    it('TINY-6051: force % on px table when resized', async () => {
      const editor = hook.editor();
      editor.setContent('');
      const widths = await pInsertResizeMeasure(editor, pResizeWithHandle, () => TableTestUtils.insertRaw(editor, pixelTable));
      assertUnitAfterResize('%', widths);
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
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 20, 0),
        () => TableTestUtils.insertRaw(editor, pixelTable)
      );
      assertWidthAfterResize(200, widths);
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
      const firstColWidth = widths.colWidthsAfter[0];
      const lastColWidth = widths.colWidthsAfter[1];
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
      const lastColWidth = widths.colWidthsAfter[1];
      // Note: Use 106px as the padding + borders are about 14px
      const rawLastColWidth = lastColWidth.raw ?? 0;
      assert.approximately(rawLastColWidth, 106, pixelDiffThreshold, `Last column raw width ${rawLastColWidth + String(lastColWidth.unit)} should be ~106px`);
      assert.equal(lastColWidth.unit, 'px', 'Last column unit width');
      const firstColWidthBefore = widths.colWidthsBefore[0];
      const firstColWidthAfter = widths.colWidthsAfter[0];
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
      const firstColWidth = widths.colWidthsAfter[0];
      const lastColWidth = widths.colWidthsAfter[1];
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
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 100, 0),
        () => TableTestUtils.makeInsertTable(editor, 2, 2)
      );
      assertUnitBeforeResize(null, widths);
      assertUnitAfterResize('%', widths);
      assertWidthAfterResize(35, widths, true);
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
      const widths = await pInsertResizeMeasure(editor,
        () => TableTestUtils.pDragResizeBar(editor, 'column', 0, 100, 0),
        () => TableTestUtils.insertRaw(editor, responsiveTableWithContent)
      );
      assertUnitAfterResize('%', widths);
      assertWidthAfterResize(53, widths, true);
      assertEventData(lastObjectResizeStartEvent, 'objectresizestart');
      assertEventData(lastObjectResizedEvent, 'objectresized');
      const firstColWidth = widths.colWidthsAfter[0];
      const lastColWidth = widths.colWidthsAfter[1];
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
