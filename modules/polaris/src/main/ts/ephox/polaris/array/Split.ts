import { Arr } from '@ephox/katamari';
import { Splitting } from '../api/Splitting';

/**
 * Split an array into chunks matched by the predicate
 */
const splitby = function <T> (xs: T[], pred: (x: T) => boolean) {
  return splitbyAdv(xs, function (x) {
    return pred(x) ? Splitting.excludeWithout(x) : Splitting.include(x);
  });
};

/**
 * Split an array into chunks matched by the predicate
 */
const splitbyAdv = function <T> (xs: T[], pred: (x: T) => Splitting<T>) {
  const r: T[][] = [];
  let part: T[] = [];
  Arr.each(xs, function (x) {
    const choice = pred(x);
    Splitting.cata(choice, function () {
      // Include in the current sublist.
      part.push(x);
    }, function () {
      // Stop the current sublist, create a new sublist containing just x, and then start the next sublist.
      if (part.length > 0) { r.push(part); }
      r.push([ x ]);
      part = [];
    }, function () {
      // Stop the current sublist, and start the next sublist.
      if (part.length > 0) { r.push(part); }
      part = [];
    });
  });

  if (part.length > 0) { r.push(part); }
  return r;
};

export {
  splitby,
  splitbyAdv
};