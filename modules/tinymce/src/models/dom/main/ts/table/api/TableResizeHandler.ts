import { Arr, Singleton, Strings, Type } from '@ephox/katamari';
import { Adjustments, ResizeBehaviour, ResizeWire, Sizes, TableConversions, TableGridSize, TableLookup, TableResize, Warehouse } from '@ephox/snooker';
import { Attribute, Css, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { DisabledStateChangeEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Utils from '../core/TableUtils';
import * as TableWire from '../core/TableWire';
import * as TableSize from '../queries/TableSize';

import * as Events from './Events';
import * as Options from './Options';

export interface TableResizeHandler {
  readonly refresh: (table: HTMLTableElement) => void;
  readonly hide: () => void;
  readonly show: () => void;
}

type CornerLocation = 'nw' | 'ne' | 'se' | 'sw';
type CornerOrigin = `corner-${CornerLocation}`;

const isTable = (node: Node) => Type.isNonNullable(node) && node.nodeName === 'TABLE';

const barResizerPrefix = 'bar-';
const isResizable = (elm: SugarElement<Element>) => Attribute.get(elm, 'data-mce-resize') !== 'false';

const syncTableCellPixels = (table: SugarElement<HTMLTableElement>): void => {
  const warehouse = Warehouse.fromTable(table);
  if (!Warehouse.hasColumns(warehouse)) {
    // Ensure the specified width matches the actual cell width
    Arr.each(TableLookup.cells(table), (cell) => {
      const computedWidth = Css.get(cell, 'width');
      Css.set(cell, 'width', computedWidth);
      Attribute.remove(cell, 'width');
    });
  }
};

const isCornerResize = (origin: string): origin is CornerOrigin =>
  Strings.startsWith(origin, 'corner-');

const getCornerLocation = (origin: CornerOrigin): CornerLocation =>
  Strings.removeLeading(origin, 'corner-') as CornerLocation;

export const TableResizeHandler = (editor: Editor): TableResizeHandler => {
  const selectionRng = Singleton.value<Range>();
  const tableResize = Singleton.value<TableResize>();
  const resizeWire = Singleton.value<ResizeWire>();
  let startW: number;
  let startRawW: string;
  let startH: number;
  let startRawH: string;

  const lazySizing = (table: SugarElement<HTMLTableElement>) =>
    TableSize.get(editor, table);

  const lazyResizingBehaviour = () =>
    Options.isPreserveTableColumnResizing(editor) ? ResizeBehaviour.preserveTable() : ResizeBehaviour.resizeTable();

  const getNumColumns = (table: SugarElement<HTMLTableElement>) =>
    TableGridSize.getGridSize(table).columns;

  const getNumRows = (table: SugarElement<HTMLTableElement>) =>
    TableGridSize.getGridSize(table).rows;

  const afterCornerResize = (table: SugarElement<HTMLTableElement>, origin: CornerOrigin, width: number, height: number) => {
    // Origin will tell us which handle was clicked, eg corner-se or corner-nw
    // so check to see if it ends with `e` (eg east edge)
    const location = getCornerLocation(origin);
    const isRightEdgeResize = Strings.endsWith(location, 'e');
    const isNorthEdgeResize = Strings.startsWith(location, 'n');

    // Responsive tables don't have a width so we need to convert it to a relative/percent
    // table instead, as that's closer to responsive sizing than fixed sizing
    if (startRawW === '') {
      TableConversions.convertToPercentSizeWidth(table);
    }

    // Responsive tables don't have a height so we need to convert it to a fixed value to be able to resize the table height
    if (startRawH === '') {
      TableConversions.convertToPixelSizeHeight(table);
    }

    // Adjust the column sizes and update the table width to use the right sizing, if the table changed size.
    // This is needed as core will always use pixels when setting the width.
    if (width !== startW && startRawW !== '') {
      // Restore the original size and then let snooker resize appropriately
      Css.set(table, 'width', startRawW);

      const resizing = lazyResizingBehaviour();
      const tableSize = lazySizing(table);

      // For preserve table we want to always resize the entire table. So pretend the last column is being resized
      const col = Options.isPreserveTableColumnResizing(editor) || isRightEdgeResize ? getNumColumns(table) - 1 : 0;
      Adjustments.adjustWidth(table, width - startW, col, resizing, tableSize);
      // Handle the edge case where someone might fire this event without resizing.
      // If so then we need to ensure the table is still using percent
    } else if (Utils.isPercentage(startRawW)) {
      const percentW = parseFloat(startRawW.replace('%', ''));
      const targetPercentW = width * percentW / startW;
      Css.set(table, 'width', targetPercentW + '%');
    }

    // Sync the cell sizes, as the core resizing logic doesn't update them, but snooker does
    if (Utils.isPixel(startRawW)) {
      syncTableCellPixels(table);
    }

    // NOTE: This will only change the height of the first or last tr
    if (height !== startH && startRawH !== '') {
      // Restore the original size and then let snooker resize appropriately
      Css.set(table, 'height', startRawH);
      const idx = isNorthEdgeResize ? 0 : getNumRows(table) - 1;
      Adjustments.adjustHeight(table, height - startH, idx);
    }
  };

  const destroy = () => {
    tableResize.on((sz) => {
      sz.destroy();
    });
  };

  editor.on('init', () => {
    const rawWire = TableWire.get(editor, isResizable);
    resizeWire.set(rawWire);
    if (Options.hasTableObjectResizing(editor) && Options.hasTableResizeBars(editor)) {
      const resizing = lazyResizingBehaviour();
      const sz = TableResize.create(rawWire, resizing, lazySizing);

      if (!editor.mode.isReadOnly()) {
        sz.on();
      }

      sz.events.startDrag.bind((_event) => {
        selectionRng.set(editor.selection.getRng());
      });

      sz.events.beforeResize.bind((event) => {
        const rawTable = event.table.dom;
        Events.fireObjectResizeStart(editor, rawTable, Utils.getPixelWidth(rawTable), Utils.getPixelHeight(rawTable), barResizerPrefix + event.type);
      });

      sz.events.afterResize.bind((event) => {
        const table = event.table;
        const rawTable = table.dom;
        Utils.removeDataStyle(table);

        selectionRng.on((rng) => {
          editor.selection.setRng(rng);
          editor.focus();
        });

        Events.fireObjectResized(editor, rawTable, Utils.getPixelWidth(rawTable), Utils.getPixelHeight(rawTable), barResizerPrefix + event.type);
        editor.undoManager.add();
      });

      tableResize.set(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', (e) => {
    const targetElm = e.target;
    if (isTable(targetElm) && !editor.mode.isReadOnly()) {
      const table = SugarElement.fromDom(targetElm);

      // Add a class based on the resizing mode
      Arr.each(editor.dom.select('.mce-clonedresizable'), (clone) => {
        editor.dom.addClass(clone, 'mce-' + Options.getTableColumnResizingBehaviour(editor) + '-columns');
      });

      if (!Sizes.isPixelSizing(table) && Options.isTablePixelsForced(editor)) {
        TableConversions.convertToPixelSizeWidth(table);
      } else if (!Sizes.isPercentSizing(table) && Options.isTablePercentagesForced(editor)) {
        TableConversions.convertToPercentSizeWidth(table);
      }

      // TINY-6601: If resizing using a bar, then snooker will base the resizing on the initial size. So
      // when using a responsive table we need to ensure we convert to a relative table before resizing
      if (Sizes.isNoneSizing(table) && Strings.startsWith(e.origin, barResizerPrefix)) {
        TableConversions.convertToPercentSizeWidth(table);
      }

      startW = e.width;
      startRawW = Options.isTableResponsiveForced(editor) ? '' : Utils.getRawWidth(editor, targetElm).getOr('');
      startH = e.height;
      startRawH = Utils.getRawHeight(editor, targetElm).getOr('');
    }
  });

  editor.on('ObjectResized', (e) => {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = SugarElement.fromDom(targetElm);

      // Resize based on the snooker logic to adjust the individual col/rows if resized from a corner
      const origin = e.origin;
      if (isCornerResize(origin)) {
        afterCornerResize(table, origin, e.width, e.height);
      }

      Utils.removeDataStyle(table);
      Events.fireTableModified(editor, table.dom, Events.styleModified);
    }
  });

  const showResizeBars = () => {
    tableResize.on((resize) => {
      resize.on();
      resize.showBars();
    });
  };

  const hideResizeBars = () => {
    tableResize.on((resize) => {
      resize.off();
      resize.hideBars();
    });
  };

  editor.on('DisabledStateChange', (e: EditorEvent<DisabledStateChangeEvent>) => {
    e.state ? hideResizeBars() : showResizeBars();
  });

  editor.on('SwitchMode', () => {
    editor.mode.isReadOnly() ? hideResizeBars() : showResizeBars();
  });

  editor.on('dragstart dragend', (e: EditorEvent<DragEvent>) => {
    e.type === 'dragstart' ? hideResizeBars() : showResizeBars();
  });

  editor.on('remove', () => {
    destroy();
  });

  const refresh = (table: HTMLTableElement): void => {
    tableResize.on((resize) => resize.refreshBars(SugarElement.fromDom(table)));
  };

  const hide = (): void => {
    tableResize.on((resize) => resize.hideBars());
  };

  const show = (): void => {
    tableResize.on((resize) => resize.showBars());
  };

  return {
    refresh,
    hide,
    show
  };
};
