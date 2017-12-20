import Comparator from './Comparator';
import Locator from './Locator';
import { Arr } from '@ephox/katamari';

var detach = function (root, target) {
  return Locator.byItem(root, target).bind(function (item) {
    return item.parent.bind(function (parent) {
      var index = Arr.findIndex(parent.children || [], function (child) {
        return Comparator.eq(child, item);
      });

      return index.map(function (ind) {
        parent.children = parent.children.slice(0, ind).concat(parent.children.slice(ind + 1));
        return item;
      });
    });
  });
};

export default <any> {
  detach: detach
};