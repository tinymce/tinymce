/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Strings } from '@ephox/katamari';
import { Adjustments, ResizeBehaviour, ResizeWire, Sizes, TableGridSize, TableResize } from '@ephox/snooker';
import { Attribute, Css, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import * as Settings from '../api/Settings';
import * as Util from '../core/Util';
import * as TableSize from '../queries/TableSize';
import { enforcePercentage, enforcePixels, syncPixels } from './EnforceUnit';
import * as TableWire from './TableWire';

export interface ResizeHandler {
  readonly lazyResize: () => Optional<TableResize>;
  readonly lazyWire: () => any;
  readonly destroy: () => void;
}

const barResizerPrefix = 'bar-';
const isResizable = (elm: SugarElement<Element>) => Attribute.get(elm, 'data-mce-resize') !== 'false';

export const getResizeHandler = (editor: Editor): ResizeHandler => {
  let selectionRng = Optional.none<Range>();
  let resize = Optional.none<TableResize>();
  let wire = Optional.none<ResizeWire>();
  let startW: number;
  let startRawW: string;

  const isTable = (elm: Node): elm is HTMLTableElement => {
    return elm.nodeName === 'TABLE';
  };

  const lazyResize = () => resize;

  const lazyWire = () =>
    wire.getOr(ResizeWire.only(SugarElement.fromDom(editor.getBody()), isResizable));

  const lazySizing = (table: SugarElement<HTMLTableElement>) =>
    TableSize.get(editor, table);

  const lazyResizingBehaviour = () =>
    Settings.isPreserveTableColumnResizing(editor) ? ResizeBehaviour.preserveTable() : ResizeBehaviour.resizeTable();

  const getNumColumns = (table: SugarElement<Element>) =>
    TableGridSize.getGridSize(table).columns;

  const afterCornerResize = (table: SugarElement<HTMLTableElement>, origin: string, width: number) => {
    // Origin will tell us which handle was clicked, eg corner-se or corner-nw
    // so check to see if it ends with `e` (eg east edge)
    const isRightEdgeResize = Strings.endsWith(origin, 'e');

    // Responsive tables don't have a width so we need to convert it to a relative/percent
    // table instead, as that's closer to responsive sizing than fixed sizing
    if (startRawW === '') {
      enforcePercentage(table);
    }

    // Adjust the column sizes and update the table width to use the right sizing, if the table changed size.
    // This is needed as core will always use pixels when setting the width.
    if (width !== startW && startRawW !== '') {
      // Restore the original size and then let snooker resize appropriately
      Css.set(table, 'width', startRawW);

      const resizing = lazyResizingBehaviour();
      const tableSize = lazySizing(table);

      // For preserve table we want to always resize the entire table. So pretend the last column is being resized
      const col = Settings.isPreserveTableColumnResizing(editor) || isRightEdgeResize ? getNumColumns(table) - 1 : 0;
      Adjustments.adjustWidth(table, width - startW, col, resizing, tableSize);
    // Handle the edge case where someone might fire this event without resizing.
    // If so then we need to ensure the table is still using percent
    } else if (Util.isPercentage(startRawW)) {
      const percentW = parseFloat(startRawW.replace('%', ''));
      const targetPercentW = width * percentW / startW;
      Css.set(table, 'width', targetPercentW + '%');
    }

    // Sync the cell sizes, as the core resizing logic doesn't update them, but snooker does
    if (Util.isPixel(startRawW)) {
      syncPixels(table);
    }
  };

  const destroy = () => {
    resize.each((sz) => {
      sz.destroy();
    });

    wire.each((w) => {
      TableWire.remove(editor, w);
    });
  };

  editor.on('init', () => {
    const rawWire = TableWire.get(editor, isResizable);
    wire = Optional.some(rawWire);
    if (Settings.hasObjectResizing(editor) && Settings.hasTableResizeBars(editor)) {
      const resizing = lazyResizingBehaviour();
      const sz = TableResize.create(rawWire, resizing, lazySizing);
      sz.on();
      sz.events.startDrag.bind((_event) => {
        selectionRng = Optional.some(editor.selection.getRng());
      });

      sz.events.beforeResize.bind((event) => {
        const rawTable = event.table.dom;
        Events.fireObjectResizeStart(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable), barResizerPrefix + event.type);
      });

      sz.events.afterResize.bind((event) => {
        const table = event.table;
        const rawTable = table.dom;
        Util.removeDataStyle(table);

        selectionRng.each((rng) => {
          editor.selection.setRng(rng);
          editor.focus();
        });

        Events.fireObjectResized(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable), barResizerPrefix + event.type);
        editor.undoManager.add();
      });

      resize = Optional.some(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', (e) => {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = SugarElement.fromDom(targetElm);

      // Add a class based on the resizing mode
      Arr.each(editor.dom.select('.mce-clonedresizable'), (clone) => {
        editor.dom.addClass(clone, 'mce-' + Settings.getColumnResizingBehaviour(editor) + '-columns');
      });

      if (!Sizes.isPixelSizing(table) && Settings.isPixelsForced(editor)) {
        enforcePixels(table);
      } else if (!Sizes.isPercentSizing(table) && Settings.isPercentagesForced(editor)) {
        enforcePercentage(table);
      }

      // TINY-6601: If resizing using a bar, then snooker will base the resizing on the initial size. So
      // when using a responsive table we need to ensure we convert to a relative table before resizing
      if (Sizes.isNoneSizing(table) && Strings.startsWith(e.origin, barResizerPrefix)) {
        enforcePercentage(table);
      }

      startW = e.width;
      startRawW = Settings.isResponsiveForced(editor) ? '' : Util.getRawWidth(editor, targetElm).getOr('');
    }
  });

  editor.on('ObjectResized', (e) => {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = SugarElement.fromDom(targetElm);

      // Resize based on the snooker logic to adjust the individual col/rows if resized from a corner
      const origin = e.origin;
      if (Strings.startsWith(origin, 'corner-')) {
        afterCornerResize(table, origin, e.width);
      }

      Util.removeDataStyle(table);
      Events.fireTableModified(editor, table.dom, Events.styleModified);
    }
  });

  editor.on('SwitchMode', () => {
    lazyResize().each((resize) => {
      if (editor.mode.isReadOnly()) {
        resize.hideBars();
      } else {
        resize.showBars();
      }
    });
  });

  return {
    lazyResize,
    lazyWire,
    destroy
  };
};
