import { Fun } from '@ephox/katamari';
import { Css, Height, Element } from '@ephox/sugar';

// applies the max-height as determined by Bounder
const setMaxHeight = (element: Element, maxHeight: number): void => {
  Height.setMax(element, Math.floor(maxHeight));
};

// adds both max-height and overflow to constrain it
const anchored = Fun.constant((element: Element, available: number): void => {
  setMaxHeight(element, available);
  Css.setAll(element, {
    'overflow-x': 'hidden',
    'overflow-y': 'auto'
  });
});

/*
 * This adds max height, but not overflow - the effect of this is that elements can grow beyond the max height,
 * but if they run off the top they're pushed down.
 *
 * If the element expands below the screen height it will be cut off, but we were already doing that.
 */
const expandable = Fun.constant((element: Element, available: number): void => {
  setMaxHeight(element, available);
});

export {
  anchored,
  expandable
};