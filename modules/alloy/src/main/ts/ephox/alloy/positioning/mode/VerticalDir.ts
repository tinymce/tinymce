import { Attribute as Attrib, PredicateExists, SugarElement, SugarNode } from '@ephox/sugar';

export enum AttributeValue {
  TopToBottom = 'toptobottom',
  BottomToTop = 'bottomtotop'
}

export const Attribute = 'data-alloy-vertical-dir';

const isBottomToTopDir = (el: SugarElement<Element>): boolean => PredicateExists.closest(el, (current) =>
  SugarNode.isElement(current) && Attrib.get(current, 'data-alloy-vertical-dir') === AttributeValue.BottomToTop);

export {
  isBottomToTopDir
};
