import { Arr } from '@ephox/katamari';

import { PRange, PRegExp } from '../pattern/Types';
import * as Find from './Find';

const sort = <T extends PRange>(array: T[]): T[] => Arr.sort(array, (a, b) => a.start - b.start);

// Array needs to be sorted first
const removeOverlapped = <T extends PRange>(array: T[]): T[] => {
  const sorted = sort(array);

  return Arr.foldl(sorted, (acc, item) => {
    const overlaps = Arr.exists(acc, (a) => item.start >= a.start && item.finish <= a.finish);
    const matchingStartIndex = Arr.findIndex(acc, (a) => item.start === a.start).getOr(-1);

    if (!overlaps && matchingStartIndex === -1) {
      return [ ...acc, item ];
    }

    // We want to take the greater finish point in the acc if the start matches
    if (matchingStartIndex !== -1 && item.finish > acc[matchingStartIndex].finish) {
      const before = acc.slice(0, matchingStartIndex);
      const after = acc.slice(matchingStartIndex + 1);
      return [ ...before, item, ...after ];
    }

    return acc;
  }, [] as T[]);
};

/**
 * For each target (pattern, ....), find the matching text (if there is any) and record the start and end offsets.
 *
 * Then sort by start point and remove overlapping result.
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
  return removeOverlapped(unsorted);
};

export {
  search
};
