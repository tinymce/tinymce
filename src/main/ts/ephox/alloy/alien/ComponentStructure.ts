import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists } from '@ephox/sugar';

import * as AriaOwner from '../aria/AriaOwner';

const isAriaPartOf = function (component, queryElem) {
  return AriaOwner.find(queryElem).exists(function (owner) {
    return isPartOf(component, owner);
  });
};

const isPartOf = function (component, queryElem) {
  return PredicateExists.closest(queryElem, function (el) {
    return Compare.eq(el, component.element());
  }, Fun.constant(false)) || isAriaPartOf(component, queryElem);
};

const isPartOfAnchor = function (anchor, queryElem) {
  return anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);
};

export {
  isPartOf,
  isPartOfAnchor
};