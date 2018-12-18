import { Document, HTMLElement, MouseEvent, window } from '@ephox/dom-globals';
import { Element, Location } from '@ephox/sugar';

const LEFT_CLICK = 0;
const RIGHT_CLICK = 2;

// Note: This can be used for phantomjs.
const trigger = function (element: Element) {
  const ele: HTMLElement = element.dom();
  if (ele.click !== undefined) return ele.click();
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  point('click', LEFT_CLICK, element, 0, 0);
  return undefined;
};

const point = function (type: string, button: number, element: Element, x: number, y: number) {
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  const ev: MouseEvent = (<Document>element.dom().ownerDocument).createEvent('MouseEvents');
  ev.initMouseEvent(
    type,
    true /* bubble */, true /* cancelable */,
    window, null,
    x, y, x, y, /* coordinates */
    false, false, false, false, /* modifier keys */
    button, null
  );
  element.dom().dispatchEvent(ev);
};

const click = function (eventType: string, button: number) {
  return function (element: Element) {
    const position = Location.absolute(element);
    point(eventType, button, element, position.left(), position.top());
  }
}

const clickAt = function (eventType: string, button: number) {
  return function (dx: number, dy: number) {
    return function (element: Element) {
      const position = Location.absolute(element);
      point(eventType, button, element, position.left() + dx, position.top() + dy);
    }
  }
}


const mousedown = click('mousedown', LEFT_CLICK);
const mouseup = click('mouseup', LEFT_CLICK);
const mouseupTo = clickAt('mouseup', LEFT_CLICK);
const mousemove = click('mousemove', LEFT_CLICK);
const mousemoveTo = clickAt('mousemove', LEFT_CLICK);
const mouseover = click('mouseover', LEFT_CLICK);
const mouseout = click('mouseout', LEFT_CLICK);
const contextmenu = click('contextmenu', RIGHT_CLICK);

export {
  trigger,
  mousedown,
  mouseup,
  mouseupTo,
  mousemove,
  mousemoveTo,
  mouseover,
  mouseout,
  contextmenu,
  point
};