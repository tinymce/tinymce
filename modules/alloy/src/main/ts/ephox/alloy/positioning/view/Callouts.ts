import { Fun } from '@ephox/katamari';
import { Classes, Css, Element, Height, Width } from '@ephox/sugar';

import { Bubble } from '../layout/Bubble';
import { AnchorBox, AnchorElement } from '../layout/LayoutTypes';
import * as Origins from '../layout/Origins';
import { ReparteeOptions } from '../layout/SimpleLayout';
import * as Bounder from './Bounder';
import { RepositionDecision } from './Reposition';
import { applyPositionCss } from './PositionCss';

/*
 * This is the old repartee API. It is retained in a similar structure to the original form,
 * in case we decide to bring back the flexibility of working with non-standard positioning.
 */

const elementSize = (p: Element): AnchorElement => {
  return {
    width: Fun.constant(Width.getOuter(p)),
    height: Fun.constant(Height.getOuter(p))
  };
};

const layout = (anchorBox: AnchorBox, element: Element, bubbles: Bubble, options: ReparteeOptions) => {
  // clear the potentially limiting factors before measuring
  Css.remove(element, 'max-height');
  Css.remove(element, 'max-width');

  const elementBox = elementSize(element);
  return Bounder.attempts(options.preference(), anchorBox, elementBox, bubbles, options.bounds());
};

const setClasses = (element: Element, decision: RepositionDecision) => {
  const classInfo = decision.classes();
  Classes.remove(element, classInfo.off);
  Classes.add(element, classInfo.on);
};

/*
 * maxHeightFunction is a MaxHeight instance.
 * max-height is usually the distance between the edge of the popup and the screen; top of popup to bottom of screen for south, bottom of popup to top of screen for north.
 *
 * There are a few cases where we specifically don't want a max-height, which is why it's optional.
 */
const setHeight = (element: Element, decision: RepositionDecision, options: ReparteeOptions) => {
  // The old API enforced MaxHeight.anchored() for fixed position. That no longer seems necessary.
  const maxHeightFunction = options.maxHeightFunction();

  maxHeightFunction(element, decision.maxHeight());
};

const setWidth = (element: Element, decision: RepositionDecision, options: ReparteeOptions) => {
  const maxWidthFunction = options.maxWidthFunction();
  maxWidthFunction(element, decision.maxWidth());
};

const position = (element: Element, decision: RepositionDecision, options: ReparteeOptions) => {
  // This is a point of difference between Alloy and Repartee. Repartee appears to use Measure to calculate the available space for fixed origin
  // That is not ported yet.
  applyPositionCss(element, Origins.reposition(options.origin(), decision));
};

export {
  layout,
  setClasses,
  setHeight,
  setWidth,
  position
};
