import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { Arrays, Splitting } from '@ephox/polaris';

import { TypedItem } from '../api/data/TypedItem';
import * as Extract from '../api/general/Extract';

/**
 * Return an array of arrays split by boundaries (exclude) or empty tags (include).
 */
const group = <E, D>(universe: Universe<E, D>, items: E[], optimise?: (e: E) => boolean): TypedItem<E, D>[][] => {
  const extractions = Arr.bind(items, (item) => {
    return Extract.from(universe, item, optimise);
  });

  // TBIO-3432: Previously, we only split by boundaries. Now, we are splitting by
  // empty tags as well. However, we keep the empty tags.
  const segments = Arrays.splitbyAdv(extractions, (item) => {
    return item.match({
      boundary: () => Splitting.excludeWithout(item),
      empty: () => Splitting.excludeWith(item),
      text: () => Splitting.include(item),
      nonEditable: () => Splitting.excludeWithout(item)
    });
  });

  return Arr.filter(segments, (x) => {
    return x.length > 0;
  });
};

export {
  group
};
