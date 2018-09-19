import { Struct } from '@ephox/katamari';

import { OriginAdt } from '../../behaviour/positioning/PositionApis';
import { AnchorBox } from '../../positioning/layout/Layout';
import * as Origins from './Origins';
import { window } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

/*
 * Smooths over the difference between passing an element anchor (which requires an origin to determine the box) and passing a box.
 *
 * It is only useful for fixed origins; relative needs to do everything the old way.
 */
export interface Anchor {
  anchorBox: () => AnchorBox;
  origin: () => OriginAdt;
}

const anchor: (anchorBox: AnchorBox, origin: OriginAdt) => Anchor = Struct.immutable('anchorBox', 'origin');

// This is not the nicest pattern, but it can't live in the Origins module while our console tests need to avoid DOM.
// The uiElement isn't passed into the other functions in order to clearly separate which parts need to know about it and which don't.
const relativeOrigin = (uiElement: Element): OriginAdt => {
  const bounds = uiElement.dom().getBoundingClientRect(); // TODO: THIS USED TO BE LOCATION.ABSOLUTE, check it TODO TODO

  // Relative calculations are all adjusted to be relative to Boxes.view() so the bounding client rect of the origin is all we need
  return Origins.relative(bounds.left, bounds.top, bounds.width, bounds.height);
};

const element = (anchorElement: Element, origin: OriginAdt): Anchor => {
  const anchorBox = Origins.toBox(origin, anchorElement);

  return anchor(anchorBox, origin);
};

const box = (anchorBox: AnchorBox, origin: OriginAdt): Anchor => {
  return anchor(anchorBox, origin);
};

export {
  box,
  element,
  relativeOrigin
};