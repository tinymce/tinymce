import { Arr } from '@ephox/katamari';

/**
 * Slice an array at the first item matched by the predicate
 */
const sliceby = function <T> (list: T[], pred: (x: T, i: number) => boolean) {
  const index = Arr.findIndex(list, pred).getOr(-1);
  return list.slice(0, index);
};

export {
  sliceby
};
