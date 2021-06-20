import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

// Used for atomic testing where window is not available.
const element: (elem: SugarElement) => SugarElement = Fun.identity;

export {
  element
};
