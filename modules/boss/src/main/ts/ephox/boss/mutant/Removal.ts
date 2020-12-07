import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Detach from './Detach';
import * as Up from './Up';

const unwrap = function (item: Gene): void {
  item.parent.each(function (parent) {
    const children = item.children;
    Arr.each(children, function (child) {
      child.parent = Optional.some(parent);
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

const remove = function (item: Gene): void {
  detach(item);
};

const detach = function (item: Gene): void {
  Detach.detach(Up.top(item), item);
};

export {
  unwrap,
  remove,
  detach
};
