import { Adt, Arr, Cell, Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';

import { DebuggerLogger } from '../debugging/Debugging';
import * as DescribedHandler from './DescribedHandler';
import { ElementAndHandler, UidAndHandler } from './EventRegistry';
import * as EventSource from './EventSource';
import { EventFormat, fromExternal, fromSource } from './SimulatedEvent';

type LookupEvent = (eventName: string, target: Element) => Option<ElementAndHandler>;

export interface TriggerAdt {
  fold: <T>(
    stopped: () => T,
    resume: (elem: Element) => T,
    complete: () => T
  ) => T;
  match: <T> (branches: {
    stopped: () => T;
    resume: (elem: Element) => T;
    complete: () => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  stopped: () => TriggerAdt;
  resume: (elem: Element) => TriggerAdt;
  complete: () => TriggerAdt;
} = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]);

const doTriggerHandler = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, target: Element, source: Cell<Element>, logger: DebuggerLogger): TriggerAdt => {
  const handler = lookup(eventType, target);

  const simulatedEvent = fromSource(rawEvent, source);

  return handler.fold(() => {
    // No handler, so complete.
    logger.logEventNoHandlers(eventType, target);
    return adt.complete();
  }, (handlerInfo) => {
    const descHandler = handlerInfo.descHandler;
    const eventHandler = DescribedHandler.getCurried(descHandler);
    eventHandler(simulatedEvent);

    // Now, check if the event was stopped.
    if (simulatedEvent.isStopped()) {
      logger.logEventStopped(eventType, handlerInfo.element, descHandler.purpose());
      return adt.stopped();
    } else if (simulatedEvent.isCut()) {
      logger.logEventCut(eventType, handlerInfo.element, descHandler.purpose());
      return adt.complete();
    } else {
      return Traverse.parent(handlerInfo.element).fold(() => {
        logger.logNoParent(eventType, handlerInfo.element, descHandler.purpose());
        // No parent, so complete.
        return adt.complete();
      }, (parent) => {
        logger.logEventResponse(eventType, handlerInfo.element, descHandler.purpose());
        // Resume at parent
        return adt.resume(parent);
      });
    }
  });
};

const doTriggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: Element, source: Cell<Element>, logger: DebuggerLogger): boolean => doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(() =>
// stopped.
  true
, (parent) =>
// Go again.
  doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger)
, () =>
// completed
  false
);

const triggerHandler = <T extends EventFormat>(lookup: LookupEvent, eventType: string, rawEvent: T, target: Element, logger: DebuggerLogger): TriggerAdt => {
  const source = EventSource.derive(rawEvent, target);
  return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
};

const broadcast = (listeners: UidAndHandler[], rawEvent: EventFormat, logger?: DebuggerLogger): boolean => {
  const simulatedEvent = fromExternal(rawEvent);

  Arr.each(listeners, (listener) => {
    const descHandler = listener.descHandler();
    const handler = DescribedHandler.getCurried(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

const triggerUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, logger: DebuggerLogger): boolean => {
  const rawTarget = rawEvent.target();
  return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
};

const triggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: Element, logger: DebuggerLogger): boolean => {
  const source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export {
  triggerHandler,
  triggerUntilStopped,
  triggerOnUntilStopped,
  broadcast
};
