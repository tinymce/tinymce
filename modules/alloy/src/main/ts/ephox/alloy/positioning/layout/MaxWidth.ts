import { Fun } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';

// applies the max-width as determined by Bounder
const expandable = Fun.constant((element: SugarElement<HTMLElement>, available: number): void => {
  Width.setMax(element, Math.floor(available));
});

export { expandable };
