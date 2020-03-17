import { Event, Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { EventArgs, EventFilter, EventHandler, EventUnbinder } from '../api/events/Types';
import Element from '../api/node/Element';

const mkEvent = (target: Element, x: number, y: number, stop: () => void, prevent: () => void, kill: () => void, raw: Event): EventArgs =>
  // switched from a struct to manual Fun.constant() because we are passing functions now, not just values
  ({
    target:  Fun.constant(target),
    x:       Fun.constant(x),
    y:       Fun.constant(y),
    stop,
    prevent,
    kill,
    raw:     Fun.constant(raw)
  })
;

const fromRawEvent = (rawEvent: Event) => {
  const target = Element.fromDom(rawEvent.target as Node);

  const stop = function () {
    rawEvent.stopPropagation();
  };

  const prevent = function () {
    rawEvent.preventDefault();
  };

  const kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

  // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
  return mkEvent(target, (rawEvent as any).clientX, (rawEvent as any).clientY, stop, prevent, kill, rawEvent);
};

const handle = function (filter: EventFilter, handler: EventHandler) {
  return function (rawEvent) {
    if (!filter(rawEvent)) { return; }
    handler(fromRawEvent(rawEvent));
  };
};

const binder = function (element: Element, event: string, filter: EventFilter, handler: EventHandler, useCapture: boolean): EventUnbinder {
  const wrapped = handle(filter, handler);
  // IE9 minimum
  element.dom().addEventListener(event, wrapped, useCapture);

  return {
    unbind: Fun.curry(unbind, element, event, wrapped, useCapture)
  };
};

const bind = function (element: Element, event: string, filter: EventFilter, handler: EventHandler) {
  return binder(element, event, filter, handler, false);
};

const capture = function (element: Element, event: string, filter: EventFilter, handler: EventHandler) {
  return binder(element, event, filter, handler, true);
};

const unbind = function (element: Element, event: string, handler: EventHandler, useCapture: boolean) {
  // IE9 minimum
  element.dom().removeEventListener(event, handler, useCapture);
};

export { bind, capture, fromRawEvent };
