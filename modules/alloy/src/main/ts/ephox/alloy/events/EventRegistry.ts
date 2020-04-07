import { Fun, Obj, Option } from '@ephox/katamari';
import { Element, TransformFind } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

export interface ElementAndHandler {
  readonly element: Element;
  readonly descHandler: CurriedHandler;
}

const eventHandler = (element: Element, descHandler: CurriedHandler): ElementAndHandler => ({
  element,
  descHandler
});

export interface CurriedHandler {
  readonly purpose: () => string;
  readonly cHandler: Function;
}

export interface UncurriedHandler {
  readonly purpose: () => string;
  readonly handler: Function;
}

export interface UidAndHandler {
  readonly id: () => string;
  readonly descHandler: () => CurriedHandler;
}

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => ({
  id: Fun.constant(id),
  descHandler: Fun.constant(handler)
});

export type EventName = string;
export type Uid = string;

export default () => {
  const registry: Record<EventName, Record<Uid, CurriedHandler>> = { };

  const registerId = (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => {
    Obj.each(events, (v: UncurriedHandler, k: EventName) => {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  const findHandler = (handlers: Option<Record<Uid, CurriedHandler>>, elem: Element): Option<ElementAndHandler> =>
    Tagger.read(elem).fold(
      () => Option.none(),
      (id) => handlers.bind((h) => Obj.get(h, id)).
        map((descHandler: CurriedHandler) => eventHandler(elem, descHandler))
    );

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] =>
    Obj.get(registry, type).
      map((handlers) => Obj.mapToArray(handlers, (f, id) => broadcastHandler(id, f))).
      getOr([ ]);

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (elem: Element) => boolean, type: string, target: Element): Option<ElementAndHandler> => {
    const handlers = Obj.get(registry, type);
    return TransformFind.closest(target, (elem: Element) => findHandler(handlers, elem), isAboveRoot);
  };

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById: Record<string, CurriedHandler>, _eventName) => {
      if (handlersById.hasOwnProperty(id)) { delete handlersById[id]; }
    });
  };

  return {
    registerId,
    unregisterId,
    filterByType,
    find
  };
};
