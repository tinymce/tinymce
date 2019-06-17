import { AriaRegister, AriaGrid } from '@ephox/echo';
import { Arr, Fun } from '@ephox/katamari';
import { Event, Events, Bindable } from '@ephox/porkbun';
import { Attr, Class, Classes, DomEvent, Element, Focus, Insert, InsertAll, MouseEvent, Remove } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import Styles from '../style/Styles';
import * as Util from '../util/Util';
import PickerLookup from './PickerLookup';
import PickerStyles from './PickerStyles';
import { Redimension, ATableApi } from './Redimension';
import { SizingSettings } from './Sizing';
import { MouseEvent as DomMouseEvent } from '@ephox/dom-globals';
import { PickerDirection } from '../api/PickerDirection';

export interface PickerSelectEvent {
  rows: () => number;
  cols: () => number;
  rowHeaders: () => number;
  columnHeaders: () => number;
}

interface PickerEvents {
  registry: {
    select: Bindable<PickerSelectEvent>
  };
  trigger: {
    select: (rows: number, cols: number, rowHeaders: number, columnHeaders: number) => void;
  };
}

export const PickerUi = function (direction: PickerDirection, settings: SizingSettings, helpReference: AriaGrid) {
  const events = Events.create({
    select: Event(['rows', 'cols', 'rowHeaders', 'columnHeaders'])
  }) as PickerEvents;

  const table = Element.fromTag('table');
  AriaRegister.presentation(table);
  AriaRegister.hidden(table, true);
  Class.add(table, PickerStyles.table());

  const tbody = Element.fromTag('tbody');
  Insert.append(table, tbody);

  let size = { width: 0, height: 0};

  const element = function () {
    return table;
  };

  const destroy = function () {
    clicker.unbind();
    mover.unbind();
    Remove.remove(table);
  };

  const setSize = function (numRows: number, numCols: number) {
    size = { width: numCols, height: numRows };
    recreate();
  };

  const recreate = function () {
    Remove.empty(tbody);
    const ids = helpReference.ids();
    // create a set of trs, then for each tr, insert numCols tds
    Util.repeat(size.height, function (rowNum) {
      const row = Element.fromTag('tr');
      Class.add(row, PickerStyles.row());

      const cells = Util.repeat(size.width, function (colNum) {
        const td = Element.fromTag('td');
        // this is mostly for debugging, but it's nice to have
        Class.add(td, Styles.resolve('cell-' + colNum + '-' + rowNum));
        Class.add(td, PickerStyles.cell());

        const btn = Element.fromTag('button');
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

  const refresh = function () {
    const selected = getSelection();
    recreate();
    return setSelection(selected.rows(), selected.columns());
  };

  const setHeaders = function (headerRows: number, headerCols: number) {
    Attr.set(table, 'data-picker-header-row', headerRows);
    Attr.set(table, 'data-picker-header-col', headerCols);
  };

  const inHeader = function (row: number, column: number) {
    const headers = PickerLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
    return row < headers.rows() || column < headers.columns();
  };

  const setSelection = function (numRows: number, numCols: number) {
    const allCells = PickerLookup.cells(table);
    Arr.each(allCells, function (cell) {
      Class.remove(cell, Styles.resolve('picker-selected'));
    });

    const rows = PickerLookup.rows(table).slice(0, numRows);
    Arr.each(rows, function (row, rindex) {
      const cs = PickerLookup.cells(row).slice(0, numCols);
      Arr.each(cs, function (cell, cindex) {
        const classes = inHeader(rindex, cindex) ? [ Styles.resolve('picker-selected'), Styles.resolve('picker-header') ] : [ Styles.resolve('picker-selected') ];
        Classes.add(cell, classes);
      });
    });

    Attr.set(table, 'data-picker-col', numCols - 1);
    Attr.set(table, 'data-picker-row', numRows - 1);

    const cells = PickerLookup.cells(rows[rows.length - 1]).slice(0, numCols);
    const target = cells[cells.length - 1];
    return PickerLookup.button(target);
  };

  const getSelection = function () {
    const cols = parseInt(Attr.get(table, 'data-picker-col'), 10) + 1;
    const rows = parseInt(Attr.get(table, 'data-picker-row'), 10) + 1;
    return Structs.grid(rows, cols);
  };

  const sizeApi: ATableApi = {
    element: Fun.constant(table),
    setSelection,
    setSize
  };

  const redimension = Redimension(direction, settings);
  const mover = DomEvent.bind(table, 'mousemove', function (event) {
    redimension.mousemove(sizeApi, Structs.grid(size.height, size.width), event.raw().pageX, event.raw().pageY);
  });

  const resize = function (xDelta: number, yDelta: number) {
    redimension.manual(sizeApi, getSelection(), xDelta, yDelta);
  };

  // Firefox fires mouse events when you press space on a button, so make sure we have a real click
  const clicker = MouseEvent.realClick.bind(table, function (event) {
    execute();
    (event.raw() as DomMouseEvent).preventDefault();
  });

  const execute = function () {
    const result = PickerLookup.grid(table, 'data-picker-row', 'data-picker-col');
    const headers = PickerLookup.grid(table, 'data-picker-header-row', 'data-picker-header-col');
    events.trigger.select(result.rows() + 1, result.columns() + 1, headers.rows(), headers.columns());
  };

  const reset = function () {
    setSize(settings.minRows, settings.minCols);
    const last = setSelection(1, 1);
    Focus.focus(last);
  };

  return {
    element,
    destroy,
    setSize,
    setHeaders,
    setSelection,
    on: redimension.on,
    off: redimension.off,
    reset,
    refresh,
    events: events.registry,

    sendLeft: Fun.curry(resize, direction.isRtl() ? +1 : -1, 0),
    sendRight: Fun.curry(resize, direction.isRtl() ? -1 : +1, 0),
    sendUp: Fun.curry(resize, 0, -1),
    sendDown: Fun.curry(resize, 0, +1),
    sendExecute: execute
  };
};