import { Classes, Css, Height, SugarElement, Width } from '@ephox/sugar';

import { Bubble } from '../layout/Bubble';
import { AnchorBox, AnchorElement } from '../layout/LayoutTypes';
import * as Origins from '../layout/Origins';
import * as Placement from '../layout/Placement';
import { ReparteeOptions } from '../layout/SimpleLayout';
import * as Bounder from './Bounder';
import { applyPositionCss } from './PositionCss';
import { RepositionDecision } from './Reposition';
import { applyTransitionCss } from './Transitions';

/*
 * This is the old repartee API. It is retained in a similar structure to the original form,
 * in case we decide to bring back the flexibility of working with non-standard positioning.
 */

const elementSize = (p: SugarElement<HTMLElement>): AnchorElement => ({
  width: Width.getOuter(p),
  height: Height.getOuter(p)
});

const layout = (anchorBox: AnchorBox, element: SugarElement<HTMLElement>, bubbles: Bubble, options: ReparteeOptions): RepositionDecision => {
  // clear the potentially limiting factors before measuring
  Css.remove(element, 'max-height');
  Css.remove(element, 'max-width');

  const elementBox = elementSize(element);
  return Bounder.attempts(element, options.preference, anchorBox, elementBox, bubbles, options.bounds);
};

const setClasses = (element: SugarElement<HTMLElement>, decision: RepositionDecision): void => {
  const classInfo = decision.classes;
  Classes.remove(element, classInfo.off);
  Classes.add(element, classInfo.on);
};

/*
 * maxHeightFunction is a MaxHeight instance.
 * max-height is usually the distance between the edge of the popup and the screen; top of popup to bottom of screen for south, bottom of popup to top of screen for north.
 *
 * There are a few cases where we specifically don't want a max-height, which is why it's optional.
 */
const setHeight = (element: SugarElement<HTMLElement>, decision: RepositionDecision, options: ReparteeOptions): void => {
  // The old API enforced MaxHeight.anchored() for fixed position. That no longer seems necessary.
  const maxHeightFunction = options.maxHeightFunction;

  maxHeightFunction(element, decision.maxHeight);
};

const setWidth = (element: SugarElement<HTMLElement>, decision: RepositionDecision, options: ReparteeOptions): void => {
  const maxWidthFunction = options.maxWidthFunction;
  maxWidthFunction(element, decision.maxWidth);
};

const position = (element: SugarElement<HTMLElement>, decision: RepositionDecision, options: ReparteeOptions): void => {
  // This is a point of difference between Alloy and Repartee. Repartee appears to use Measure to calculate the available space for fixed origin
  // That is not ported yet.
  const positionCss = Origins.reposition(options.origin, decision);
  options.transition.each((transition) => {
    applyTransitionCss(element, options.origin, positionCss, transition, decision, options.lastPlacement);
  });
  applyPositionCss(element, positionCss);
};

const setPlacement = (element: SugarElement<HTMLElement>, decision: RepositionDecision): void => {
  Placement.setPlacement(element, decision.placement);
};

export {
  layout,
  setClasses,
  setHeight,
  setWidth,
  position,
  setPlacement
};
