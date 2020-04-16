import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';

const before = (marker: Element<DomNode>, element: Element<DomNode>) => {
  const parent = Traverse.parent(marker);
  parent.each((v) => {
    v.dom().insertBefore(element.dom(), marker.dom());
  });
};

const after = (marker: Element<DomNode>, element: Element<DomNode>) => {
  const sibling = Traverse.nextSibling(marker);
  sibling.fold(() => {
    const parent = Traverse.parent(marker);
    parent.each((v) => {
      append(v, element);
    });
  }, (v) => {
    before(v, element);
  });
};

const prepend = (parent: Element<DomNode>, element: Element<DomNode>) => {
  const firstChild = Traverse.firstChild(parent);
  firstChild.fold(() => {
    append(parent, element);
  }, (v) => {
    parent.dom().insertBefore(element.dom(), v.dom());
  });
};

const append = (parent: Element<DomNode>, element: Element<DomNode>) => {
  parent.dom().appendChild(element.dom());
};

const appendAt = (parent: Element<DomNode>, element: Element<DomNode>, index: number) => {
  Traverse.child(parent, index).fold(() => {
    append(parent, element);
  }, (v) => {
    before(v, element);
  });
};

const wrap = (element: Element<DomNode>, wrapper: Element<DomNode>) => {
  before(element, wrapper);
  append(wrapper, element);
};

export {
  before,
  after,
  prepend,
  append,
  appendAt,
  wrap
};
