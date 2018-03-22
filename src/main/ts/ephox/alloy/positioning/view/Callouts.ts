import { Fun, Option } from '@ephox/katamari';
import { Classes, Css, Height, Width } from '@ephox/sugar';

import * as Origins from '../layout/Origins';
import * as Anchors from './Anchors';
import * as Bounder from './Bounder';

/*
 * This is the old repartee API. It is retained in a similar structure to the original form,
 * in case we decide to bring back the flexibility of working with non-standard positioning.
 */

const elementSize = function (p) {
  return {
    width: Fun.constant(Width.getOuter(p)),
    height: Fun.constant(Height.getOuter(p))
  };
};

const layout = function (anchorBox, element, bubbles, options) {
  // clear the potentially limiting factors before measuring
  Css.remove(element, 'max-height');

  const elementBox = elementSize(element);
  return Bounder.attempts(options.preference(), anchorBox, elementBox, bubbles, options.bounds());
};

const setClasses = function (element, decision) {
  Classes.remove(element, Anchors.all());
  Classes.add(element, decision.classes());
};

/*
 * maxHeightFunction is a MaxHeight instance.
 * max-height is usually the distance between the edge of the popup and the screen; top of popup to bottom of screen for south, bottom of popup to top of screen for north.
 *
 * There are a few cases where we specifically don't want a max-height, which is why it's optional.
 */
const setHeight = function (element, decision, options) {
  // The old API enforced MaxHeight.anchored() for fixed position. That no longer seems necessary.
  const maxHeightFunction = options.maxHeightFunction();

  maxHeightFunction(element, decision.maxHeight());
};

const position = function (element, decision, options) {
  const addPx = function (num) { return num + 'px'; };

  const newPosition = Origins.reposition(options.origin(), decision);
  Css.setOptions(element, {
    position: Option.some(newPosition.position()),
    left: newPosition.left().map(addPx),
    top: newPosition.top().map(addPx),
    right: newPosition.right().map(addPx),
    bottom: newPosition.bottom().map(addPx)
  });
};

export {
  layout,
  setClasses,
  setHeight,
  position
};