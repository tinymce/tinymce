import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists } from '@ephox/sugar';

import * as AriaOwner from '../aria/AriaOwner';
import { AlloyComponent } from '../api/component/ComponentApi';
import { SugarElement } from '../api/Main';

const isAriaPartOf = (component: AlloyComponent, queryElem: SugarElement): boolean => {
  return AriaOwner.find(queryElem).exists((owner: SugarElement) => {
    return isPartOf(component, owner);
  });
};

const isPartOf = (component: AlloyComponent, queryElem: SugarElement): boolean => {
  return PredicateExists.closest(queryElem, (el: SugarElement) => {
    return Compare.eq(el, component.element());
  }, Fun.constant(false)) || isAriaPartOf(component, queryElem);
};

// TYPIFY (anchors)
type Anchor = Record<string, any>;
const isPartOfAnchor = (anchor: Anchor, queryElem): boolean => {
  return anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);
};

export {
  isPartOf,
  isPartOfAnchor
};