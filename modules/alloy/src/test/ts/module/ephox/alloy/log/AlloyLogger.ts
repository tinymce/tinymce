import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

// Used for atomic testing where window is not available.
const element: <T>(elem: SugarElement<T>) => SugarElement<T> = Fun.identity;

export {
  element
};
