import { SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

export interface ElementAndOffset<T extends Node> {
  readonly element: SugarElement<T>;
  readonly offset: number;
}

const point = <T extends Node> (element: SugarElement<T>, offset: number): ElementAndOffset<T> => ({
  element,
  offset
});

// NOTE: This only descends once.
const descendOnce = (element: SugarElement<Node>, offset: number): ElementAndOffset<Node> => {
  const children = Traverse.children(element);
  if (children.length === 0) {
    return point(element, offset);
  } else if (offset < children.length) {
    return point(children[offset], 0);
  } else {
    const last = children[children.length - 1];
    const len = SugarNode.isText(last) ? SugarText.get(last).length : Traverse.children(last).length;
    return point(last, len);
  }
};

export {
  point,
  descendOnce
};
