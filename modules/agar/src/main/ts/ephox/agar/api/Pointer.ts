import { Fun } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import * as Pointers from '../pointer/Pointers';

const pointerDown = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerDown(settings)(element);
const pointerUp = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerUp(settings)(element);
const pointerMove = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerMove(settings)(element);
const pointerMoveBy = (element: SugarElement<Node>, dx: number, dy: number, settings: Omit<Pointers.Settings, 'dx' | 'dy'> = { }): void =>
  Pointers.pointerMove({ ...settings, dx, dy })(element);

interface MockPointerCaptureOptions {
  readonly setPointerCapture?: (pointerId: number) => void;
  readonly releasePointerCapture?: (pointerId: number) => void;
}

const pWithMockPointerCapture = async <T>(
  element: SugarElement<Element>,
  options: MockPointerCaptureOptions,
  callback: () => T | Promise<T>
): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalSetPointerCapture = element.dom.setPointerCapture;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalReleasePointerCapture = element.dom.releasePointerCapture;

  element.dom.setPointerCapture = options.setPointerCapture ?? Fun.noop;
  element.dom.releasePointerCapture = options.releasePointerCapture ?? Fun.noop;

  try {
    return await callback();
  } finally {
    element.dom.setPointerCapture = originalSetPointerCapture;
    element.dom.releasePointerCapture = originalReleasePointerCapture;
  }
};

const event = Pointers.event;

export {
  pointerDown,
  pointerUp,
  pointerMove,
  pointerMoveBy,
  pWithMockPointerCapture,
  event
};
