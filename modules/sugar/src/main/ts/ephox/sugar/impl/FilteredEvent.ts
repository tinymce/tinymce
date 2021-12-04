import { Fun } from '@ephox/katamari';

import { EventArgs, EventFilter, EventHandler, EventUnbinder } from '../api/events/Types';
import { SugarElement } from '../api/node/SugarElement';
import * as SugarShadowDom from '../api/node/SugarShadowDom';

type WrappedHandler<T> = (rawEvent: T) => void;

const mkEvent = <E extends Event, T extends Node | Window>(
  target: SugarElement<T>,
  x: E extends { clientX: number } ? number : undefined,
  y: E extends { clientY: number } ? number : undefined,
  stop: () => void,
  prevent: () => void,
  kill: () => void,
  raw: E
): EventArgs<E, T> => ({
  target,
  x,
  y,
  stop,
  prevent,
  kill,
  raw
});

/** Wraps an Event in an EventArgs structure.
 * The returned EventArgs structure has its target set to the "original" target if possible.
 * See SugarShadowDom.getOriginalEventTarget
 */
const fromRawEvent = <E extends Event, T extends Node | Window = Node>(rawEvent: E): EventArgs<E, T> => {
  const target = SugarElement.fromDom(SugarShadowDom.getOriginalEventTarget(rawEvent).getOr(rawEvent.target) as T);

  const stop = () => rawEvent.stopPropagation();

  const prevent = () => rawEvent.preventDefault();

  const kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

  // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
  return mkEvent(target, (rawEvent as any).clientX, (rawEvent as any).clientY, stop, prevent, kill, rawEvent);
};

const handle = <E extends Event, T extends Node | Window>(filter: EventFilter<E>, handler: EventHandler<E, T>): WrappedHandler<E> => (rawEvent: E) => {
  if (filter(rawEvent)) {
    handler(fromRawEvent<E, T>(rawEvent));
  }
};

const binder = <E extends Event, T extends Node | Window>(element: SugarElement<EventTarget>, event: string, filter: EventFilter<E>, handler: EventHandler<E, T>, useCapture: boolean): EventUnbinder => {
  const wrapped = handle<E, T>(filter, handler);
  // IE9 minimum
  element.dom.addEventListener(event, wrapped as EventListener, useCapture);

  return {
    unbind: Fun.curry(unbind, element, event, wrapped, useCapture)
  };
};

const bind = <E extends Event, T extends Node | Window>(element: SugarElement<EventTarget>, event: string, filter: EventFilter<E>, handler: EventHandler<E, T>): EventUnbinder =>
  binder<E, T>(element, event, filter, handler, false);

const capture = <E extends Event, T extends Node | Window>(element: SugarElement<EventTarget>, event: string, filter: EventFilter<E>, handler: EventHandler<E, T>): EventUnbinder =>
  binder<E, T>(element, event, filter, handler, true);

const unbind = <E extends Event>(element: SugarElement<EventTarget>, event: string, handler: WrappedHandler<E>, useCapture: boolean) => {
  // IE9 minimum
  element.dom.removeEventListener(event, handler as EventListener, useCapture);
};

export { bind, capture, fromRawEvent };
