/**
 * ResizeHandler.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Option } from '@ephox/katamari';
import { ResizeWire, TableDirection, TableResize } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';
import Direction from '../queries/Direction';
import TableWire from './TableWire';
import { hasTableResizeBars, hasObjectResizing } from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import * as Events from '../api/Events';
import * as Util from '../alien/Util';
import { Node, HTMLTableElement, HTMLTableCellElement, HTMLTableRowElement } from '@ephox/dom-globals';

export interface ResizeHandler {
  lazyResize: () => Option<any>;
  lazyWire: () => any;
  destroy: () => void;
}

export const ResizeHandler = function (editor: Editor): ResizeHandler {
  let selectionRng = Option.none();
  let resize = Option.none();
  let wire = Option.none();
  const percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  let startW, startRawW;

  const isTable = function (elm: Node): elm is HTMLTableElement {
    return elm.nodeName === 'TABLE';
  };

  const getRawWidth = function (elm: Node) {
    return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  };

  const lazyResize = function () {
    return resize;
  };

  const lazyWire = function () {
    return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
  };

  const destroy = function () {
    resize.each(function (sz) {
      sz.destroy();
    });

    wire.each(function (w) {
      TableWire.remove(editor, w);
    });
  };

  editor.on('init', function () {
    const direction = TableDirection(Direction.directionAt);
    const rawWire = TableWire.get(editor);
    wire = Option.some(rawWire);
    if (hasObjectResizing(editor) && hasTableResizeBars(editor)) {
      const sz = TableResize(rawWire, direction);
      sz.on();
      sz.events.startDrag.bind(function (event) {
        selectionRng = Option.some(editor.selection.getRng());
      });

      sz.events.beforeResize.bind(function (event) {
        const rawTable = event.table().dom();
        Events.fireObjectResizeStart(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable));
      });

      sz.events.afterResize.bind(function (event) {
        const table = event.table();
        const rawTable = table.dom();
        Util.removeDataStyle(table);

        selectionRng.each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
        });

        Events.fireObjectResized(editor, rawTable, Util.getPixelWidth(rawTable), Util.getPixelHeight(rawTable));
        editor.undoManager.add();
      });

      resize = Option.some(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', function (e) {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      startW = e.width;
      startRawW = getRawWidth(targetElm);
    }
  });

  interface CellSize { cell: HTMLTableCellElement; width: string; }

  editor.on('ObjectResized', function (e) {
    const targetElm = e.target;
    if (isTable(targetElm)) {
      const table = targetElm;

      if (percentageBasedSizeRegex.test(startRawW)) {
        const percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
        const targetPercentW = e.width * percentW / startW;
        editor.dom.setStyle(table, 'width', targetPercentW + '%');
      } else {
        const newCellSizes: CellSize[] = [];
        Tools.each(table.rows, function (row: HTMLTableRowElement) {
          Tools.each(row.cells, function (cell: HTMLTableCellElement) {
            const width = editor.dom.getStyle(cell, 'width', true);
            newCellSizes.push({
              cell,
              width
            });
          });
        });

        Tools.each(newCellSizes, function (newCellSize: CellSize) {
          editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
          editor.dom.setAttrib(newCellSize.cell, 'width', null);
        });
      }
    }
  });

  return {
    lazyResize,
    lazyWire,
    destroy
  };
};