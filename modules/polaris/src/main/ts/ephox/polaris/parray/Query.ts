import { Arr, Optional } from '@ephox/katamari';

import { PRange } from '../pattern/Types';

/**
 * Simple "is position within unit" utility function
 */
const inUnit = (unit: PRange, position: number): boolean => {
  return position >= unit.start && position <= unit.finish;
};

/**
 * Finds the unit in the PositionArray that contains this offset (if there is one)
 */
const get = <T extends PRange>(parray: T[], offset: number): Optional<T> => {
  return Arr.find(parray, (x) => {
    return inUnit(x, offset);
  });
};

const startindex = (parray: PRange[], offset: number): Optional<number> => {
  return Arr.findIndex(parray, (unit) => {
    return unit.start === offset;
  });
};

const tryend = (parray: PRange[], finish: number): number => {
  const finishes = parray[parray.length - 1] && parray[parray.length - 1].finish === finish;
  return finishes ? parray.length + 1 : -1;
};

/**
 * Extracts the pieces of the PositionArray that are bounded *exactly* on the start and finish offsets
 */
const sublist = <T extends PRange>(parray: T[], start: number, finish: number): T[] => {
  const first = startindex(parray, start);
  const rawlast = startindex(parray, finish);
  return first.bind((fIndex): Optional<T[]> => {
    const last = rawlast.getOr(tryend(parray, finish));
    return last > -1 ? Optional.some(parray.slice(fIndex, last)) : Optional.none();
  }).getOr([]);
};

const find = Arr.find;

export {
  get,
  find,
  inUnit,
  sublist
};
