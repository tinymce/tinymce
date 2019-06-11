import { Fun } from '@ephox/katamari';
import { EventArgs, EventFilter, EventHandler, EventUnbinder } from '../api/events/Types';
import Element from '../api/node/Element';

const mkEvent = (target: Element, x: number, y: number, stop: () => void, prevent: () => void, kill: () => void, raw: () => any): EventArgs => {
  // switched from a struct to manual Fun.constant() because we are passing functions now, not just values
  return {
    target:  Fun.constant(target),
    x:       Fun.constant(x),
    y:       Fun.constant(y),
    stop,
    prevent,
    kill,
    raw:     Fun.constant(raw)
  };
};

const handle = function (filter: EventFilter, handler: EventHandler) {
  return function (rawEvent) {
    if (!filter(rawEvent)) { return; }

    // IE9 minimum
    const target = Element.fromDom(rawEvent.target);

    const stop = function () {
      rawEvent.stopPropagation();
    };

    const prevent = function () {
      rawEvent.preventDefault();
    };

    const kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

    // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
    const evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
    handler(evt);
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

export { bind, capture };
