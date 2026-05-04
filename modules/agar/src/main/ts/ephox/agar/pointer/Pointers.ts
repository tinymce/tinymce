import { Fun } from '@ephox/katamari';
import { type SugarElement, SugarLocation, SugarNode, SugarPosition } from '@ephox/sugar';

interface Settings {
  // used to tweak the location before firing the event
  dx?: number;
  dy?: number;
  // settings for the event itself
  button?: number;
  buttons?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  bubbles?: boolean;
  cancelable?: boolean;
  detail?: number;
  // pointer-specific settings
  pointerId?: number;
  width?: number;
  height?: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  isPrimary?: boolean;
}

// Types of events
type EventType = 'pointerdown' | 'pointerup' | 'pointermove';

// Fire an event
const event = (type: EventType, { dx, dy, ...settings }: Settings) => (element: SugarElement<Node>): void => {
  const basePosition = SugarNode.isElement(element) ? SugarLocation.absolute(element) : SugarPosition(0, 0);
  const location = basePosition.translate(dx ?? 0, dy ?? 0);
  const event = new window.PointerEvent(type, {
    screenX: location.left,
    screenY: location.top,
    clientX: location.left,
    clientY: location.top,
    bubbles: true,
    cancelable: true,
    ...settings
  });
  element.dom.dispatchEvent(event);
};

const pointerDown = Fun.curry(event, 'pointerdown');
const pointerUp = Fun.curry(event, 'pointerup');
const pointerMove = Fun.curry(event, 'pointermove');

export type { Settings, EventType };
export {
  event,
  pointerDown,
  pointerUp,
  pointerMove
};
