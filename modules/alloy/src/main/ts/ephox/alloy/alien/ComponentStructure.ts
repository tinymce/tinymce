import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AriaOwner from '../aria/AriaOwner';
import { AnchorSpec } from '../positioning/mode/Anchoring';

const isAriaPartOf = (component: AlloyComponent, queryElem: SugarElement): boolean =>
  AriaOwner.find(queryElem).exists((owner: SugarElement) => isPartOf(component, owner));

const isPartOf = (component: AlloyComponent, queryElem: SugarElement): boolean =>
  PredicateExists.closest(queryElem, (el: SugarElement) => Compare.eq(el, component.element), Fun.never) || isAriaPartOf(component, queryElem);

const isPartOfAnchor = (anchor: AnchorSpec, queryElem: SugarElement): boolean =>
  anchor.type === 'hotspot' && isPartOf(anchor.hotspot, queryElem);

export {
  isPartOf,
  isPartOfAnchor
};
