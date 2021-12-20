import { Obj, Optional } from '@ephox/katamari';
import { SugarElement, TransformFind } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

export interface ElementAndHandler {
  readonly element: SugarElement<Node>;
  readonly descHandler: CurriedHandler;
}

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

export interface EventRegistry {
  readonly registerId: (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => void;
  readonly unregisterId: (id: string) => void;
  readonly filterByType: (type: string) => UidAndHandler[];
  readonly find: (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>) => Optional<ElementAndHandler>;
}

const eventHandler = (element: SugarElement<Node>, descHandler: CurriedHandler): ElementAndHandler => ({
  element,
  descHandler
});

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => ({
  id,
  descHandler: handler
});

export type EventName = string;
export type Uid = string;

export const EventRegistry = (): EventRegistry => {
  const registry: Record<EventName, Record<Uid, CurriedHandler>> = { };

  const registerId = (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => {
    Obj.each(events, (v: UncurriedHandler, k: EventName) => {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  const findHandler = (handlers: Record<Uid, CurriedHandler>, elem: SugarElement<Node>): Optional<ElementAndHandler> =>
    Tagger.read(elem)
      .bind((id) => Obj.get(handlers, id))
      .map((descHandler) => eventHandler(elem, descHandler));

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] =>
    Obj.get(registry, type)
      .map((handlers) => Obj.mapToArray(handlers, (f, id) => broadcastHandler(id, f)))
      .getOr([ ]);

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (elem: SugarElement<Node>) => boolean, type: string, target: SugarElement<Node>): Optional<ElementAndHandler> =>
    Obj.get(registry, type)
      .bind((handlers) => TransformFind.closest(target, (elem) => findHandler(handlers, elem), isAboveRoot));

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById, _eventName) => {
      if (Obj.has(handlersById, id)) {
        delete handlersById[id];
      }
    });
  };

  return {
    registerId,
    unregisterId,
    filterByType,
    find
  };
};
