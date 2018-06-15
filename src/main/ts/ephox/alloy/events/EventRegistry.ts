import { Objects } from '@ephox/boulder';
import { Fun, Obj, Option, Struct } from '@ephox/katamari';

import * as TransformFind from '../alien/TransformFind';
import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

const eventHandler = Struct.immutable('element', 'descHandler');

export interface CurriedHandler {
  purpose: string;
  cHandler: Function;
}

export class UncurriedHandler {
  purpose: string;
  handler: Function;
}

export interface MessageHandler {
  id: () => string;
  descHandler: () => any;
}

const messageHandler = (id: string, handler): MessageHandler => {
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

  const findHandler = (handlers, elem) => {
    return Tagger.read(elem).fold(() => {
      return Option.none();
    }, (id) => {
      const reader = Objects.readOpt(id);
      return handlers.bind(reader).map((descHandler) => {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type) => {
    return Objects.readOptFrom(registry, type).map((handlers) => {
      return Obj.mapToArray(handlers, (f, id) => {
        return messageHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  const find = (isAboveRoot, type, target) => {
    const readType = Objects.readOpt(type);
    const handlers = readType(registry);
    return TransformFind.closest(target, (elem) => {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById, eventName) => {
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