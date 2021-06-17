import { Arr } from '@ephox/katamari';

import { PRange, PRegExp } from '../pattern/Types';
import * as Find from './Find';

const sort = <T extends PRange>(array: T[]): T[] => {
  const r: T[] = Array.prototype.slice.call(array, 0);
  r.sort((a, b) => {
    if (a.start < b.start) {
      return -1;
    } else if (b.start < a.start) {
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
const search = <T extends { pattern: PRegExp }>(text: string, targets: T[]): Array<T & PRange> => {
  const unsorted = Arr.bind(targets, (t) => {
    const results = Find.all(text, t.pattern);
    return Arr.map(results, (r) => {
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
