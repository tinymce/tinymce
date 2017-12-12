import AriaOwner from '../aria/AriaOwner';
import { Fun } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { PredicateExists } from '@ephox/sugar';

var isAriaPartOf = function (component, queryElem) {
  return AriaOwner.find(queryElem).exists(function (owner) {
    return isPartOf(component, owner);
  });
};

var isPartOf = function (component, queryElem) {
  return PredicateExists.closest(queryElem, function (el) {
    return Compare.eq(el, component.element());
  }, Fun.constant(false)) || isAriaPartOf(component, queryElem);
};

var isPartOfAnchor = function (anchor, queryElem) {
  return anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);
};

export default <any> {
  isPartOf: isPartOf,
  isPartOfAnchor: isPartOfAnchor
};