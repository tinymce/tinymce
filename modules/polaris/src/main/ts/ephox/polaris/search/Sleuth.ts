import { Arr } from '@ephox/katamari';
import * as Find from './Find';
import { PRegExp, PRange } from '../pattern/Types';

const sort = function <T extends PRange> (array: T[]) {
  const r: T[] = Array.prototype.slice.call(array, 0);
  r.sort(function (a, b) {
    if (a.start() < b.start()) {
      return -1;
    } else if (b.start() < a.start()) {
      return 1;
    } else {
      return 0;
    }
  });
  return r;
};

/**
 * For each target (pattern, ....), find the matching text (if there is any) and record the start and end offsets.
 *
 * Then sort the result by start point.
 */
const search = function <T extends { pattern: () => PRegExp }> (text: string, targets: T[]) {
  const unsorted = Arr.bind(targets, function (t) {
    const results = Find.all(text, t.pattern());
    return Arr.map(results, function (r) {
      return {
        ...t,
        ...r
      };
    });
  });

  return sort(unsorted);
};

export {
  search
};