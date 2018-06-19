import { Arr } from '@ephox/katamari';
import Insert from './Insert';
import Element from '../node/Element';

var before = function (marker: Element, elements: Element[]) {
  Arr.each(elements, function (x) {
    Insert.before(marker, x);
  });
};

var after = function (marker: Element, elements: Element[]) {
  Arr.each(elements, function (x, i) {
    var e = i === 0 ? marker : elements[i - 1];
    Insert.after(e, x);
  });
};

var prepend = function (parent: Element, elements: Element[]) {
  Arr.each(elements.slice().reverse(), function (x) {
    Insert.prepend(parent, x);
  });
};

var append = function (parent: Element, elements: Element[]) {
  Arr.each(elements, function (x) {
    Insert.append(parent, x);
  });
};

export default {
  before,
  after,
  prepend,
  append,
};