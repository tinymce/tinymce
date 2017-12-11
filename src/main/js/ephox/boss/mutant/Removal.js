import Comparator from './Comparator';
import Detach from './Detach';
import Up from './Up';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var unwrap = function (item) {
  item.parent.each(function (parent) {
    var children = item.children;
    Arr.each(children, function (child) {
      child.parent = Option.some(parent);
    });

    var index = Arr.findIndex(parent.children, function (sibling) {
      return Comparator.eq(sibling, item);
    });

    index.fold(function () {
      parent.children = parent.children.concat(children);
    }, function (ind) {
      parent.children = parent.children.slice(0, ind).concat(children).concat(parent.children.slice(ind + 1));
    });
  });
};

var remove = function (item) {
  detach(item);
};

var detach = function (item) {
  Detach.detach(Up.top(item), item);
};

export default <any> {
  unwrap: unwrap,
  remove: remove,
  detach: detach
};