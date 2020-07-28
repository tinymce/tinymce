import { Fun, Obj } from '@ephox/katamari';
import { SugarElement, SugarLocation, SugarNode, SugarPosition } from '@ephox/sugar';

// The 'button' field of the mouse event - which button was pressed to create the event. Pick only one value. Not defined for mouseenter,
// mouseleave, mouseover, mouseout or mousemove.
const leftClickButton = 0;
const middleClickButton = 1;
const rightClickButton = 2;

// The 'buttons' field of the mouse event - which buttons *were already pressed* at the time the event fired. Forms a bitfield.
const leftClickButtons = 1;
const rightClickButtons = 2;
const middleClickButtons = 4;

// Settings for mouse events
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
}

// Types of events
type EventType = 'click' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseover' | 'mouseout' | 'contextmenu';

// Fire an event
const event = (type: EventType, { dx, dy, ...settings }: Settings) => (element: SugarElement<Node>) => {
  const location = (SugarNode.isElement(element) ? SugarLocation.absolute(element) : SugarPosition(0, 0)).translate(dx || 0, dy || 0);
  // IE doesn't support MouseEvent constructor
  if (typeof MouseEvent === 'function') {
    const event = new MouseEvent(type, {
      screenX: location.left,
      screenY: location.top,
      clientX: location.left,
      clientY: location.top,
      bubbles: true,
      cancelable: true,
      ...settings
    });
    element.dom.dispatchEvent(event);
  } else {
    // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
    const event: MouseEvent = (<Document> element.dom.ownerDocument).createEvent('MouseEvents');
    event.initMouseEvent(
      type,
      true, /* bubble */ true, /* cancelable */
      window, null,
      location.left, location.top, /* screen coordinates */
      location.left, location.top, /* client coordinates, hope they're the same */
      Obj.get(settings, 'ctrlKey').getOr(false), /* meta key */
      Obj.get(settings, 'shiftKey').getOr(false),
      Obj.get(settings, 'altKey').getOr(false),
      Obj.get(settings, 'metaKey').getOr(false),
      Obj.get(settings, 'button').getOr(0), /* button */
      null
    );
    element.dom.dispatchEvent(event);
  }
};

const click = (settings: Settings) => (element: SugarElement<Node>) => {
  const dom = element.dom;
  Obj.get(dom as any, 'click').fold(() => event('click', settings)(element), Fun.call);
};
const mouseDown = Fun.curry(event, 'mousedown');
const mouseUp = Fun.curry(event, 'mouseup');
const mouseMove = Fun.curry(event, 'mousemove');
const mouseOver = Fun.curry(event, 'mouseover');
const mouseOut = Fun.curry(event, 'mouseout');
const contextMenu = (settings: Settings) => event('contextmenu', { button: rightClickButton, ...settings });

// Note: This can be used for phantomjs.
const trigger = function (element: SugarElement<any>): any {
  const ele: HTMLElement = element.dom;
  if (ele.click !== undefined) {
    return ele.click();
  }
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  point('click', leftClickButton, element, 0, 0);
  return undefined;
};

const point = (type: string, button: number, element: SugarElement<any>, x: number, y: number): void => {
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  const ev: MouseEvent = (<Document> element.dom.ownerDocument).createEvent('MouseEvents');
  ev.initMouseEvent(
    type,
    true /* bubble */, true /* cancelable */,
    window, null,
    x, y, x, y, /* coordinates */
    false, false, false, false, /* modifier keys */
    button, null
  );
  element.dom.dispatchEvent(ev);
};

export {
  event,
  Settings,
  EventType,
  leftClickButton,
  middleClickButton,
  rightClickButton,
  leftClickButtons,
  rightClickButtons,
  middleClickButtons,
  click,
  mouseDown,
  mouseUp,
  mouseMove,
  mouseOver,
  mouseOut,
  contextMenu,
  // deprecate these
  point,
  trigger
};
