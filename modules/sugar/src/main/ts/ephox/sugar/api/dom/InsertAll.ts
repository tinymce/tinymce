import { Node as DomNode } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Element from '../node/Element';
import * as Insert from './Insert';

const before = (marker: Element<DomNode>, elements: Element<DomNode>[]) => {
  Arr.each(elements, (x) => {
    Insert.before(marker, x);
  });
};

const after = (marker: Element<DomNode>, elements: Element<DomNode>[]) => {
  Arr.each(elements, (x, i) => {
    const e = i === 0 ? marker : elements[i - 1];
    Insert.after(e, x);
  });
};

const prepend = (parent: Element<DomNode>, elements: Element<DomNode>[]) => {
  Arr.each(elements.slice().reverse(), (x) => {
    Insert.prepend(parent, x);
  });
};

const append = (parent: Element<DomNode>, elements: Element<DomNode>[]) => {
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
