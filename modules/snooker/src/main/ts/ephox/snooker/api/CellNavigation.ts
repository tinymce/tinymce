import { Arr, Option } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';
import { CellLocation } from './CellLocation';
import * as TableLookup from './TableLookup';

/*
 * Identify the index of the current cell within all the cells, and
 * a list of the cells within its table.
 */
const detect = function (current: Element, isRoot?: (e: Element) => boolean): Option<{ all: Element[]; index: number }> {
  return TableLookup.table(current, isRoot).bind(function (table) {
    const all = TableLookup.cells(table);
    const index = Arr.findIndex(all, (x) => Compare.eq(current, x));

    return index.map((index) => ({ index, all }));
  });
};

/*
 * Identify the CellLocation of the cell when navigating forward from current
 */
const next = function (current: Element, isRoot?: (e: Element) => boolean) {
  const detection = detect(current, isRoot);
  return detection.fold(function () {
    return CellLocation.none(current);
  }, function (info) {
    return info.index + 1 < info.all.length ? CellLocation.middle(current, info.all[info.index + 1]) : CellLocation.last(current);
  });
};

/*
 * Identify the CellLocation of the cell when navigating back from current
 */
const prev = function (current: Element, isRoot?: (e: Element) => boolean): CellLocation {
  const detection = detect(current, isRoot);
  return detection.fold(function () {
    return CellLocation.none();
  }, function (info) {
    return info.index - 1 >= 0 ? CellLocation.middle(current, info.all[info.index - 1]) : CellLocation.first(current);
  });
};

export {
  next,
  prev
};
