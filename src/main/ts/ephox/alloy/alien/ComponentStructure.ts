import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists, Element } from '@ephox/sugar';

import * as AriaOwner from '../aria/AriaOwner';
import { AlloyComponent } from '../api/component/ComponentApi';
import { AnchorSpec } from '../positioning/mode/Anchoring';

const isAriaPartOf = (component: AlloyComponent, queryElem: Element): boolean => {
  return AriaOwner.find(queryElem).exists((owner: Element) => {
    return isPartOf(component, owner);
  });
};

const isPartOf = (component: AlloyComponent, queryElem: Element): boolean => {
  return PredicateExists.closest(queryElem, (el: Element) => {
    return Compare.eq(el, component.element());
  }, Fun.constant(false)) || isAriaPartOf(component, queryElem);
};

const isPartOfAnchor = (anchor: AnchorSpec, queryElem: Element): boolean => {
  return anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);
};

export {
  isPartOf,
  isPartOfAnchor
};