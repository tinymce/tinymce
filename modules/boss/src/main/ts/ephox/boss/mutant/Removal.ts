import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import Comparator from './Comparator';
import Detach from './Detach';
import Up from './Up';

const unwrap = function (item: Gene) {
  item.parent.each(function (parent) {
    const children = item.children;
    Arr.each(children, function (child) {
      child.parent = Option.some(parent);
    });

    const index = Arr.findIndex(parent.children, function (sibling) {
      return Comparator.eq(sibling, item);
    });

    index.fold(function () {
      parent.children = parent.children.concat(children);
    }, function (ind) {
      parent.children = parent.children.slice(0, ind).concat(children).concat(parent.children.slice(ind + 1));
    });
  });
};

const remove = function (item: Gene) {
  detach(item);
};

const detach = function (item: Gene) {
  Detach.detach(Up.top(item), item);
};

export default {
  unwrap,
  remove,
  detach
};