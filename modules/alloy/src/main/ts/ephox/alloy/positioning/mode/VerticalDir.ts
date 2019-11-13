import { PredicateExists, Node, Attr, Element } from '@ephox/sugar';

export const enum VerticalDir {
  TopToBottom = 'toptobottom',
  BottomToTop = 'bottomtotop'
}

const isBottomToTopDir = (el: Element) => {
  return PredicateExists.closest(el, (current) => {
    return Node.isElement(current) && Attr.get(current, 'data-vertical-dir') === VerticalDir.BottomToTop;
  });
};

export {
  isBottomToTopDir
};