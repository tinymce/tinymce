import { Arr } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as Insert from './Insert';

const before = (marker: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  Arr.each(elements, (x) => {
    Insert.before(marker, x);
  });
};

const after = (marker: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  Arr.each(elements, (x, i) => {
    const e = i === 0 ? marker : elements[i - 1];
    Insert.after(e, x);
  });
};

const prepend = (parent: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  Arr.each(elements.slice().reverse(), (x) => {
    Insert.prepend(parent, x);
  });
};

const append = (parent: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  Arr.each(elements, (x) => {
    Insert.append(parent, x);
  });
};

export {
  before,
  after,
  prepend,
  append
};
