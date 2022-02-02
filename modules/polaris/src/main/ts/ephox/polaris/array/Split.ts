import { Arr } from '@ephox/katamari';

import { Splitting } from '../api/Splitting';

/**
 * Split an array into chunks matched by the predicate
 */
const splitby = <T>(xs: T[], pred: (x: T) => boolean): T[][] => {
  return splitbyAdv(xs, (x) => {
    return pred(x) ? Splitting.excludeWithout(x) : Splitting.include(x);
  });
};

/**
 * Split an array into chunks matched by the predicate
 */
const splitbyAdv = <T>(xs: T[], pred: (x: T) => Splitting<T>): T[][] => {
  const r: T[][] = [];
  let part: T[] = [];
  Arr.each(xs, (x) => {
    const choice = pred(x);
    Splitting.cata(choice, () => {
      // Include in the current sublist.
      part.push(x);
    }, () => {
      // Stop the current sublist, create a new sublist containing just x, and then start the next sublist.
      if (part.length > 0) {
        r.push(part);
      }
      r.push([ x ]);
      part = [];
    }, () => {
      // Stop the current sublist, and start the next sublist.
      if (part.length > 0) {
        r.push(part);
      }
      part = [];
    });
  });

  if (part.length > 0) {
    r.push(part);
  }
  return r;
};

export {
  splitby,
  splitbyAdv
};
