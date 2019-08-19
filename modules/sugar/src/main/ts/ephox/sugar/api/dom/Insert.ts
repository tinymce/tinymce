import * as Traverse from '../search/Traverse';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

const before = function (marker: Element<DomNode>, element: Element<DomNode>) {
  const parent = Traverse.parent(marker);
  parent.each(function (v) {
    v.dom().insertBefore(element.dom(), marker.dom());
  });
};

const after = function (marker: Element<DomNode>, element: Element<DomNode>) {
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

const prepend = function (parent: Element<DomNode>, element: Element<DomNode>) {
  const firstChild = Traverse.firstChild(parent);
  firstChild.fold(function () {
    append(parent, element);
  }, function (v) {
    parent.dom().insertBefore(element.dom(), v.dom());
  });
};

const append = function (parent: Element<DomNode>, element: Element<DomNode>) {
  parent.dom().appendChild(element.dom());
};

const appendAt = function (parent: Element<DomNode>, element: Element<DomNode>, index: number) {
  Traverse.child(parent, index).fold(function () {
    append(parent, element);
  }, function (v) {
    before(v, element);
  });
};

const wrap = function (element: Element<DomNode>, wrapper: Element<DomNode>) {
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