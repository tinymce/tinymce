import { Document, Touch, TouchEvent, UIEvent, window } from '@ephox/dom-globals';
import { Element, Location, Node, Traverse } from '@ephox/sugar';

const point = (type: string, element: Element<any>, x: number, y: number): void => {
  const touch = {
    identifier: Date.now(),
    target: element.dom(),
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5
  };

  // Adapted from https://stackoverflow.com/a/42447620/11275515
  if (typeof TouchEvent === 'function' && typeof Touch === 'function') {
    // @ts-ignore
    const touchAction = new Touch(touch);
    const ev: TouchEvent = new TouchEvent(type, {
      cancelable: true,
      bubbles: true,
      view: window,
      touches: [ touchAction ],
      targetTouches: [],
      changedTouches: [ touchAction ]
    });
    element.dom().dispatchEvent(ev);
  } else {
    // No native touch event support, so we need to simulate with a UIEvent
    let ev: any;
    if (typeof UIEvent === 'function') {
      ev = new UIEvent(type, {
        cancelable: true,
        bubbles: true,
        view: window
      } as any);
    } else {
      // IE 11 doesn't support the UIEvent constructor, so we need to fallback to using createEvent
      ev = (<Document> element.dom().ownerDocument).createEvent('UIEvent');
      ev.initUIEvent(type, true, true, window, null);
    }
    // Patch in the touch properties
    ev.touches = [ touch ];
    ev.targetTouches = [];
    ev.changedTouches = [ touch ];
    element.dom().dispatchEvent(ev);
  }
};

const touch = (eventType: string) => (element: Element<any>): void => {
  const position = Location.absolute(Node.isText(element) ? Traverse.parent(element).getOrDie() : element);
  point(eventType, element, position.left(), position.top());
};

const touchAt = (eventType: string) => (dx: number, dy: number) => (element: Element<any>): void => {
  const position = Location.absolute(Node.isText(element) ? Traverse.parent(element).getOrDie() : element);
  point(eventType, element, position.left() + dx, position.top() + dy);
};

const touchstart = touch('touchstart');
const touchstartAt = touchAt('touchstart');
const touchend = touch('touchend');
const touchendAt = touchAt('touchend');
const touchmove = touch('touchmove');
const touchmoveTo = touchAt('touchmove');

export {
  touchstart,
  touchstartAt,
  touchend,
  touchendAt,
  touchmove,
  touchmoveTo,
  point
};
