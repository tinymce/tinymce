import { SugarElement } from '../node/SugarElement';
import * as Traverse from '../search/Traverse';

const before = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
  const parent = Traverse.parent(marker);
  parent.each((v) => {
    v.dom.insertBefore(element.dom, marker.dom);
  });
};

const after = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
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

const prepend = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  const firstChild = Traverse.firstChild(parent);
  firstChild.fold(() => {
    append(parent, element);
  }, (v) => {
    parent.dom.insertBefore(element.dom, v.dom);
  });
};

const append = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  parent.dom.appendChild(element.dom);
};

const appendAt = (parent: SugarElement<Node>, element: SugarElement<Node>, index: number): void => {
  Traverse.child(parent, index).fold(() => {
    append(parent, element);
  }, (v) => {
    before(v, element);
  });
};

const wrap = (element: SugarElement<Node>, wrapper: SugarElement<Node>): void => {
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
