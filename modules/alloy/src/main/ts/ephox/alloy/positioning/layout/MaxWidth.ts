import { Fun } from '@ephox/katamari';
import { Element, Width } from '@ephox/sugar';

// applies the max-width as determined by Bounder
const setMaxWidth = (element: Element, maxWidth: number): void => {
  Width.setMax(element, Math.floor(maxWidth));
};

// adds both max-width and overflow to constrain it
const anchored = Fun.constant((element: Element, available: number): void => {
  setMaxWidth(element, available);
  // Css.setAll(element, {
  //   'overflow-x': 'hidden',
  //   'overflow-y': 'auto'
  // });
});

export { anchored, };
