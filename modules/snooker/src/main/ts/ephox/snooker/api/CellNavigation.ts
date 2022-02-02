import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';

import { CellLocation } from './CellLocation';
import * as TableLookup from './TableLookup';

interface NavigationInfo {
  readonly all: SugarElement<HTMLTableCellElement>[];
  readonly index: number;
}

type IsEligibleFn = (cell: SugarElement<HTMLTableCellElement>) => boolean;
type IsRootFn = (e: SugarElement<Node>) => boolean;

const enum Direction {
  Forwards = 1,
  Backwards = -1
}

/*
 *  Walk until the next eligible cell location is found, or the start/end of the table is found.
 */
const walk = (
  all: SugarElement<HTMLTableCellElement>[],
  current: SugarElement<HTMLTableCellElement>,
  index: number,
  direction: Direction,
  isEligible: IsEligibleFn = Fun.always
): CellLocation => {
  const forwards = direction === Direction.Forwards;
  if (!forwards && index <= 0) {
    return CellLocation.first(all[0]);
  } else if (forwards && index >= all.length - 1) {
    return CellLocation.last(all[all.length - 1]);
  } else {
    const newIndex = index + direction;
    const elem = all[newIndex];
    return isEligible(elem) ? CellLocation.middle(current, elem) : walk(all, current, newIndex, direction, isEligible);
  }
};

/*
 * Identify the index of the current cell within all the cells, and
 * a list of the cells within its table.
 */
const detect = (current: SugarElement<HTMLTableCellElement>, isRoot?: IsRootFn): Optional<NavigationInfo> => {
  return TableLookup.table(current, isRoot).bind((table) => {
    const all = TableLookup.cells(table);
    const index = Arr.findIndex(all, (x) => Compare.eq(current, x));

    return index.map((index) => ({ index, all }));
  });
};

/*
 * Identify the CellLocation of the cell when navigating forward from current
 */
const next = (current: SugarElement<HTMLTableCellElement>, isEligible?: IsEligibleFn, isRoot?: IsRootFn): CellLocation => {
  const detection = detect(current, isRoot);
  return detection.fold(() => {
    return CellLocation.none(current);
  }, (info) => {
    return walk(info.all, current, info.index, Direction.Forwards, isEligible);
  });
};

/*
 * Identify the CellLocation of the cell when navigating back from current
 */
const prev = (current: SugarElement<HTMLTableCellElement>, isEligible?: IsEligibleFn, isRoot?: IsRootFn): CellLocation => {
  const detection = detect(current, isRoot);
  return detection.fold(() => {
    return CellLocation.none();
  }, (info) => {
    return walk(info.all, current, info.index, Direction.Backwards, isEligible);
  });
};

export {
  next,
  prev
};
