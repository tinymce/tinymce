import { PredicateExists, Node, Attr, Element } from '@ephox/sugar';

export enum AttributeValue {
  TopToBottom = 'toptobottom',
  BottomToTop = 'bottomtotop'
}

export const Attribute = 'data-alloy-vertical-dir';

const isBottomToTopDir = (el: Element) => PredicateExists.closest(el, (current) => Node.isElement(current) && Attr.get(current, Attribute) === AttributeValue.BottomToTop);

export {
  isBottomToTopDir
};