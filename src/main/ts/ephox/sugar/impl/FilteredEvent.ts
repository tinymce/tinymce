import { Fun } from '@ephox/katamari';
import Element from '../api/node/Element';

const mkEvent = function (target, x, y, stop, prevent, kill, raw) {
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

const handle = function (filter, handler) {
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

const binder = function (element, event, filter, handler, useCapture) {
  const wrapped = handle(filter, handler);
  // IE9 minimum
  element.dom().addEventListener(event, wrapped, useCapture);

  return {
    unbind: Fun.curry(unbind, element, event, wrapped, useCapture)
  };
};

const bind = function (element, event, filter, handler) {
  return binder(element, event, filter, handler, false);
};

const capture = function (element, event, filter, handler) {
  return binder(element, event, filter, handler, true);
};

const unbind = function (element, event, handler, useCapture) {
  // IE9 minimum
  element.dom().removeEventListener(event, handler, useCapture);
};

export {
  bind,
  capture,
};