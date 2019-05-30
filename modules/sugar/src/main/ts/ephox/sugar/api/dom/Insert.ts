import * as Traverse from '../search/Traverse';
import Element from '../node/Element';

const before = function (marker: Element, element: Element) {
  const parent = Traverse.parent(marker);
  parent.each(function (v) {
    v.dom().insertBefore(element.dom(), marker.dom());
  });
};

const after = function (marker: Element, element: Element) {
  const sibling = Traverse.nextSibling(marker);
  sibling.fold(function () {
    const parent = Traverse.parent(marker);
    parent.each(function (v) {
      append(v, element);
    });
  }, function (v) {
    before(v, element);
  });
};

const prepend = function (parent: Element, element: Element) {
  const firstChild = Traverse.firstChild(parent);
  firstChild.fold(function () {
    append(parent, element);
  }, function (v) {
    parent.dom().insertBefore(element.dom(), v.dom());
  });
};

const append = function (parent: Element, element: Element) {
  parent.dom().appendChild(element.dom());
};

const appendAt = function (parent: Element, element: Element, index: number) {
  Traverse.child(parent, index).fold(function () {
    append(parent, element);
  }, function (v) {
    before(v, element);
  });
};

const wrap = function (element: Element, wrapper: Element) {
  before(element, wrapper);
  append(wrapper, element);
};

export {
  before,
  after,
  prepend,
  append,
  appendAt,
  wrap,
};