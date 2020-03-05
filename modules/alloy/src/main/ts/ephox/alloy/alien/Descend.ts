import { Node, Text, Traverse, Element } from '@ephox/sugar';

export interface ElementAndOffset<T> {
  readonly element: Element;
  readonly offset: number;
}

const point = <T> (element: Element<T>, offset: number): ElementAndOffset<T> => ({
  element,
  offset
});

// NOTE: This only descends once.
const descendOnce = <T> (element: Element, offset: number): ElementAndOffset<T> => {
  const children: Element[] = Traverse.children(element);
  if (children.length === 0) { return point(element, offset); } else if (offset < children.length) { return point(children[offset], 0); } else {
    const last = children[children.length - 1];
    const len = Node.isText(last) ? Text.get(last).length : Traverse.children(last).length;
    return point(last, len);
  }
};

export {
  point,
  descendOnce
};
