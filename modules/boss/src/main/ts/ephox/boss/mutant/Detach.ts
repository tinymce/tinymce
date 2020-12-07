import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Locator from './Locator';

const detach = function (root: Gene, target: Gene): Optional<Gene> {
  return Locator.byItem(root, target).bind(function (item) {
    return item.parent.bind(function (parent) {
      const index = Arr.findIndex(parent.children || [], function (child) {
        return Comparator.eq(child, item);
      });

      return index.map(function (ind) {
        parent.children = parent.children.slice(0, ind).concat(parent.children.slice(ind + 1));
        return item;
      });
    });
  });
};

export {
  detach
};
