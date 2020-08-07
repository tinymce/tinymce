import { Obj, Optional } from '@ephox/katamari';
import { SugarElement, TransformFind } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

export interface ElementAndHandler {
  readonly element: SugarElement;
  readonly descHandler: CurriedHandler;
}

const eventHandler = (element: SugarElement, descHandler: CurriedHandler): ElementAndHandler => ({
  element,
  descHandler
});

export interface CurriedHandler {
  readonly purpose: string;
  readonly cHandler: Function;
}

export interface UncurriedHandler {
  readonly purpose: string;
  readonly handler: Function;
}

export interface UidAndHandler {
  readonly id: string;
  readonly descHandler: CurriedHandler;
}

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => ({
  id,
  descHandler: handler
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

  const findHandler = (handlers: Optional<Record<Uid, CurriedHandler>>, elem: SugarElement): Optional<ElementAndHandler> =>
    Tagger.read(elem).fold(
      () => Optional.none(),
      (id) => handlers.bind((h) => Obj.get(h, id)).
        map((descHandler: CurriedHandler) => eventHandler(elem, descHandler))
    );

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] =>
    Obj.get(registry, type).
      map((handlers) => Obj.mapToArray(handlers, (f, id) => broadcastHandler(id, f))).
      getOr([ ]);

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (elem: SugarElement) => boolean, type: string, target: SugarElement): Optional<ElementAndHandler> => {
    const handlers = Obj.get(registry, type);
    return TransformFind.closest(target, (elem: SugarElement) => findHandler(handlers, elem), isAboveRoot);
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
