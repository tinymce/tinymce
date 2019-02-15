import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Arrays, Splitting } from '@ephox/polaris';
import * as Extract from '../api/general/Extract';

/**
 * Return an array of arrays split by boundaries (exclude) or empty tags (include).
 */
const group = function <E, D>(universe: Universe<E, D>, items: E[], optimise?: (e: E) => boolean) {
  const extractions = Arr.bind(items, function (item) {
    return Extract.from(universe, item, optimise);
  });

  // TBIO-3432: Previously, we only split by boundaries. Now, we are splitting by
  // empty tags as well. However, we keep the empty tags.
  const segments = Arrays.splitbyAdv(extractions, function (item) {
    return item.match({
      boundary: () => Splitting.excludeWithout(item),
      empty: () => Splitting.excludeWith(item),
      text: () => Splitting.include(item)
    });
  });

  return Arr.filter(segments, function (x) { return x.length > 0; });
};

export {
  group
};