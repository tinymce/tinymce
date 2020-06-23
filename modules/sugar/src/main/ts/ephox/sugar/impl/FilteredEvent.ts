import { Event, Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { EventArgs, EventFilter, EventHandler, EventUnbinder } from '../api/events/Types';
import Element from '../api/node/Element';
import * as ShadowDom from '../api/node/ShadowDom';

type WrappedHandler<T> = (rawEvent: T) => void;

const mkEvent = <T extends Event>(target: Element, x: number, y: number, stop: () => void, prevent: () => void, kill: () => void, raw: T): EventArgs<T> =>
  // switched from a struct to manual Fun.constant() because we are passing functions now, not just values
  ({
    target:  Fun.constant(target),
    x:       Fun.constant(x),
    y:       Fun.constant(y),
    stop,
    prevent,
    kill,
    raw:     Fun.constant(raw)
  });

/** Wraps an Event in an EventArgs structure.
 * The returned EventArgs structure has its target set to the "original" target if possible.
 * See ShadowDom.getOriginalEventTarget
 */
const fromRawEvent = <T extends Event>(rawEvent: T) => {
  const target = Element.fromDom(ShadowDom.getOriginalEventTarget(rawEvent).getOr(rawEvent.target) as Node);

  const stop = () => rawEvent.stopPropagation();

  const prevent = () => rawEvent.preventDefault();

  const kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

  // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
  return mkEvent(target, (rawEvent as any).clientX, (rawEvent as any).clientY, stop, prevent, kill, rawEvent);
};

const handle = <T extends Event>(filter: EventFilter<T>, handler: EventHandler<T>): WrappedHandler<T> => (rawEvent: T) => {
  if (filter(rawEvent)) {
    handler(fromRawEvent<T>(rawEvent));
  }
};

const binder = <T extends Event>(element: Element, event: string, filter: EventFilter<T>, handler: EventHandler<T>, useCapture: boolean): EventUnbinder => {
  const wrapped = handle(filter, handler);
  // IE9 minimum
  element.dom().addEventListener(event, wrapped, useCapture);

  return {
    unbind: Fun.curry(unbind, element, event, wrapped, useCapture)
  };
};

const bind = <T extends Event>(element: Element, event: string, filter: EventFilter<T>, handler: EventHandler<T>) =>
  binder<T>(element, event, filter, handler, false);

const capture = <T extends Event>(element: Element, event: string, filter: EventFilter<T>, handler: EventHandler<T>) =>
  binder<T>(element, event, filter, handler, true);

const unbind = <T extends Event>(element: Element, event: string, handler: WrappedHandler<T>, useCapture: boolean) => {
  // IE9 minimum
  element.dom().removeEventListener(event, handler, useCapture);
};

export { bind, capture, fromRawEvent };
