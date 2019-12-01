import { Fun, Obj, Option, Struct } from '@ephox/katamari';
import { Element, TransformFind } from '@ephox/sugar';

import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

export interface ElementAndHandler {
  element: () => Element;
  descHandler: () => CurriedHandler;
}

const eventHandler: (element: Element, descHandler: CurriedHandler) => ElementAndHandler =
  Struct.immutable('element', 'descHandler');

export interface CurriedHandler {
  purpose: () => string;
  cHandler: Function;
}

export interface UncurriedHandler {
  purpose: () => string;
  handler: Function;
}

export interface UidAndHandler {
  id: () => string;
  descHandler: () => CurriedHandler;
}

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => {
  return {
    id: Fun.constant(id),
    descHandler: Fun.constant(handler)
  };
};

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

  const findHandler = (handlers: Option<Record<Uid, CurriedHandler>>, elem: Element): Option<ElementAndHandler> => {
    return Tagger.read(elem).fold(() => {
      return Option.none();
    }, (id) => {
      return handlers.bind((h) => Obj.get(h, id)).map((descHandler: CurriedHandler) => {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] => {
    return Obj.get(registry, type).map((handlers) => {
      return Obj.mapToArray(handlers, (f, id) => {
        return broadcastHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (elem: Element) => boolean, type: string, target: Element): Option<ElementAndHandler> => {
    const handlers = Obj.get(registry, type) as Option<Record<string, CurriedHandler>>;
    return TransformFind.closest(target, (elem: Element) => {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById: Record<string, CurriedHandler>, eventName) => {
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
