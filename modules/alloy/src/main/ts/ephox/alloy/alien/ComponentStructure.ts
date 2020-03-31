import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists, Element } from '@ephox/sugar';

import * as AriaOwner from '../aria/AriaOwner';
import { AlloyComponent } from '../api/component/ComponentApi';
import { AnchorSpec } from '../positioning/mode/Anchoring';

const isAriaPartOf = (component: AlloyComponent, queryElem: Element): boolean => AriaOwner.find(queryElem).exists((owner: Element) => isPartOf(component, owner));

const isPartOf = (component: AlloyComponent, queryElem: Element): boolean => PredicateExists.closest(queryElem, (el: Element) => Compare.eq(el, component.element()), Fun.constant(false)) || isAriaPartOf(component, queryElem);

const isPartOfAnchor = (anchor: AnchorSpec, queryElem: Element): boolean => anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);

export {
  isPartOf,
  isPartOfAnchor
};