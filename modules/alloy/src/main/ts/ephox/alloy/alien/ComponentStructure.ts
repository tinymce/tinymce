import { Fun } from '@ephox/katamari';
import { Compare, PredicateExists, type SugarElement } from '@ephox/sugar';

import type { AlloyComponent } from '../api/component/ComponentApi';
import * as AriaControls from '../aria/AriaControls';
import type { AnchorSpec } from '../positioning/mode/Anchoring';

const isAriaPartOf = (component: AlloyComponent, queryElem: SugarElement<Node>): boolean =>
  AriaControls.find(queryElem).exists((owner) => isPartOf(component, owner));

const isPartOf = (component: AlloyComponent, queryElem: SugarElement<Node>): boolean =>
  PredicateExists.closest(queryElem, (el) => Compare.eq(el, component.element), Fun.never) || isAriaPartOf(component, queryElem);

const isPartOfAnchor = (anchor: AnchorSpec, queryElem: SugarElement<Node>): boolean =>
  anchor.type === 'hotspot' && isPartOf(anchor.hotspot, queryElem);

export {
  isPartOf,
  isPartOfAnchor
};
