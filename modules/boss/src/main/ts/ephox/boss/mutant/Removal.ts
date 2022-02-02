import { Arr, Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Detach from './Detach';
import * as Up from './Up';

const unwrap = (item: Gene): void => {
  item.parent.each((parent) => {
    const children = item.children;
    Arr.each(children, (child) => {
      child.parent = Optional.some(parent);
    });

    const index = Arr.findIndex(parent.children, (sibling) => {
      return Comparator.eq(sibling, item);
    });

    index.fold(() => {
      parent.children = parent.children.concat(children);
    }, (ind) => {
      parent.children = parent.children.slice(0, ind).concat(children).concat(parent.children.slice(ind + 1));
    });
  });
};

const remove = (item: Gene): void => {
  detach(item);
};

const detach = (item: Gene): void => {
  Detach.detach(Up.top(item), item);
};

export {
  unwrap,
  remove,
  detach
};
