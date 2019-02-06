import { Arr } from '@ephox/katamari';
import { AriaGrid } from '@ephox/echo';
import { AriaRegister } from '@ephox/echo';
import { Fun } from '@ephox/katamari';
import { Event } from '@ephox/porkbun';
import { Events } from '@ephox/porkbun';
import Structs from '../api/Structs';
import PickerLookup from './PickerLookup';
import PickerStyles from './PickerStyles';
import Redimension from './Redimension';
import Styles from '../style/Styles';
import Util from '../util/Util';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Classes } from '@ephox/sugar';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Focus } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { MouseEvent } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';



export default function (direction, settings, helpReference) {
  var events = Events.create({
    select: Event(['rows', 'cols', 'rowHeaders', 'columnHeaders'])
  });

  var table = Element.fromTag('table');
  AriaRegister.presentation(table);
  AriaRegister.hidden(table, true);
  Class.add(table, PickerStyles.table());

  var tbody = Element.fromTag('tbody');
  Insert.append(table, tbody);


  var size = { width: 0, height: 0};

  var element = function() {
    return table;
  };

  var destroy = function() {
    clicker.unbind();
    mover.unbind();
    Remove.remove(table);
  };

  var setSize = function (numRows, numCols) {
    size = { width: numCols, height: numRows };
    recreate();
  };

  var recreate = function () {
    Remove.empty(tbody);
    var ids = helpReference.ids();
    //create a set of trs, then for each tr, insert numCols tds
    Util.repeat(size.height, function (rowNum) {
      var row = Element.fromTag('tr');
      Class.add(row, PickerStyles.row());

      var cells = Util.repeat(size.width, function (colNum) {
        var td = Element.fromTag('td');
        // this is mostly for debugging, but it's nice to have
        Class.add(td, Styles.resolve('cell-' + colNum + '-' + rowNum));
        Class.add(td, PickerStyles.cell());

        var btn = Element.fromTag('button');
        // Make the button a "button" so that firefox does not have problems with defaulting to submit: "TBIO-2560"
        Attr.set(btn, 'type', 'button');
        Attr.set(btn, 'aria-labelledby', ids[rowNum][colNum]);
        Class.add(btn, PickerStyles.button());
        Insert.append(td, btn);
        return td;
      });

      InsertAll.append(row, cells);
      Insert.append(tbody, row);
    });
  };

  var refresh = function () {
    var selected = getSelection();
    recreate();
    return setSelection(selected.rows(), selected.columns());
  };

  var setHeaders = function (headerRows, headerCols) {
    Attr.set(table, 'data-picker-header-row', headerRows);
    Attr.set(table, 'data-picker-header-col', headerCols);
  };

  var inHeader = function (row, column) {
    var headers = PickerLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
    return row < headers.rows() || column < headers.columns();
  };

  var setSelection = function(numRows, numCols) {
    var allCells = PickerLookup.cells(table);
    Arr.each(allCells, function(cell) {
      Class.remove(cell, Styles.resolve('picker-selected'));
    });

    var rows = PickerLookup.rows(table).slice(0, numRows);
    Arr.each(rows, function (row, rindex) {
      var cells = PickerLookup.cells(row).slice(0, numCols);
      Arr.each(cells, function (cell, cindex) {
        var classes = inHeader(rindex, cindex) ? [ Styles.resolve('picker-selected'), Styles.resolve('picker-header') ] : [ Styles.resolve('picker-selected') ];
        Classes.add(cell, classes);
      });
    });

    Attr.set(table, 'data-picker-col', numCols - 1);
    Attr.set(table, 'data-picker-row', numRows - 1);

    var cells = PickerLookup.cells(rows[rows.length-1]).slice(0, numCols);
    var target = cells[cells.length-1];
    return PickerLookup.button(target);
  };

  var getSelection = function () {
    var cols = parseInt(Attr.get(table, 'data-picker-col'), 10) + 1;
    var rows = parseInt(Attr.get(table, 'data-picker-row'), 10) + 1;
    return Structs.grid(rows, cols);
  };

  var sizeApi = {
    element: Fun.constant(table),
    setSelection: setSelection,
    setSize: setSize
  };

  var redimension = Redimension(direction, settings);
  var mover = DomEvent.bind(table, 'mousemove', function (event) {
    redimension.mousemove(sizeApi, Structs.grid(size.height, size.width), event.raw().pageX, event.raw().pageY);
  });

  var resize = function (xDelta, yDelta) {
    redimension.manual(sizeApi, getSelection(), xDelta, yDelta);
  };

  // Firefox fires mouse events when you press space on a button, so make sure we have a real click
  var clicker = MouseEvent.realClick.bind(table, function (event) {
    execute();
    event.raw().preventDefault();
  });

  var execute = function () {
    var result = PickerLookup.grid(table, 'data-picker-row', 'data-picker-col');
    var headers = PickerLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
    events.trigger.select(result.rows() + 1, result.columns() + 1, headers.rows(), headers.columns());
  };

  var reset = function () {
    setSize(settings.minRows, settings.minCols);
    var last = setSelection(1, 1);
    Focus.focus(last);
  };

  return {
    element: element,
    destroy: destroy,
    setSize: setSize,
    setHeaders: setHeaders,
    setSelection: setSelection,
    on: redimension.on,
    off: redimension.off,
    reset: reset,
    refresh: refresh,
    events: events.registry,

    sendLeft: Fun.curry(resize, direction.isRtl() ? +1 : -1, 0),
    sendRight: Fun.curry(resize, direction.isRtl() ? -1 : +1, 0),
    sendUp: Fun.curry(resize, 0, -1),
    sendDown: Fun.curry(resize, 0, +1),
    sendExecute: execute
  };
};