import { Adt, Arr, Cell, Fun, Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import { DebuggerLogger } from '../debugging/Debugging';
import * as DescribedHandler from './DescribedHandler';
import { ElementAndHandler, UidAndHandler } from './EventRegistry';
import * as EventSource from './EventSource';
import { EventFormat, fromExternal, fromSource } from './SimulatedEvent';

type LookupEvent = (eventName: string, target: SugarElement<Node>) => Optional<ElementAndHandler>;

export interface TriggerAdt {
  fold: <T>(
    stopped: () => T,
    resume: (elem: SugarElement<Node & ParentNode>) => T,
    complete: () => T
  ) => T;
  match: <T> (branches: {
    stopped: () => T;
    resume: (elem: SugarElement<Node & ParentNode>) => T;
    complete: () => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  stopped: () => TriggerAdt;
  resume: (elem: SugarElement<Node & ParentNode>) => TriggerAdt;
  complete: () => TriggerAdt;
} = Adt.generate([
  { stopped: [ ] },
  { resume: [ 'element' ] },
  { complete: [ ] }
]);

const doTriggerHandler = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, target: SugarElement<Node>, source: Cell<SugarElement<Node>>, logger: DebuggerLogger): TriggerAdt => {
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
      logger.logEventStopped(eventType, handlerInfo.element, descHandler.purpose);
      return adt.stopped();
    } else if (simulatedEvent.isCut()) {
      logger.logEventCut(eventType, handlerInfo.element, descHandler.purpose);
      return adt.complete();
    } else {
      return Traverse.parent(handlerInfo.element).fold(() => {
        logger.logNoParent(eventType, handlerInfo.element, descHandler.purpose);
        // No parent, so complete.
        return adt.complete();
      }, (parent) => {
        logger.logEventResponse(eventType, handlerInfo.element, descHandler.purpose);
        // Resume at parent
        return adt.resume(parent);
      });
    }
  });
};

const doTriggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: SugarElement<Node>, source: Cell<SugarElement<Node>>, logger: DebuggerLogger): boolean =>
  doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(
    // stopped.
    Fun.always,
    // Go again.
    (parent) => doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger),
    // completed
    Fun.never
  );

const triggerHandler = <T extends EventFormat>(lookup: LookupEvent, eventType: string, rawEvent: T, target: SugarElement<Node>, logger: DebuggerLogger): TriggerAdt => {
  const source = EventSource.derive(rawEvent, target);
  return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
};

const broadcast = (listeners: UidAndHandler[], rawEvent: EventFormat, _logger?: DebuggerLogger): boolean => {
  const simulatedEvent = fromExternal(rawEvent);

  Arr.each(listeners, (listener) => {
    const descHandler = listener.descHandler;
    const handler = DescribedHandler.getCurried(descHandler);
    handler(simulatedEvent);
  });

  return simulatedEvent.isStopped();
};

const triggerUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, logger: DebuggerLogger): boolean =>
  triggerOnUntilStopped(lookup, eventType, rawEvent, rawEvent.target, logger);

const triggerOnUntilStopped = (lookup: LookupEvent, eventType: string, rawEvent: EventFormat, rawTarget: SugarElement<Node>, logger: DebuggerLogger): boolean => {
  const source = EventSource.derive(rawEvent, rawTarget);
  return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
};

export {
  triggerHandler,
  triggerUntilStopped,
  triggerOnUntilStopped,
  broadcast
};
