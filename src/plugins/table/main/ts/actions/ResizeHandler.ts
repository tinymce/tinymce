/**
 * ResizeHandler.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option } from '@ephox/katamari';
import { ResizeWire } from '@ephox/snooker';
import { TableDirection } from '@ephox/snooker';
import { TableResize } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import TableWire from './TableWire';
import Direction from '../queries/Direction';
import Tools from 'tinymce/core/util/Tools';



export default <any> function (editor) {
  var selectionRng = Option.none();
  var resize = Option.none();
  var wire = Option.none();
  var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  var startW, startRawW;

  var isTable = function (elm) {
    return elm.nodeName === 'TABLE';
  };

  var getRawWidth = function (elm) {
    return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  };

  var lazyResize = function () {
    return resize;
  };

  var lazyWire = function () {
    return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
  };

  var destroy = function () {
    resize.each(function (sz) {
      sz.destroy();
    });

    wire.each(function (w) {
      TableWire.remove(editor, w);
    });
  };

  editor.on('init', function () {
    var direction = TableDirection(Direction.directionAt);
    var rawWire = TableWire.get(editor);
    wire = Option.some(rawWire);
    if (editor.settings.object_resizing && editor.settings.table_resize_bars !== false &&
      (editor.settings.object_resizing === true || editor.settings.object_resizing === 'table')) {
      var sz = TableResize(rawWire, direction);
      sz.on();
      sz.events.startDrag.bind(function (event) {
        selectionRng = Option.some(editor.selection.getRng());
      });
      sz.events.afterResize.bind(function (event) {
        var table = event.table();
        var dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
        Arr.each(dataStyleCells, function (cell) {
          Attr.remove(cell, 'data-mce-style');
        });

        selectionRng.each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
        });

        editor.undoManager.add();
      });

      resize = Option.some(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', function (e) {
    if (isTable(e.target)) {
      startW = e.width;
      startRawW = getRawWidth(e.target);
    }
  });

  editor.on('ObjectResized', function (e) {
    if (isTable(e.target)) {
      var table = e.target;

      if (percentageBasedSizeRegex.test(startRawW)) {
        var percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
        var targetPercentW = e.width * percentW / startW;
        editor.dom.setStyle(table, 'width', targetPercentW + '%');
      } else {
        var newCellSizes = [];
        Tools.each(table.rows, function (row) {
          Tools.each(row.cells, function (cell) {
            var width = editor.dom.getStyle(cell, 'width', true);
            newCellSizes.push({
              cell: cell,
              width: width
            });
          });
        });

        Tools.each(newCellSizes, function (newCellSize) {
          editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
          editor.dom.setAttrib(newCellSize.cell, 'width', null);
        });
      }
    }
  });

  return {
    lazyResize: lazyResize,
    lazyWire: lazyWire,
    destroy: destroy
  };
};