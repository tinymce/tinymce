import { Arr } from '@ephox/katamari';
import * as Insert from './Insert';
import Element from '../node/Element';

const before = function (marker: Element, elements: Element[]) {
  Arr.each(elements, function (x) {
    Insert.before(marker, x);
  });
};

const after = function (marker: Element, elements: Element[]) {
  Arr.each(elements, function (x, i) {
    const e = i === 0 ? marker : elements[i - 1];
    Insert.after(e, x);
  });
};

const prepend = function (parent: Element, elements: Element[]) {
  Arr.each(elements.slice().reverse(), function (x) {
    Insert.prepend(parent, x);
  });
};

const append = function (parent: Element, elements: Element[]) {
  Arr.each(elements, function (x) {
    Insert.append(parent, x);
  });
};

export {
  before,
  after,
  prepend,
  append,
};