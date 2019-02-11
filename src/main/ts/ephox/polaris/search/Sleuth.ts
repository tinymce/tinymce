import { Arr, Merger } from '@ephox/katamari';
import Find from './Find';

const sort = function (array) {
  const r = Array.prototype.slice.call(array, 0);
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
const search = function (text, targets) {
  const unsorted = Arr.bind(targets, function (t) {
    const results = Find.all(text, t.pattern());
    return Arr.map(results, function (r) {
      return Merger.merge(t, {
        start: r.start,
        finish: r.finish
      });
    });
  });

  return sort(unsorted);
};

export default {
  search
};